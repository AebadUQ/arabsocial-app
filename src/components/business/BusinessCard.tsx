// components/business/BusinessCard.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";

export type ApiBusiness = {
  id: string | number;
  name: string;
  categories?: string[];
  business_logo?: string | null | undefined;
  about_me?: string | null;
  city?: string | null;
  country?: string | null;
  business_type?: "online" | "physical" | "hybrid" | string | null;
  promo_code?: string | null;
  discount?: string | null;
};

const CARD_RADIUS = 12;

export default function BusinessCard({ item }: { item: ApiBusiness }) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const category = item.categories?.[0] ?? "—";
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const logoUri = item.business_logo || "";

  const handlePress = () => {
    navigation.navigate("BusinessDetail" as never, { business: item } as never);
  };

  return (
    <TouchableOpacity
      style={[styles.cardWrap, { backgroundColor: "#fff" }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View style={styles.cardImgWrap}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.cardImg,
              { backgroundColor: (theme.colors as any)?.darkGray || "rgba(0,0,0,0.06)" },
            ]}
          />
        )}

        {!!item.promo_code && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text variant="overline" style={{ color: "#fff", fontWeight: "700" }}>
              {item.promo_code}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text variant="body1" style={{ fontWeight: "600" }}>{item.name}</Text>

        <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Text variant="overline" color={theme.colors.textLight}>Category: {category}</Text>
          {location ? (
            <Text variant="overline" color={theme.colors.textLight}> • {location}</Text>
          ) : null}
          {item.business_type ? (
            <Text variant="overline" color={theme.colors.textLight}> • {item.business_type}</Text>
          ) : null}
        </View>

        {!!item.about_me && (
          <Text variant="caption" color={theme.colors.textLight} style={{ marginTop: 6 }} numberOfLines={2}>
            {item.about_me}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardImgWrap: {
    position: "relative",
    width: "100%",
    height: 160,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: { paddingHorizontal: 12, paddingVertical: 12 },
});
