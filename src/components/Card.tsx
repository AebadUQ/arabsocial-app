// src/components/Card.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

const Card = ({ children, style }: any) => {
  const { theme } = useTheme(); // uses theme.colors.primary

  return (
    <View style={[styles.card, { borderColor: theme.colors.primary }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 0.25,
    backgroundColor: "#fff",
  },
});

export default Card;
