// components/events/MyEventCard.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import {
  CalendarBlank as CalendarIcon,
  MapPin as MapPinIcon,
  PencilSimpleLine as PencilIcon,
} from "phosphor-react-native";

export type MyEvent = {
  id: string | number;
  title: string;
  city?: string | null;
  country?: string | null;
  img?: string | null;
  flyer?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  approval_status?: "pending" | "approved" | "rejected" | string;
};

type Props = {
  item: any;
  // onPressCard?: () => void;
  // onPressManage?: () => void;
};

const CARD_WIDTH = 310;

const formatEventDate = (raw?: string | null): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return String(raw);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const MyEventCard: React.FC<Props> = ({
  item,
  // onPressCard,
  // onPressManage,
}) => {
  const { theme } = useTheme();
  const nav = useNavigation<any>();

  const location = [item.city, item.country].filter(Boolean).join(", ");

  const handleManage = () =>
    
       nav.navigate("EditEvent" as never, { eventId: item.id } as never);

  const handleCard = () =>
    nav.navigate("EventDetail" as never, { eventId: item.id } as never);

  const bannerUri = item.img || item.flyer || null;
  const hasBanner = !!bannerUri;

  const formattedDate = formatEventDate(item.event_date);
  const hasDateTime = !!formattedDate || !!item.event_time;

  const dateTimeLabel = [formattedDate, item.event_time || ""]
    .filter(Boolean)
    .join(" · ");

  const isPending = item.approval_status === "pending";

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
      <View style={styles.row}>
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor: hasBanner
                ? "transparent"
                : theme.colors.primaryLight,
            },
          ]}
        >
          {hasBanner && (
            <Image
              source={{ uri: bannerUri! }}
              style={styles.logo}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.titleRow}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {isPending && (
              <View style={styles.statusTag}>
                <Text style={styles.statusText}>
                  pending approval
                </Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <MapPinIcon
              size={14}
              weight="fill"
              color="#E25757"
              style={{ marginRight: 6 }}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.metaText,
                { color: theme.colors.textLight },
              ]}
            >
              {location || "Location TBA"}
            </Text>
          </View>

          {hasDateTime && (
            <View style={styles.metaRow}>
              <CalendarIcon
                size={14}
                weight="fill"
                color={theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.metaText,
                  { color: theme.colors.textLight },
                ]}
              >
                {dateTimeLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

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
          Manage Event
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
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
  metaRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  metaText: {
    fontSize: 12,
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

export default MyEventCard;
