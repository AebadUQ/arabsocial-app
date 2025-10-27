import React, { memo } from "react";
import { Text } from "@/components";
import {
  CalendarBlank as CalendarBlankIcon,
  MapPin as MapPinIcon,
  ShareFat as ShareFatIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";
import { formatEventDate } from "@/utils";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// keep same types
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
  flyer?: ImageSourcePropType;
  eventType: EventType;
  event_date?: any;
  totalSpots?: number;
  ticketLink?: string;
  ticketPrice?: number | string;
  description?: string;
  isFeatured?: boolean;
  promoCode?: string;
};

type Props = {
  event: Event;
};

const EventCard: React.FC<Props> = ({ event }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>(); // if you have typed RootStackParamList, replace `any`

  const handlePress = () => {
    console.log(event.id)
    // go to detail screen and pass id
    navigation.navigate("EventDetail", { eventId: event.id });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: "#fff" }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Top image/banner */}
      <View style={styles.imageWrap}>
        {/* TODO: if API gives you URL, change to { uri: event.flyer } */}
        <Image
          source={require("@/assets/images/event1.png")}
          style={styles.image}
          resizeMode="cover"
        />

        {event.isFeatured ? (
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          >
            <Text variant="overline" style={styles.badgeText}>
              Featured
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom text section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text
            variant="body2"
            style={styles.title}
            numberOfLines={2}
            color={theme.colors.text}
          >
            {event.title}
          </Text>

          <View style={styles.iconCircle}>
            <ShareFatIcon size={14} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarBlankIcon size={16} color={theme.colors.primary} />
            <Text variant="overline" style={styles.metaText}>
              {formatEventDate(event.event_date)}
            </Text>
          </View>

          {event.city ? (
            <View style={styles.metaItem}>
              <MapPinIcon size={16} color={theme.colors.primary} />
              <Text variant="overline" style={styles.metaText}>
                {event.city}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Promo chip if promoCode exists */}
        {event.promoCode ? (
          <View
            style={[
              styles.promoBtn,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text variant="overline" style={styles.promoText}>
              Promocode: {event.promoCode}
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
    overflow: "hidden", // makes image corners clipped
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
