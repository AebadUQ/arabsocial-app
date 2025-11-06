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
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { getBusinessDetail } from "@/api/business";

/* ----------------------------- Types ----------------------------- */
type ApiJob = {
  id: number | string;
  title: string;
  job_type?: string | null;        // "full-time" | "part-time" | "remote" | etc.
  location?: string | null;        // e.g. "Karachi, PK"
  status?: string | null;          // "published" | etc.
  application_link?: string | null;
  created_at?: string | null;
  description?: string | null;     // optional (if you add later)
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

  // Accept either a full object or just an id
  const initialBusiness: ApiBusiness | null = route?.params?.business ?? null;
  const paramBusinessId: number | string | undefined = route?.params?.businessId;

  const [business, setBusiness] = useState<ApiBusiness | null>(initialBusiness);
  const [loading, setLoading] = useState<boolean>(!initialBusiness);
  const [refreshing, setRefreshing] = useState(false);

  // Prefer explicit id param; otherwise use the id from passed object
  const id = useMemo(
    () => paramBusinessId ?? initialBusiness?.id,
    [paramBusinessId, initialBusiness?.id]
  );

  const contentBottomPad = CTA_HEIGHT + 24;

  // Normalize common API shapes
  const normalizeApiResult = (res: any): ApiBusiness | null => {
    if (!res) return null;
    // sendResponse style: { success, message, data: {...} }
    if (res.data && !Array.isArray(res.data)) return res.data as ApiBusiness;
    // nested: { data: { data: {...} } }
    if (res.data?.data && !Array.isArray(res.data.data)) return res.data.data as ApiBusiness;
    // direct object
    if (!res.data && !Array.isArray(res)) return res as ApiBusiness;
    return null;
  };

  const fetchDetail = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const res = await getBusinessDetail(id);
        const normalized = normalizeApiResult(res);
        if (normalized) setBusiness(normalized);
      } catch (e) {
        console.error("❌ Failed to fetch business detail:", e);
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    // If we didn't receive a full object, or we want fresh data, fetch by id.
    if (!initialBusiness || id) fetchDetail(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = useCallback(() => fetchDetail(true), [fetchDetail]);

  /* ----------------------------- helpers ----------------------------- */
  const humanize = (s?: string | null) =>
    (s ?? "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const openLink = (url?: string | null) => {
    if (!url) return;
    let final = url.trim();
    if (!/^https?:\/\//i.test(final)) final = "https://" + final;
    Linking.openURL(final).catch(() => {});
  };

  const openExternal = (url?: string | null) => openLink(url);

  const callPhone = (p?: string | null) => {
    if (!p) return;
    Linking.openURL(`tel:${p}`).catch(() => {});
  };

  const sendEmail = (e?: string | null) => {
    if (!e) return;
    Linking.openURL(`mailto:${e}`).catch(() => {});
  };

  /* ---------------------- Loading & Empty states --------------------- */
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" },
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
          { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text variant="body1" color={theme.colors.text}>No business found.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text variant="caption" color="#fff">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ------------------------------ MAIN UI ---------------------------- */
  const title = business.name ?? "Business";
  const bannerUri = business.business_logo || "";
  const chips: string[] = [
    business.categories?.[0] ?? "",
    business.business_type ?? "",
    business.city && business.country
      ? `${business.city}, ${business.country}`
      : (business.city ?? business.country ?? ""),
  ].filter(Boolean);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* ---------- Banner + Back ---------- */}
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.banner} resizeMode="cover" />
          ) : (
            <View style={[styles.banner, { backgroundColor: "rgba(0,0,0,0.06)" }]} />
          )}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: 16 }]}
            accessibilityRole="button"
            accessibilityLabel="Go Back"
          >
            <ArrowLeft size={22} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* ---------- Title ---------- */}
        <Text variant="h5" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

        {/* ---------- Chips ---------- */}
        {chips.length > 0 && (
          <View style={styles.chipsRow}>
            {chips.map((c, idx) => (
              <View key={idx} style={[styles.chip, { backgroundColor: theme.colors.primary ?? "#F3F4F6" }]}>
                <Text variant="overline" color={theme.colors.textWhite}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ---------- About ---------- */}
        {!!business.about_me && (
          <View style={{ marginBottom: 16 }}>
            <Text variant="body2" color={theme.colors.text}>{business.about_me}</Text>
          </View>
        )}

        {/* ---------- Location ---------- */}
        {(business.address || business.city || business.country) && (
          <View style={[styles.row, { marginBottom: 16 }]}>
            <MapPin size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Location</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                {business.address ? `${business.address}` : ""}
                {business.address && (business.city || business.country) ? ", " : ""}
                {[business.city, business.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          </View>
        )}

        {/* ---------- Promo / Discount ---------- */}
        {(business.promo_code || business.discount) && (
          <View style={[styles.row, { marginBottom: 16 }]}>
            <Tag size={20} color={theme.colors.primaryDark} />
            <View>
              {!!business.promo_code && (
                <>
                  <Text variant="overline">Promo Code</Text>
                  <Text variant="body1" color={theme.colors.primaryDark}>{business.promo_code}</Text>
                </>
              )}
              {!!business.discount && (
                <>
                  <Text variant="overline" style={{ marginTop: 6 }}>Discount</Text>
                  <Text variant="body1" color={theme.colors.primaryDark}>{business.discount}</Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* ---------- Quick Links ---------- */}
        <View style={styles.linksWrap}>
          {!!business.phone && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => callPhone(business.phone)}>
              <Phone size={18} color={theme.colors.primaryDark} />
              <Text variant="caption" color={theme.colors.primaryDark}>Call</Text>
            </TouchableOpacity>
          )}
          {!!business.email && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => sendEmail(business.email)}>
              <EnvelopeSimple size={18} color={theme.colors.primaryDark} />
              <Text variant="caption" color={theme.colors.primaryDark}>Email</Text>
            </TouchableOpacity>
          )}
          {!!business.website_link && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(business.website_link!)}>
              <Globe size={18} color={theme.colors.primaryDark} />
              <Text variant="caption" color={theme.colors.primaryDark}>Website</Text>
            </TouchableOpacity>
          )}
          {!!business.insta_link && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(business.insta_link!)}>
              <InstagramLogo size={18} color={theme.colors.primaryDark} />
              <Text variant="caption" color={theme.colors.primaryDark}>Instagram</Text>
            </TouchableOpacity>
          )}
          {!!business.fb_link && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => openLink(business.fb_link!)}>
              <FacebookLogo size={18} color={theme.colors.primaryDark} />
              <Text variant="caption" color={theme.colors.primaryDark}>Facebook</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ---------- Job Openings ---------- */}
        {!!business.Job?.length && (
          <View style={styles.jobsSection}>
            <Text variant="h6" style={[styles.jobsTitle, { color: theme.colors.text }]}>
              Job Openings
            </Text>

            {business.Job.map((job: ApiJob) => {
              const badgeLabel = job.job_type ? humanize(job.job_type) : "Open";
              return (
                <TouchableOpacity
                  key={job.id}
                  activeOpacity={0.9}
                  style={[styles.jobCard, { borderColor: theme.colors.primaryLight }]}
                  // onPress={() => openExternal(job.application_link)}
                >
                  {/* Title + chevron */}
                  <View style={styles.jobHeader}>
                    <Text variant="body1" style={[styles.jobTitle, { color: theme.colors.text }]}>
                      {job.title}
                    </Text>
<TouchableOpacity
  activeOpacity={0.7}
  onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
>
  <CaretRight size={18} color={"rgba(0,0,0,0.35)"} weight="bold" />
</TouchableOpacity>  

                </View>
                  {/* Short line / description (optional) */}
                  {!!job.description && (
                    <Text
                      variant="body2"
                      style={[styles.jobDesc, { color: theme.colors.textLight ?? theme.colors.text }]}
                      numberOfLines={2}
                    >
                      {job.description}
                    </Text>
                  )}
                  {/* Badge + location */}
                  <View style={styles.jobMetaRow}>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text variant="overline" style={{ color: theme.colors.primaryDark }}>
                        {badgeLabel}
                      </Text>
                    </View>

                    {!!job.location && (
                      <View style={styles.locRow}>
                        <MapPin size={14} color={theme.colors.primaryDark} />
                        <Text variant="caption" color={theme.colors.primaryDark}>
                          {job.location}
                        </Text>
                      </View>
                    )}
                  </View>

                  
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (business.website_link) openLink(business.website_link);
            else if (business.phone) callPhone(business.phone);
            else if (business.email) sendEmail(business.email);
          }}
          accessibilityRole="button"
          accessibilityLabel="Contact Business"
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={["#1BAD7A", "#008F5C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {business.website_link ? "Visit Website" : business.phone ? "Call Now" : business.email ? "Email" : "Contact"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* ------------------------------ Styles ----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  bannerWrap: {
    position: "relative",
    marginBottom: 20,
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  linksWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  linkBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  /* ---- Jobs ---- */
  jobsSection: {
    marginTop: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobTitle: {
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobDesc: {
    lineHeight: 18,
  },

  /* ---- CTA ---- */
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

export default BusinessDetail;
