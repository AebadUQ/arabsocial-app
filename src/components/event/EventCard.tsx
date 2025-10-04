// components/event/EventCard.tsx
import React, { memo } from "react";
import { Text } from "@/components";
import {
  CalendarBlank as CalendarBlankIcon,
  MapPin as MapPinIcon,
  ShareFat as ShareFatIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";
import { formatDate } from "@/utils";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

export type EventType = "in_person" | "online";

export type Event = {
  id: string;
  name: string;
  startDate: string | Date;
  endDate?: string | Date;
  address?: string;
  city?: string;
  state?: string;
  country?:string;
  image?: ImageSourcePropType;
  eventType: EventType;
  totalSpots?: number;
  ticketLink?: string;
  ticketPrice?: number | string;
  description?: string;
  isFeatured?: boolean;
  promoCode?: string; // 👈 only render promo UI when this exists
};

type Props = { event: Event };

const EventCard: React.FC<Props> = ({ event }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: "#fff" }]}>
      {!!event.image && (
        <View style={styles.imageWrap}>
          <Image source={event.image} style={styles.image} resizeMode="cover" />
          {event.isFeatured ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="overline" style={styles.badgeText}>
                Featured
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text variant="body2" style={styles.title} numberOfLines={2}>
            {event.name}
          </Text>

          <View style={styles.iconCircle}>
            <ShareFatIcon size={14} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarBlankIcon size={16} color={theme.colors.primary} />
            <Text variant="overline" style={styles.metaText}>{formatDate(event.startDate)}</Text>
          </View>

          {event.city ? (
            <View style={styles.metaItem}>
              <MapPinIcon size={16} color={theme.colors.primary} />
              <Text style={styles.metaText}>{event.city}</Text>
            </View>
          ) : null}
        </View>

        {/* Only show when promoCode is provided */}
        {event.promoCode ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.promoBtn, { backgroundColor: theme.colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={`Promocode ${event.promoCode}`}
          >
            <Text variant="overline" style={styles.promoText}>
              Promocode: {event.promoCode}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default memo(EventCard);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    borderWidth: 0.5,
    borderColor: "#1BAD7A1A",
  },
  imageWrap: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden", // 👈 ensures the image never overflows the card corners
  },
  image: {
    height: 160,
    width: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 90,
  },
  badgeText: { color: "#fff" },
  section: {
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontWeight: "bold", flex: 1, paddingRight: 8 },
  iconCircle: {
    width: 24,
    height: 24,
    backgroundColor: "#1BAD7A1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginTop: 4,
  },
  metaText: { marginLeft: 8 },
  promoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 90,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  promoText: { color: "#fff" },
});
