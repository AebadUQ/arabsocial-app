// components/event/StateFilterSheet.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Text } from "@/components";
import CustomBottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/theme/ThemeContext";
import {
  CaretDown as CaretDownIcon,
  CaretUp as CaretUpIcon,
  Check as CheckIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
} from "phosphor-react-native";

type Country = {
  code: string;
  name: string;
  states: string[];
};

const COUNTRIES: Country[] = [
  {
    code: "AE",
    name: "United Arab Emirates",
    states: [
      "Dubai",
      "Ajman",
      "Sharjah",
      "Abu Dhabi",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al-Quwain",
      "Al Ain",
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    states: [
      "Riyadh",
      "Jeddah",
      "Mecca",
      "Medina",
      "Dammam",
      "Khobar",
      "Tabuk",
      "Abha",
    ],
  },
  {
    code: "OM",
    name: "Oman",
    states: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibri"],
  },
  {
    code: "QA",
    name: "Qatar",
    states: ["Doha", "Al Wakrah", "Al Khor", "Umm Salal"],
  },
  {
    code: "PK",
    name: "Pakistan",
    states: ["Sindh", "Punjab", "Balochistan", "KPK", "ICT", "Gilgit Baltistan"],
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  initialCountryCode?: string;
  initialStates?: string[];
  onApply: (params: { countryCode: string; states: string[] }) => void;
};

const StateFilterSheet: React.FC<Props> = ({
  visible,
  onClose,
  initialCountryCode = "AE",
  initialStates = [],
  onApply,
}) => {
  const { theme } = useTheme();

  // Dropdown toggles
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  // Data
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(initialStates) ? initialStates : []
  );

  // Search queries (separate for country & state)
  const [countryQuery, setCountryQuery] = useState("");
  const [stateQuery, setStateQuery] = useState("");

  // Current country object
  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode]
  );

  // Filtered lists
  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countryQuery]);

  const filteredStates = useMemo(() => {
  const q = stateQuery.trim().toLowerCase();
  const states = country?.states ?? []; // ✅ handles undefined country safely
  if (!q) return states;
  return states.filter((s) => s.toLowerCase().includes(q));
}, [country, stateQuery]);

  // Select logic
  const toggleState = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const allShownSelected =
    filteredStates.length > 0 &&
    filteredStates.every((s) => selected.includes(s));

  const toggleAllShown = () => {
    if (allShownSelected) {
      setSelected((prev) => prev.filter((s) => !filteredStates.includes(s)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...filteredStates])));
    }
  };

  const handleSelectCountry = (code: string) => {
    setCountryCode(code);
    setCountryOpen(false);
    setSelected([]);
    setStateQuery("");
    setStateOpen(true);
  };

  return (
    <CustomBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        {/* ===================== COUNTRY ===================== */}
        {!countryOpen && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setCountryOpen(true);
              setStateOpen(false);
            }}
            style={[
              styles.headerRow,
              { backgroundColor: "white", borderColor: theme.colors.borderColor },
            ]}
          >
            <Text variant="body1">{country?.name || "Select Country"}</Text>
            <CaretDownIcon size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        {countryOpen && (
          <View
            style={[
              styles.dropdown,
              { backgroundColor: "white", borderColor: theme.colors.borderColor },
            ]}
          >
            {/* Search */}
            <View
              style={[styles.searchRow, { borderColor: theme.colors.borderColor }]}
            >
              <TextInput
                value={countryQuery}
                onChangeText={setCountryQuery}
                placeholder="Search countries..."
                placeholderTextColor={theme.colors.textLight}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
              <MagnifyingGlassIcon size={18} color={theme.colors.textLight} />
            </View>

            {/* Country List */}
            <ScrollView
              style={{ maxHeight: 280 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 6 }}
            >
              {filteredCountries.map((c) => {
                const active = c.code === countryCode;
                return (
                 <TouchableOpacity
  key={c.code}
  onPress={() => handleSelectCountry(c.code)}
  activeOpacity={0.8}
  style={styles.itemRow}
>
  <View
    style={[
      styles.checkbox,
      {
        borderColor: theme.colors.borderColor,
        backgroundColor: active ? theme.colors.primary : "transparent",
      },
    ]}
  >
    {active ? <CheckIcon size={14} color="#fff" weight="bold" /> : null}
  </View>
  <Text
    variant="body1"
    style={{
      color: active ? theme.colors.primary : theme.colors.text,
      fontWeight: active ? "600" : "400",
    }}
  >
    {c.name}
  </Text>
</TouchableOpacity>

                );
              })}
              {filteredCountries.length === 0 && (
                <View style={{ paddingVertical: 16, alignItems: "center" }}>
                  <Text style={{ color: theme.colors.textLight }}>
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* ===================== STATE ===================== */}
        {!stateOpen && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setStateOpen(true);
              setCountryOpen(false);
            }}
            style={[
              styles.headerRow,
              { backgroundColor: "white", borderColor: theme.colors.borderColor },
            ]}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
              {selected.length > 0
                ? `${selected.length} selected`
                : "Select states"}
            </Text>
            <CaretDownIcon size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        {stateOpen && (
          <View
            style={[
              styles.dropdown,
              { backgroundColor: "white", borderColor: theme.colors.borderColor },
            ]}
          >
            {/* Search */}
            <View
              style={[styles.searchRow, { borderColor: theme.colors.borderColor }]}
            >
              <TextInput
                value={stateQuery}
                onChangeText={setStateQuery}
                placeholder="Search states..."
                placeholderTextColor={theme.colors.textLight}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
              <MagnifyingGlassIcon size={18} color={theme.colors.textLight} />
            </View>

            {/* Select All */}
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
                {allShownSelected ? (
                  <CheckIcon size={14} color="#fff" weight="bold" />
                ) : null}
              </View>
              <Text style={{ color: theme.colors.textLight }}>Select all</Text>
              <Text style={{ color: theme.colors.textLight }}>
                {" "}
                ({filteredStates.length})
              </Text>
            </TouchableOpacity>

            {/* State List */}
            <ScrollView
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {filteredStates.map((s) => {
                const checked = selected.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => toggleState(s)}
                    activeOpacity={0.8}
                    style={styles.itemRow}
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
                      {checked ? (
                        <CheckIcon size={14} color="#fff" weight="bold" />
                      ) : null}
                    </View>
                    <Text
                      variant="body1"
                      style={{
                        color: checked
                          ? theme.colors.primaryDark
                          : theme.colors.textLight,
                      }}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {filteredStates.length === 0 && (
                <View style={{ paddingVertical: 16, alignItems: "center" }}>
                  <Text style={{ color: theme.colors.textLight }}>
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* ===================== FOOTER ===================== */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={{ color: theme.colors.text }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => onApply({ countryCode, states: selected })}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomBottomSheet>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 16 },

  headerRow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
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

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
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
