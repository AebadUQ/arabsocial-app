import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Text } from "@/components";
import CustomBottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/theme/ThemeContext";
import {
  CaretDown as CaretDownIcon,
  Check as CheckIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
} from "phosphor-react-native";
import { Country, City } from "country-state-city";

type Props = {
  visible: boolean;
  onClose: () => void;
  initialCountryName?: string;
  initialCities?: string[];
  onApply: (params: { countryName: string; cities: string }) => void;
};

const StateFilterSheet: React.FC<Props> = ({
  visible,
  onClose,
  initialCountryName = "United States", // DEFAULT COUNTRY UPDATED
  initialCities = [],
  onApply,
}) => {
  const { theme } = useTheme();

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const countryAnim = useRef(new Animated.Value(0)).current;
  const cityAnim = useRef(new Animated.Value(0)).current;

  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const mappedCountries = useMemo(
    () =>
      allCountries.map((c) => ({
        code: c.isoCode,
        name: c.name,
      })),
    [allCountries]
  );

  // ---------- FIXED MATCH LOGIC ----------
  const initialCountry =
    mappedCountries.find(
      (c) => c.name.toLowerCase() === initialCountryName.toLowerCase()
    ) ||
    mappedCountries.find((c) =>
      c.name.toLowerCase().includes(initialCountryName.toLowerCase())
    ) ||
    mappedCountries.find((c) => c.code === "US") ||
    null;

  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    name: string;
  } | null>(initialCountry);

  const [selectedCountryName, setSelectedCountryName] = useState<string>(
    initialCountry?.name || ""
  );
  const [selected, setSelected] = useState<string[]>(initialCities);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const countryCities = useMemo(() => {
    if (!selectedCountry?.code) return [];
    return (City.getCitiesOfCountry(selectedCountry.code) ?? []).map(
      (c) => c.name
    );
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.toLowerCase().trim();
    if (!q) return mappedCountries;
    return mappedCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countryQuery, mappedCountries]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    if (!q) return countryCities;
    return countryCities.filter((c) => c.toLowerCase().includes(q));
  }, [cityQuery, countryCities]);

  const toggleCity = (name: string) =>
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );

  const allShownSelected =
    filteredCities.length > 0 &&
    filteredCities.every((c) => selected.includes(c));

  const toggleAllShown = () => {
    if (allShownSelected) {
      setSelected((prev) =>
        prev.filter((c) => !filteredCities.includes(c))
      );
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...filteredCities])));
    }
  };

  const handleSelectCountry = (country: { code: string; name: string }) => {
    setSelectedCountry(country);
    setSelectedCountryName(country.name);
    setSelected([]);
    setCityQuery("");
    setCityOpen(true);
    setCountryOpen(false);
  };

  // ---------- ANIMATIONS ----------
  useEffect(() => {
    Animated.timing(countryAnim, {
      toValue: countryOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [countryOpen]);

  useEffect(() => {
    Animated.timing(cityAnim, {
      toValue: cityOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [cityOpen]);

  const countryHeight = countryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const cityHeight = cityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  return (
    <CustomBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        {/* ---------- COUNTRY SELECTOR ---------- */}
        {!countryOpen && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setCountryOpen(true);
              setCityOpen(false);
            }}
            style={[
              styles.headerRow,
              { borderColor: theme.colors.borderColor },
            ]}
          >
            <Text variant="body1">
              {selectedCountryName || "Select Country"}
            </Text>
            <CaretDownIcon size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        <Animated.View
          style={[
            styles.dropdown,
            {
              borderColor: theme.colors.borderColor,
              height: countryHeight,
              overflow: "hidden",
            },
          ]}
        >
          {countryOpen && (
            <>
              <View
                style={[
                  styles.searchRow,
                  { borderColor: theme.colors.borderColor },
                ]}
              >
                <TextInput
                  value={countryQuery}
                  onChangeText={setCountryQuery}
                  placeholder="Search countries..."
                  placeholderTextColor={theme.colors.textLight}
                  style={[styles.searchInput, { color: theme.colors.text }]}
                />
                <MagnifyingGlassIcon
                  size={18}
                  color={theme.colors.textLight}
                />
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingVertical: 6 }}
              >
                {filteredCountries.map((c) => {
                  const active = c.name === selectedCountryName;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => handleSelectCountry(c)}
                      style={styles.itemRow}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: theme.colors.borderColor,
                            backgroundColor: active
                              ? theme.colors.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {active && <CheckIcon size={14} color="#fff" />}
                      </View>
                      <Text
                        style={{
                          color: active
                            ? theme.colors.primaryDark
                            : theme.colors.text,
                          fontWeight: active ? "600" : "400",
                        }}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Animated.View>

        {/* ---------- CITY SELECTOR ---------- */}
        {!cityOpen && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setCityOpen(true);
              setCountryOpen(false);
            }}
            style={[
              styles.headerRow,
              { borderColor: theme.colors.borderColor },
            ]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
              {selected.length > 0
                ? `${selected.length} selected`
                : "Select Cities"}
            </Text>
            <CaretDownIcon size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        <Animated.View
          style={[
            styles.dropdown,
            {
              borderColor: theme.colors.borderColor,
              height: cityHeight,
              overflow: "hidden",
            },
          ]}
        >
          {cityOpen && (
            <>
              <View
                style={[
                  styles.searchRow,
                  { borderColor: theme.colors.borderColor },
                ]}
              >
                <TextInput
                  value={cityQuery}
                  onChangeText={setCityQuery}
                  placeholder="Search cities..."
                  placeholderTextColor={theme.colors.textLight}
                  style={[styles.searchInput, { color: theme.colors.text }]}
                />
                <MagnifyingGlassIcon
                  size={18}
                  color={theme.colors.textLight}
                />
              </View>

              <TouchableOpacity
                onPress={toggleAllShown}
                style={styles.selectAllRow}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.colors.borderColor,
                      backgroundColor: allShownSelected
                        ? theme.colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {allShownSelected && (
                    <CheckIcon size={14} color="#fff" />
                  )}
                </View>
                <Text style={{ color: theme.colors.textLight }}>
                  Select all ({filteredCities.length})
                </Text>
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
              >
                {filteredCities.map((c, index) => {
                  const checked = selected.includes(c);
                  return (
                    <TouchableOpacity
                      key={`${c}-${index}`}
                      onPress={() => toggleCity(c)}
                      style={styles.itemRow}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: theme.colors.borderColor,
                            backgroundColor: checked
                              ? theme.colors.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {checked && (
                          <CheckIcon size={14} color="#fff" />
                        )}
                      </View>
                      <Text
                        style={{
                          color: checked
                            ? theme.colors.primaryDark
                            : theme.colors.textLight,
                        }}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Animated.View>

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={{ color: theme.colors.text }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.applyBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() =>
              onApply({
                countryName: selectedCountryName,
                cities: selected.join(","),
              })
            }
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomBottomSheet>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  headerRow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  dropdown: {
    borderRadius: 8,
    backgroundColor: "white",
  },
  searchRow: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "90%",
    alignSelf: "center",
  },
  searchInput: { flex: 1 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF1F3",
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StateFilterSheet;
