// components/events/MyEventCard.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
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
  banner?: string | null;
  event_date?: string | null; // raw date from API
  event_time?: string | null; // raw time string from API
};

type Props = {
  item: MyEvent;
  onPressCard?: () => void;
  onPressManage?: () => void;
};

const CARD_WIDTH = 310;

const formatEventDate = (raw?: string | null): string => {
  if (!raw) return "";
  const date = new Date(raw);

  // If invalid date, just return original
  if (isNaN(date.getTime())) return String(raw);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", {
    month: "short",
  });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`; // e.g. "12 Oct 2025"
};

const MyEventCard: React.FC<Props> = ({
  item,
  onPressCard,
  onPressManage,
}) => {
  const { theme } = useTheme();
  const nav = useNavigation<any>();

  const location = [item.city, item.country]
    .filter(Boolean)
    .join(", ");

  const handleManage = () =>
    onPressManage
      ? onPressManage()
      : nav.navigate(
          "EditEvent" as never,
          { eventId: item.id } as never
        );

  const handleCard = () =>
    onPressCard
      ? onPressCard()
      : nav.navigate(
          "EventDetail" as never,
          { eventId: item.id } as never
        );

  const showBanner = !!item.banner;

  const formattedDate = formatEventDate(
    item.event_date
  );
  const hasDateTime =
    !!formattedDate || !!item.event_time;

  const dateTimeLabel = [
    formattedDate,
    item.event_time || "",
  ]
    .filter(Boolean)
    .join(" · "); // "12 Oct 2025 · 7:30 PM"

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
        {/* Event image / banner */}
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor:
                theme.colors
                  .primaryLight,
            },
          ]}
        >
          {showBanner ? (
            <Image
              source={{
                uri: item.banner!,
              }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("@/assets/images/event1.jpg")}
              style={styles.logo}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Text block */}
        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}
        >
          {/* Event name */}
          <Text
            style={{ fontWeight: "700" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Location */}
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
                {
                  color:
                    theme.colors
                      .textLight,
                },
              ]}
            >
              {location ||
                "Location TBA"}
            </Text>
          </View>

          {/* Start date + time (same size as location) */}
          {hasDateTime && (
            <View style={styles.metaRow}>
              <CalendarIcon
                size={14}
                weight="fill"
                color={
                  theme.colors
                    .primary
                }
                style={{
                  marginRight: 6,
                }}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.metaText, // 👈 same font size as location
                  {
                    color:
                      theme.colors
                        .textLight,
                  },
                ]}
              >
                {dateTimeLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Manage button */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.manageBtn,
          {
            borderColor:
              "rgba(27,173,122,0.35)",
            backgroundColor:
              "rgba(27,173,122,0.12)",
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
  metaRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  metaText: {
    fontSize: 12, // same as location
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
