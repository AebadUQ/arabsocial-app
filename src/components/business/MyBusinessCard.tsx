// components/business/MyBusinessCard.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import {
  Briefcase as BriefcaseIcon,
  MapPin as MapPinIcon,
  PencilSimpleLine as PencilIcon,
} from "phosphor-react-native";

export type MyBiz = {
  id: string | number;
  name: string;
  categories?: string[];
  // business_logo?: string | null; // reserved for future use
  city?: string | null;
  country?: string | null;
  open_positions?: number | null;
  Job?: any[];
};

type Props = {
  item: MyBiz;
  onPressCard?: () => void;
  onPressManage?: () => void;
};

const CARD_WIDTH = 310;

export default function MyBusinessCard({
  item,
  onPressCard,
  onPressManage,
}: Props) {
  const { theme } = useTheme();
  const nav = useNavigation<any>();

  const category = (item.categories?.[0] || "").toUpperCase();
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const openCount = item.Job?.length ?? 0;
  const jobsLabel =
    openCount === 1 ? "1 Open Position" : `${openCount} Open Positions`;

  const handleManage = () =>
    onPressManage
      ? onPressManage()
      : nav.navigate("EditBusiness" as never, { businessId: item.id } as never);

  const handleCard = () =>
    onPressCard
      ? onPressCard()
      : nav.navigate("BusinessDetail" as never, { businessId: item.id } as never);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: "#F8FBF9",
          borderColor: "rgba(0,0,0,0.08)",
        },
      ]}
      onPress={handleCard}
    >
      {/* Top row */}
      <View style={styles.row}>
        {/* Static image */}
        <View
          style={[
            styles.logoWrap,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <Image
            source={require("@/assets/images/event1.jpg")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Text block */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: "700" }} numberOfLines={1}>
            {item.name}
          </Text>

          {!!category && (
            <Text
              variant="overline"
              color={theme.colors.textLight}
              style={{ marginTop: 4 }}
              numberOfLines={1}
            >
              {category}
            </Text>
          )}

          {/* Location below category */}
          <View style={styles.locRow}>
            <MapPinIcon
              size={14}
              weight="fill"
              color="#E25757"
              style={{ marginRight: 6 }}
            />
            <Text
              numberOfLines={1}
              style={[styles.locText, { color: theme.colors.textLight }]}
            >
              {location || "N/A"}
            </Text>
          </View>
        </View>

        {/* Open positions on right */}
        {openCount > 0 && (
          <View
            style={[
              styles.pill,
              { backgroundColor: "rgba(27,173,122,0.15)" },
            ]}
          >
            <BriefcaseIcon
              size={14}
              weight="fill"
              color="#1BAD7A"
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

      {/* Manage button */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.manageBtn,
          {
            borderColor: "rgba(27,173,122,0.35)",
            backgroundColor: "rgba(27,173,122,0.12)",
          },
        ]}
        onPress={handleManage}
      >
        <PencilIcon
          size={18}
          weight="bold"
          color={theme.colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text
          variant="body1"
          color={theme.colors.primary}
        >
          Manage Business
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logoWrap: {
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  locRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  locText: {
    fontSize: 13,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  manageBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
