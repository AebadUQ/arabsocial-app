// components/business/SearchBar.tsx
import React, { forwardRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  XCircle as XCircleIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";

type Props = {
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
};

const SearchBar = forwardRef<TextInput, Props>(({ value, onChange, onClear }, ref) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const dimText = theme.colors?.text ?? "#111827";

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(12, insets.top / 3) }]}>
      <View style={styles.searchBox}>
        <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          placeholder="Search businesses"
          placeholderTextColor="rgba(0,0,0,0.4)"
          style={[styles.searchInput, { color: dimText }]}
          returnKeyType="search"
        />
        {!!value && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <XCircleIcon size={18} weight="bold" color={"rgba(0,0,0,0.4)"} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default SearchBar;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: { flex: 1, paddingVertical: 0 },
});
