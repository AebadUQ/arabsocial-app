// screens/Event/EventDetail.tsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Share,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeft,
  CalendarBlank,
  Crown,
  LinkSimple,
  MapPin,
  Tag,
  ShareNetwork,
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { getEventsDetail } from "@/api/events";
import { formatDate } from "@/utils";
import Card from "@/components/Card";
import { theme as appTheme } from "@/theme/theme";

type ApiEvent = {
  id: number | string;
  title: string;
  description?: string | null;
  flyer?: string | null; // URL (if available)
  city?: string | null;
  address?: string | null;
  country?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  ticket_link?: string | null;
  promo_code?: string | null;
  organizer_name?: string | null;
};

const CTA_HEIGHT = 56;

const EventDetail: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const paramEventId: number | string | undefined = route?.params?.eventId;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const id = useMemo(() => paramEventId, [paramEventId]);

  const contentBottomPad =
    CTA_HEIGHT + (insets.bottom || 16) + 32;

  const normalizeEvent = (res: any): ApiEvent | null => {
    if (!res) return null;
    const candidate = res?.data?.data ?? res?.data ?? res;
    return candidate && !Array.isArray(candidate)
      ? (candidate as ApiEvent)
      : null;
  };

  const fetchDetail = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        const res = await getEventsDetail(id);
        const normalized = normalizeEvent(res);
        if (normalized) setEvent(normalized);
      } catch (e) {
        console.error("Failed to fetch event detail:", e);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchDetail(false);
  }, [fetchDetail]);

  const onRefresh = useCallback(() => fetchDetail(true), [fetchDetail]);

  const openLink = (url?: string | null) => {
    if (!url) return;
    let final = url.trim();
    if (!/^https?:\/\//i.test(final)) final = "https://" + final;
    Linking.openURL(final).catch(() => {});
  };

  const shareEvent = () => {
    if (!event) return;
    const message =
      (event.title || "Event Detail") +
      (event.ticket_link ? ` - ${event.ticket_link}` : "");
    Share.share({ message }).catch(() => {});
  };

  const onBookNow = () => {
    if (event?.ticket_link) {
      openLink(event.ticket_link);
    }
  };

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

  const title = event.title ?? "Event";

  const bannerSource =
    event.flyer && typeof event.flyer === "string"
      ? { uri: event.flyer }
      : require("@/assets/images/event1.png");

  const hasLocation = !!(event.city || event.address || event.country);
  const hasPromo = !!event.promo_code;
  const hasTicket = !!event.ticket_link;
  const hasOrganizer = !!event.organizer_name;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconCircle}
          >
            <ArrowLeft size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>

          <Text variant="body1" color={theme.colors.text}>
            Event Detail
          </Text>

          <TouchableOpacity
            onPress={shareEvent}
            style={styles.iconCircle}
          >
            <ShareNetwork size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image
            source={bannerSource}
            style={styles.banner}
            resizeMode="cover"
          />
        </View>

        {/* Info Card */}
        <Card>
          {/* Title */}
          <Text
            variant="body1"
            color={theme.colors.text}
            numberOfLines={2}
            style={styles.eventTitle}
          >
            {title}
          </Text>

          {/* Description */}
          {!!event.description && (
            <View style={{ marginTop: 4, marginBottom: 0}}>
              <Text variant="body2" color={theme.colors.textLight}>
                {event.description}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Date/Time */}
          {event.start_datetime && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <CalendarBlank size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Date & Time
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.text}
                  style={styles.infoValue}
                >
                  {formatDate(event.start_datetime)}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {hasLocation && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <MapPin size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Location
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.text}
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  {[
                    event.address,
                    [event.city, event.country].filter(Boolean).join(", "),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            </View>
          )}

          {/* Ticket Link */}
          {hasTicket && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <LinkSimple size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Tickets
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onBookNow()}
                >
                  <Text
                    variant="body2"
                    color={theme.colors.primary}
                    style={styles.infoValue}
                    numberOfLines={1}
                  >
                    {event.ticket_link}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Promo Code */}
          {hasPromo && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Tag size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Promo Code
                </Text>
                <View style={[styles.chip, styles.promoChip]}>
                  <Text
                    variant="overline"
                    color={theme.colors.primary}
                    numberOfLines={1}
                  >
                    {event.promo_code}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Organizer */}
          {hasOrganizer && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Crown size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Organized By
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.text}
                  style={styles.infoValue}
                >
                  {event.organizer_name}
                </Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Sticky Bottom CTA (only if ticket link) */}
      {hasTicket && (
        <View
          style={[
            styles.ctaWrap,
          ]}
        >
          <View style={styles.ctaShadow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onBookNow}
              accessibilityRole="button"
              accessibilityLabel="Book Now"
            >
              <LinearGradient
                colors={["#1BAD7A", "#008F5C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Book Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

/* ------------------------------ Styles ----------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 0 },
  topBar: {
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerWrap: {
    marginBottom: 12,
  },
  banner: {
    width: "100%",
    height: 224,
    borderRadius: 16,
  },
  eventTitle: {
    marginBottom: 4,
  },
  divider: {
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appTheme.colors.primary,
    opacity: 0.4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  iconCircleSoft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoValue: {
    marginTop: 4,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: appTheme.colors.primaryLight,
    alignSelf: "flex-start",
  },
  promoChip: {
    marginTop: 4,
    maxWidth: 160,
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
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
  },
  ctaShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaBtn: {
    height: CTA_HEIGHT,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

export default EventDetail;
