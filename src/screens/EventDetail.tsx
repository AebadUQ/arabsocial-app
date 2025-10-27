import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { CalendarBlank, Crown, LinkSimple, MapPin, Tag, ArrowLeft } from "phosphor-react-native";
import { Text } from "@/components";
import { getEventsDetail } from "@/api/events";
import { formatDate } from "@/utils";
import { useTheme } from "@/theme/ThemeContext";

type EventDetailParams = {
  EventDetail: { eventId: number };
};

const EventDetail: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const CTA_HEIGHT = 56;
  const contentBottomPad = CTA_HEIGHT + 24;

  const fetchEventDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEventsDetail(eventId);
      setEvent(data);
    } catch (error) {
      console.error("❌ Failed to fetch event detail:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);

  const onBookNow = () => {
    if (event?.ticket_link) {
      Linking.openURL(event.ticket_link).catch(() => {});
    }
  };

  // ---------- Loading & Error States ----------
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text variant="body1" color={theme.colors.text}>
          No event found.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text variant="caption" color="#fff">
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Event Banner with Back Button ---------- */}
        <View style={styles.bannerWrap}>
          {!!event?.img && (
            <Image
          source={require("@/assets/images/event1.png")}
              style={styles.banner}
              resizeMode="cover"
            />
          )}

          {/* Floating Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: 16 }]} // Safe area + spacing
            accessibilityRole="button"
            accessibilityLabel="Go Back"
          >
            <ArrowLeft size={22} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* ---------- Event Info ---------- */}
        <Text variant="h5" style={[styles.title, { color: theme.colors.text }]}>
          {event?.title}
        </Text>

        <View style={{ flexDirection: "column", gap: 24 }}>
          {!!event?.description && <Text variant="body2">{event.description}</Text>}

          {(event?.city || event?.address) && (
            <View style={styles.row}>
              <MapPin size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Location</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event?.address ? `${event.address}, ` : ""}
                  {event?.city}
                </Text>
              </View>
            </View>
          )}

          {event?.start_datetime && (
            <View style={styles.row}>
              <CalendarBlank size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Date</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {formatDate(event.start_datetime)}
                </Text>
              </View>
            </View>
          )}

          {!!event?.ticket_link && (
            <TouchableOpacity style={styles.row} onPress={onBookNow}>
              <LinkSimple size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Ticket Link</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event.ticket_link}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {!!event?.promo_code && (
            <View style={styles.row}>
              <Tag size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Promo Code</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event.promo_code}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.row}>
            <Crown size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Organized by</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                {event?.organizer_name || event?.title}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onBookNow}
          accessibilityRole="button"
          accessibilityLabel="Book Now"
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={["#1BAD7A", "#008F5C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  bannerWrap: {
    position: "relative",
    marginBottom:20
  },
  banner: {
    width: "100%",
    height: 320,
    borderRadius: 16,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  ctaShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

export default EventDetail;
