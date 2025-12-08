// components/business/BusinessCard.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { theme as appTheme } from "@/theme/theme";
import {
  Briefcase as BriefcaseIcon,
  MapPin as MapPinIcon,
} from "phosphor-react-native";

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
  open_positions?: number | null;
  Job?: any[];
};

const CARD_RADIUS = 12;

export default function BusinessCard({ item }: { item: ApiBusiness }) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const category = (item.categories?.[0] || "").toUpperCase() || "—";
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const jobsCount = item.Job?.length ?? 0;
  const jobsLabel =
    jobsCount === 1 ? "1 Open Position" : `${jobsCount} Open Positions`;

  const handlePress = () => {
    navigation.navigate(
      "BusinessDetail" as never,
      { business: item } as never
    );
  };

  return (
    <TouchableOpacity
      style={[styles.cardWrap, { backgroundColor: "#fff" }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Image OR background fallback */}
      <View
        style={[
          styles.cardImgWrap,
          {
            backgroundColor: item?.business_logo
              ? "transparent"
              : theme.colors.primaryLight,
          },
        ]}
      >
        {item?.business_logo ? (
          <Image
            source={{ uri: item.business_logo }}
            style={styles.cardImg}
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Name + Category + Promo */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flexShrink: 1 }}>
            <Text
              variant="body1"
              style={{ fontWeight: "600" }}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              variant="overline"
              color={theme.colors.textLight}
              style={{ textTransform: "uppercase", marginTop: 4 }}
              numberOfLines={1}
            >
              {category}
            </Text>
          </View>

          {item.promo_code ? (
            <View style={styles.promoChip}>
              <Text style={styles.promoText} numberOfLines={1}>
                {item.promo_code}
              </Text>
            </View>
          ) : null}
        </View>

        {/* About */}
        {item.about_me && (
          <Text
            variant="caption"
            color={theme.colors.textLight}
            style={{ marginTop: 6 }}
            numberOfLines={2}
          >
            {item.about_me}
          </Text>
        )}

        {/* Location + Jobs */}
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Location */}
          <View style={styles.locationRow}>
            <MapPinIcon
              size={14}
              weight="fill"
              color="#E25757"
              style={{ marginRight: 6 }}
            />
            {location ? (
              <Text
                variant="overline"
                color={theme.colors.textLight}
                numberOfLines={1}
              >
                {location}
              </Text>
            ) : (
              <Text
                variant="overline"
                color={theme.colors.textLight}
                numberOfLines={1}
              >
                -
              </Text>
            )}
          </View>

          {jobsCount > 0 && (
            <View style={styles.jobsChip}>
              <BriefcaseIcon
                size={12}
                color={theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.pillText, { color: "#1BAD7A" }]}
                numberOfLines={1}
              >
                {jobsLabel}
              </Text>
            </View>
          )}
        </View>
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
    borderWidth: 0.25,
    borderColor: appTheme.colors.primary,
  },
  cardImgWrap: {
    width: "100%",
    height: 160,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  promoChip: {
    backgroundColor: appTheme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 110,
  },
  promoText: {
    color: appTheme.colors.primary,
    fontWeight: "700",
    fontSize: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 8,
  },
  jobsChip: {
    backgroundColor: appTheme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minWidth: 40,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
