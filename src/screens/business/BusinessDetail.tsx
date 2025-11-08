// screens/Business/BusinessDetail.tsx
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
  MapPin,
  Tag,
  Globe,
  Phone,
  EnvelopeSimple,
  InstagramLogo,
  FacebookLogo,
  CaretRight,
  Buildings,
  ShareNetwork,
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { getBusinessDetail } from "@/api/business";
import Card from "@/components/Card";
import { theme as appTheme } from "@/theme/theme";

type ApiJob = {
  id: number | string;
  title: string;
  job_type?: string | null;
  location?: string | null;
  status?: string | null;
  application_link?: string | null;
  created_at?: string | null;
  description?: string | null;
};

type ApiBusiness = {
  id: string | number;
  name: string;
  categories?: string[];
  business_logo?: string | null;
  about_me?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  website_link?: string | null;
  phone?: string | null;
  email?: string | null;
  fb_link?: string | null;
  insta_link?: string | null;
  business_type?: "online" | "physical" | "hybrid" | string | null;
  promo_code?: string | null;
  discount?: string | null;
  Job?: ApiJob[] | null;
};

const CTA_HEIGHT = 56;

const BusinessDetail: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialBusiness: ApiBusiness | null = route?.params?.business ?? null;
  const paramBusinessId: number | string | undefined = route?.params?.businessId;

  const [business, setBusiness] = useState<ApiBusiness | null>(initialBusiness);
  const [loading, setLoading] = useState<boolean>(!initialBusiness);
  const [refreshing, setRefreshing] = useState(false);

  const id = useMemo(
    () => paramBusinessId ?? initialBusiness?.id,
    [paramBusinessId, initialBusiness?.id]
  );

  // enough space so list content scroll ho jaye aur button se clash na ho
  const contentBottomPad =
    CTA_HEIGHT + (insets.bottom || 16) + 32;

  const normalizeBusiness = (res: any): ApiBusiness | null => {
    if (!res) return null;
    const candidate = res?.data?.data ?? res?.data ?? res;
    return candidate && !Array.isArray(candidate)
      ? (candidate as ApiBusiness)
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
        const res = await getBusinessDetail(id);
        const normalized = normalizeBusiness(res);
        if (normalized) setBusiness(normalized);
      } catch (e) {
        console.error("Failed to fetch business detail:", e);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (!initialBusiness || !business) fetchDetail(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = useCallback(() => fetchDetail(true), [fetchDetail]);

  const humanize = (s?: string | null) =>
    (s ?? "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const openLink = (url?: string | null) => {
    if (!url) return;
    let final = url.trim();
    if (!/^https?:\/\//i.test(final)) final = "https://" + final;
    Linking.openURL(final).catch(() => {});
  };

  const callPhone = (p?: string | null) => {
    if (!p) return;
    Linking.openURL(`tel:${p}`).catch(() => {});
  };

  const sendEmail = (e?: string | null) => {
    if (!e) return;
    Linking.openURL(`mailto:${e}`).catch(() => {});
  };

  const shareBusiness = () => {
    if (!business) return;
    const message =
      (business.name || "Business Detail") +
      (business.website_link ? ` - ${business.website_link}` : "");
    Share.share({ message }).catch(() => {});
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

  if (!business) {
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
          No business found.
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

  const title = business.name ?? "Business";

  // abhi ke liye fixed banner
  const bannerSource = require("@/assets/images/business.jpg");

  const chips: string[] = [
    business.categories?.[0] ?? "",
    business.business_type ?? "",
    business.city && business.country
      ? `${business.city}, ${business.country}`
      : business.city ?? business.country ?? "",
  ].filter(Boolean);

  const hasLocation = !!(business.city || business.country || business.address);
  const hasPhone = !!business.phone;
  const hasPromo = !!business.promo_code;
  const hasWebsite = !!business.website_link;
  const hasEmail = !!business.email;
  const hasInsta = !!business.insta_link;
  const hasFb = !!business.fb_link;
  const hasAnySocial = hasWebsite || hasEmail || hasInsta || hasFb;

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
            Business Detail
          </Text>

          <TouchableOpacity
            onPress={shareBusiness}
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
          <Text
            variant="body1"
            color={theme.colors.text}
            numberOfLines={1}
          >
            {title}
          </Text>

          {!!business.about_me && (
            <View style={{ marginTop: 4, marginBottom: 16 }}>
              <Text variant="body2" color={theme.colors.textLight}>
                {business.about_me}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {chips.length > 0 && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Buildings size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Category
                </Text>
                <View style={[styles.chipsRow, { marginTop: 4 }]}>
                  {chips.map((c, idx) => (
                    <View key={idx} style={styles.chip}>
                      <Text variant="overline" color={theme.colors.primary}>
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

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
                    business.address,
                    [business.city, business.country]
                      .filter(Boolean)
                      .join(", "),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            </View>
          )}

          {hasPhone && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircleSoft,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Phone size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" color={theme.colors.textLight}>
                  Phone
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => callPhone(business.phone!)}
                >
                  <Text
                    variant="body2"
                    color={theme.colors.primary}
                    style={styles.infoValue}
                  >
                    {business.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
                    {business.promo_code}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Social / Web */}
        {hasAnySocial && (
          <Card style={styles.socialCard}>
            <Text
              variant="overline"
              color={theme.colors.textLight}
              style={{ marginBottom: 8 }}
            >
              Connect
            </Text>
            <View style={styles.socialRow}>
              {hasWebsite && (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => openLink(business.website_link!)}
                  activeOpacity={0.8}
                >
                  <Globe size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.socialText}>
                    Website
                  </Text>
                </TouchableOpacity>
              )}
              {hasEmail && (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => sendEmail(business.email!)}
                  activeOpacity={0.8}
                >
                  <EnvelopeSimple size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.socialText}>
                    Email
                  </Text>
                </TouchableOpacity>
              )}
              {hasInsta && (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => openLink(business.insta_link!)}
                  activeOpacity={0.8}
                >
                  <InstagramLogo size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.socialText}>
                    Instagram
                  </Text>
                </TouchableOpacity>
              )}
              {hasFb && (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => openLink(business.fb_link!)}
                  activeOpacity={0.8}
                >
                  <FacebookLogo size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.socialText}>
                    Facebook
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        {/* Jobs */}
        {!!business.Job?.length && (
          <Card style={styles.jobsSection}>
            <Text
              variant="h6"
              style={[styles.jobsTitle, { color: theme.colors.text }]}
            >
              Job Openings
            </Text>

            {business.Job.map((job: ApiJob) => {
              const badgeLabel = job.job_type ? humanize(job.job_type) : "Open";

              return (
                <TouchableOpacity
                  key={job.id}
                  activeOpacity={0.9}
                  style={[styles.jobCard, { borderColor: theme.colors.primary }]}
                >
                  <View style={styles.jobHeader}>
                    <Text
                      variant="body1"
                      style={[styles.jobTitle, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {job.title}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate("JobDetail", { jobId: job.id })
                      }
                    >
                      <CaretRight
                        size={18}
                        color={"rgba(0,0,0,0.35)"}
                        weight="bold"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.jobMetaRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Text
                        variant="overline"
                        style={{ color: theme.colors.primary }}
                      >
                        {badgeLabel}
                      </Text>
                    </View>

                    {!!job.location && (
                      <View style={styles.locRow}>
                        <MapPin size={14} color={theme.colors.primaryDark} />
                        <Text
                          variant="caption"
                          color={theme.colors.primaryDark}
                        >
                          {job.location}
                        </Text>
                      </View>
                    )}
                  </View>

                  {!!job.description && (
                    <Text
                      variant="body2"
                      style={[
                        styles.jobDesc,
                        {
                          color:
                            theme.colors.textLight ?? theme.colors.text,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {job.description}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View
        style={[
          styles.ctaWrap,
          
        ]}
      >
        <View style={styles.ctaShadow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (business.website_link) openLink(business.website_link);
              else if (business.phone) callPhone(business.phone);
              else if (business.email) sendEmail(business.email);
            }}
            accessibilityRole="button"
            accessibilityLabel="Contact Business"
          >
            <LinearGradient
              colors={["#1BAD7A", "#008F5C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {business.website_link
                  ? "Visit Website"
                  : business.phone
                  ? "Call Now"
                  : business.email
                  ? "Email"
                  : "Contact"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  bannerWrap: {
    marginBottom: 12,
  },
  banner: {
    width: "100%",
    height: 224,
    borderRadius: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
  },
  divider: {
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appTheme.colors.primary,
    opacity: 0.4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    marginTop: 6,
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
    maxWidth: 140,
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
  socialCard: {
    marginTop: 12,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  socialPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F4F8F6",
    gap: 6,
  },
  socialText: {
    color: appTheme.colors.primary,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  jobsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  jobsTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  jobCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0,0,0,0.06)",
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  jobTitle: {
    flex: 1,
    paddingRight: 8,
    fontWeight: "700",
  },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobDesc: {
    lineHeight: 18,
    marginTop: 4,
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical:15
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

export default BusinessDetail;
