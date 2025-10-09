import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/theme/ThemeContext";
import { CaretDown, Check } from "phosphor-react-native";

type Option = string | { label: string; value: string };

type Props = {
  label?: string;
  labelColor?: string;                  // default #FFFFFF
  value?: string | null;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  placeholderTextColor?: string;        // NEW: match InputField API
  sheetTitle?: string;
  containerStyle?: any;                 // wrapper around label + field
  fieldStyle?: any;                     // box style (matches InputField.container)
  textStyle?: any;                      // value text style
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
}) => {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selected, setSelected] = useState<string | null>(value ?? null);

  useEffect(() => setSelected(value ?? null), [value]);

  const normalized = useMemo(
    () => options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt)),
    [options]
  );

  const activeLabel = normalized.find((o) => o.value === selected)?.label ?? "";

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => sheetRef.current?.dismiss(), []);

  const handleSelect = (val: string) => {
    setSelected(val);
    onChange(val);
    closeSheet();
  };

  const snapPoints = useMemo(() => ["40%"], []);

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

  const placeholderColor = placeholderTextColor ?? theme.colors.placeholder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openSheet}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.background,
            // 👇 match InputField subtle elevation
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          },
          fieldStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.valueText,
            {
              color: activeLabel ? theme.colors.text : placeholderColor,
            },
            textStyle,
          ]}
        >
          {activeLabel || placeholder}
        </Text>
        <CaretDown size={18} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
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
        handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      >
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>{sheetTitle}</Text>

          <BottomSheetFlatList
            data={normalized}
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
                  style={[styles.optionRow, isActive && { backgroundColor: "#1BAD7A22" }]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={{ flex: 1, color: theme.colors.text }}>{item.label}</Text>
                  {isActive && <Check size={18} color={theme.colors.primary} weight="bold" />}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { marginBottom: 6, fontSize: 14, fontWeight: "500" },
  // 👇 mirrors your InputField.container
  field: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // 👇 mirrors your InputField.input typographic scale & vertical padding
  valueText: { flex: 1, fontSize: 16, paddingVertical: 12 },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 6,
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
