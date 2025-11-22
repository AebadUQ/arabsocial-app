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
  city?: string | null;
  country?: string | null;
  open_positions?: number | null;
  business_logo?:any;
  Job?: any[];
  approved?: "pending" | "approved" | "rejected" | string; // <-- ADDED
};

type Props = {
  item: MyBiz;
  onPressCard?: () => void;
  onPressManage?: () => void;
};

const CARD_WIDTH = 310;

export default function MyBusinessCard({ item, onPressCard, onPressManage }: Props) {
  const { theme } = useTheme();
  const nav = useNavigation<any>();

  const category = (item.categories?.[0] || "").toUpperCase();
  const location = [item.city, item.country].filter(Boolean).join(", ");

  const openCount = item.Job?.length ?? 0;
  const jobsLabel =
    openCount === 1 ? "1 Open Position" : `${openCount} Open Positions`;

  // ----- NEW: PENDING APPROVAL -----
  const isPending = item.approved === "pending";

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
        {/* Logo Image */}
        <View
          style={[
            styles.logoWrap,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <Image
                        source={{ uri: item?.business_logo! }}

            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Text Block */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Title Row with Pending Tag */}
          <View style={styles.titleRow}>
            <Text style={{ fontWeight: "700", flex: 1 }} numberOfLines={1}>
              {item.name}
            </Text>

            {/* ----- SHOW PENDING BADGE ----- */}
            {isPending && (
              <View style={styles.statusTag}>
                <Text style={styles.statusText}>pending approval</Text>
              </View>
            )}
          </View>

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

          {/* Location */}
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

        {/* Jobs Pill */}
        {openCount > 0 && (
          <View style={[styles.pill, { backgroundColor: "rgba(27,173,122,0.15)" }]}>
            <BriefcaseIcon
              size={14}
              weight="fill"
              color="#1BAD7A"
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.pillText, { color: "#1BAD7A" }]} numberOfLines={1}>
              {jobsLabel}
            </Text>
          </View>
        )}
      </View>

      {/* Manage Button */}
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
        <Text variant="body1" color={theme.colors.primary}>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,193,7,0.12)",
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#B8860B",
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
