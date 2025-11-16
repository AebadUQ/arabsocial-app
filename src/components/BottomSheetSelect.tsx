import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/theme/ThemeContext";
import { CaretDown, Check } from "phosphor-react-native";
import { theme } from "@/theme/theme";

type Option = string | { label: string; value: string };

type Props = {
  label?: string;
  labelColor?: string;
  value?: string | null;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  placeholderTextColor?: string;
  sheetTitle?: string;
  containerStyle?: any;
  fieldStyle?: any;
  textStyle?: any;
  searchable?: boolean; // show search input if true
};

const BottomSheetSelect: React.FC<Props> = ({
  label,
  labelColor = "#FFFFFF",
  value,
  onChange,
  options,
  placeholder = "Select",
  placeholderTextColor,
  sheetTitle = "Select Option",
  containerStyle,
  fieldStyle,
  textStyle,
  searchable = false,
}) => {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selected, setSelected] = useState<string | null>(value ?? null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  // normalize options to { label, value }
  const normalized = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt
      ),
    [options]
  );

  // filter when searchable
  const filteredOptions = useMemo(
    () =>
      searchable
        ? normalized.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
          )
        : normalized,
    [normalized, search, searchable]
  );

  const activeLabel =
    normalized.find((o) => o.value === selected)?.label ?? "";

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
    if (searchable) setSearch("");
  }, [searchable]);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleSelect = (val: string) => {
    setSelected(val);
    onChange(val);
    closeSheet();
  };

  // fixed snap height (no content-based shrinking)
  const snapPoints = useMemo(() => ["60%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.2}
        pressBehavior="close"
      />
    ),
    []
  );

  const placeholderColor =
    placeholderTextColor ?? theme.colors.placeholder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openSheet}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.background,
            // shadowColor: "#000",
            // shadowOpacity: 0.08,
            // shadowRadius: 8,
            // shadowOffset: { width: 0, height: 3 },
            // elevation: 2,
          },
          fieldStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.valueText,
            {
              color: activeLabel
                ? theme.colors.text
                : placeholderColor,
            },
            textStyle,
          ]}
        >
          {activeLabel || placeholder}
        </Text>
        <CaretDown size={18} color={theme.colors.primary} />
      </TouchableOpacity>

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.primary,
        }}
        // 👇 keyboard behavior: stay fixed, move interactively with keyboard
        keyboardBehavior="interactive"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
      >
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <Text
            style={[
              styles.sheetTitle,
              { color: theme.colors.text },
            ]}
          >
            {sheetTitle}
          </Text>

          {searchable && (
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={theme.colors.placeholder}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.borderColor,
                },
              ]}
            />
          )}

          <BottomSheetFlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: theme.colors.borderColor,
                  opacity: 0.5,
                }}
              />
            )}
            renderItem={({ item }) => {
              const isActive = item.value === selected;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    isActive && {
                      backgroundColor: "#1BAD7A22",
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: theme.colors.text,
                    }}
                  >
                    {item.label}
                  </Text>
                  {isActive && (
                    <Check
                      size={18}
                      color={theme.colors.primary}
                      weight="bold"
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  field: {
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
borderWidth:0.5,
    borderColor:theme.colors.primary,
    borderRadius:50,

    
  },
  valueText: {
     flex: 1,
    color: theme.colors.placeholder,
    fontSize: theme.typography.fontSize.v5,
    paddingVertical: 12,  
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 6,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});

export default BottomSheetSelect;
