// components/common/AddFab.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Plus as PlusIcon } from "phosphor-react-native";

type Props = {
  onPress: () => void;
  color?: string;      // background color
  bottom?: number;     // y-offset from bottom
  style?: ViewStyle;   // extra style overrides
};

export default function AddFab({ onPress, color = "#1BAD7A", bottom = 32, style }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.fab, { backgroundColor: color, bottom }, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <PlusIcon size={26} weight="bold" color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
