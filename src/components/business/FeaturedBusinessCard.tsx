// components/business/FeaturedBusinessCard.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { BriefcaseIcon, StarIcon } from "phosphor-react-native";
import { theme } from "@/theme/theme";

export type FeaturedBiz = {
  id: string | number;
  name: string;
  categories?: string[];         // we’ll show the first one
  business_logo?: string | null; // cover image
  promo_code?: string | null;
  open_positions?: number | null; // jobs count (optional)
  is_featured?: boolean | null;    // optional flag
};

type Props = {
  item: any;
  onPress?: () => void;           // open details
};

const GREEN = "#1BAD7A";

export default function FeaturedBusinessCard({ item, onPress }: Props) {
  const nav = useNavigation<any>();
  const { theme } = useTheme();

  const logo = item.business_logo || "";
  const title = item.name || "";
  const category = (item.categories?.[0] || "").toUpperCase();
  const jobs = item.open_positions ?? 0;

  const handlePress = () =>
    onPress
      ? onPress()
      : nav.navigate("BusinessDetail" as never, { businessId: item.id } as never);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handlePress}>
      {/* Image + Featured pill */}
      <View style={styles.imageWrap}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: "rgba(0,0,0,0.08)" }]} />
        )}
        <View style={styles.featurePill}>
          <Text variant="overline" color={theme.colors.textWhite}>Featured</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text variant="overline" color={theme.colors.text} fontWeight="bold">{title}</Text>
        {!!category && (
          <Text variant="overline" color={theme.colors.textLight}>{category}</Text>
        )}

        <View style={styles.bottomRow}>
          {!!item.promo_code && (
            <View style={styles.promoChip}>
              <Text style={styles.promoText}>{item.promo_code}</Text>
            </View>
          )}
          <View style={styles.jobsChip}>
            <BriefcaseIcon size={10} color={GREEN} style={{ marginRight: 6 }} />
            <Text  variant="overline" color={theme.colors.primary}>{jobs}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 10,
    overflow: "hidden",
    shadowColor: "#000",
  },
  imageWrap: { width: "100%", height: 100, overflow: "hidden",backgroundColor:theme.colors.primaryLight },
  image: { width: "100%", height: "100%" },
  featurePill: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  featureText: { color: "#fff", fontWeight: "700",fontSize:10 },

  body: { padding: 10 },
  category: { marginTop: 6, fontWeight: "600", letterSpacing: 1, color: "#A0A4AE",fontSize:10 },

  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  promoChip: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical:4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  promoText: { color: GREEN, fontWeight: "700",fontSize:8 },

  jobsChip: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical:4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
