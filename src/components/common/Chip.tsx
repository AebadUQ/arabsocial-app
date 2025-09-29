import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

const Chip: React.FC<ChipProps> = ({ label, active = false, onPress }) => {
  const { theme } = useTheme();

  if (active) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touch}
      >
        <LinearGradient
          colors={["#1BAD7A", "#008F5C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.chip, styles.active]}
        >
          <View style={styles.content}>
            <Text variant="caption" style={{ color: "#fff" }}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.touch}
    >
      <View style={[styles.chip, styles.inactive]}>
        <View style={styles.content}>
          <Text variant="caption" style={{ color: theme.colors.text }}>
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    marginRight: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  active: { opacity: 1 },
  inactive: { opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingVertical: 4 },
});

export default Chip;
