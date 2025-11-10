import React, { memo } from "react";
import { Text } from "@/components";
import {
  MapPin as MapPinIcon,
  ShareFat as ShareFatIcon,
  ShareNetworkIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";
import { formatEventDate } from "@/utils";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  Share,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { theme } from "@/theme/theme";

export type EventType = "in_person" | "online";

export type Event = {
  id: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  flyer?: string | ImageSourcePropType;
  eventType: EventType;
  event_date?: any;
  totalSpots?: number;
  ticketLink?: string;
  ticketPrice?: number | string;
  description?: string;
  isFeatured?: boolean;
  promo_code?: string;
};

type Props = {
  event: Event;
};

const EventCard: React.FC<Props> = ({ event }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate("EventDetail", { eventId: event.id });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: event.title || "Check out this event",
      });
    } catch (e) {
      // ignore
    }
  };

  const imageSource =
    event?.flyer && typeof event.flyer === "string"
      ? { uri: event.flyer }
      : event?.flyer
      ? event.flyer
      : require("@/assets/images/event1.png");

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: "#fff" }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Top image/banner */}
      <View style={styles.imageWrap}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        {event.isFeatured ? (
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          >
            <Text variant="overline" style={styles.badgeText}>
              Featured
            </Text>
          </View>
        ) : null}

        {/* Share icon bottom-right on image */}
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.9}
          onPress={(e) => {
            e.stopPropagation(); // card navigation na trigger ho
            handleShare();
          }}
        >
          <View style={styles.shareCircle}>
            <ShareNetworkIcon size={18} color="#111827" weight="bold" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom text section */}
      <View style={styles.section}>
        <Text variant="body2" numberOfLines={2} color={theme.colors.text}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text
              variant="overline"
              style={styles.metaText}
              color={theme.colors.textLight}
            >
              {formatEventDate(event.event_date)}
            </Text>
          </View>

          {event.city ? (
            <View style={styles.metaItem}>
              <MapPinIcon size={16} color={theme.colors.text} />
              <Text
                variant="overline"
                style={styles.metaText}
                color={theme.colors.textLight}
              >
                {event.city}
              </Text>
            </View>
          ) : null}
        </View>

        {event.promo_code ? (
          <View
            style={[
              styles.promoBtn,
              { backgroundColor: theme.colors.primaryShade },
            ]}
          >
            <Text variant="overline" style={styles.promoText}>
              Promocode: {event.promo_code}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default memo(EventCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0.25,
    borderColor: theme.colors.primary,
  },
  imageWrap: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  image: {
    height: 180,
    width: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 90,
  },
  badgeText: { color: "#fff" },
  shareButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  shareCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    // light shadow for iOS + elevation for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingBottom: 20,
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
  promoText: { color: theme.colors.primary },
});
