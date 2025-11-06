import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeft,
  MapPin,
  Buildings,
  EnvelopeSimple,
  Phone,
  PencilSimple,
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { getJobDetails } from "@/api/business";
import { useAuth } from "@/context/Authcontext";

/* ----------------------------- Types ----------------------------- */
type JobBusiness = {
  id: number | string;
  name: string;
  business_logo?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  categories?: string[] | null;
  email?: string | null;
  phone?: string | null;
};

type PostedBy = {
  id: number | string;
  name?: string | null;
  image?: string | null;
  profession?: string | null;
};

type JobDetail = {
  id: number | string;
  businessId: number | string;
  postedById: number | string;
  title: string;
  job_type?: string | null;
  location?: string | null;
  description?: string | null;
  application_link?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  business?: JobBusiness | null;
  posted_by?: PostedBy | null;
};

/* ----------------------------- Utils ----------------------------- */
const humanize = (s?: string | null) =>
  (s ?? "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const timeAgo = (iso?: string | null) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diff = Math.max(0, now - then);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const m = Math.round(diff / minute);
    return m <= 1 ? "Posted 1 min ago" : `Posted ${m} mins ago`;
  }
  if (diff < day) {
    const h = Math.round(diff / hour);
    return h <= 1 ? "Posted 1 hour ago" : `Posted ${h} hours ago`;
  }
  const d = Math.round(diff / day);
  return d <= 1 ? "Posted yesterday" : `Posted ${d} days ago`;
};

const openExternal = (url?: string | null) => {
  if (!url) return;
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  Linking.openURL(u).catch(() => {});
};
const sendEmail = (e?: string | null) => e && Linking.openURL(`mailto:${e}`).catch(() => {});
const callPhone = (p?: string | null) => p && Linking.openURL(`tel:${p}`).catch(() => {});
const openMaps = (q?: string | null) => {
  if (!q) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  Linking.openURL(url).catch(() => {});
};

/* ----------------------------- Screen ---------------------------- */
const JobDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const jobId: number | string | undefined = route?.params?.jobId;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setError("Missing job id");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getJobDetails(jobId);
      setJob(data as JobDetail);
    } catch (e: any) {
      console.error("❌ Failed to fetch job:", e);
      setError("Could not load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);


  const title = job?.title ?? "Job";
  const employer = job?.business?.name ?? "";
  const location =
    job?.location ??
    (job?.business?.city && job?.business?.country
      ? `${job.business.city}, ${job.business.country}`
      : job?.business?.city ?? job?.business?.country ?? "");

  const postedLabel = timeAgo(job?.created_at);

  /* ----------------------- Loading / Error states ---------------------- */
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!job || error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text variant="body1" color={theme.colors.text}>
          {error ?? "Job not found."}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text variant="caption" color="#fff">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ------------------------------- UI --------------------------------- */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top bar: back + title + conditional edit */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.topBtn, { backgroundColor: "rgba(0,0,0,0.06)" }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <ArrowLeft size={18} color={theme.colors.text} weight="bold" />
        </TouchableOpacity>

        <Text variant="body1" style={{ fontWeight: "800", color: theme.colors.text }} numberOfLines={1}>
          Job Detail  
          {/* {user.id == job.postedById ? 's':'a'} */}
        </Text>

        {user.id == job.postedById  ? (
          <TouchableOpacity
            style={[styles.topBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("EditJob", { jobId: job.id })}
            accessibilityRole="button"
            accessibilityLabel="Edit Job"
          >
            <PencilSimple size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.topBtn, { opacity: 0 }]} /> // spacer
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 96 }]} showsVerticalScrollIndicator={false}>
        {/* ===== Big Detail Card ===== */}
        <View style={[styles.card, styles.shadowSm, { borderColor: theme.colors.primaryLight }]}>
          {/* Title */}
          <Text variant="h5" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

          {/* Description */}
          {!!job.description && (
            <Text variant="body2" style={[styles.desc, { color: theme.colors.textLight ?? theme.colors.text }]}>
              {job.description}
            </Text>
          )}

          {/* Chips: job type (filled) + posted (outlined) */}
          <View style={styles.chipsRow}>
            {!!job.job_type && (
              <View style={[styles.chipFilled, { backgroundColor: theme.colors.primaryLight }]}>
                <Text variant="overline" style={{ color: theme.colors.primaryDark }}>
                  {humanize(job.job_type)}
                </Text>
              </View>
            )}
            {!!postedLabel && (
              <View style={[styles.chipOutlined, { borderColor: "rgba(0,0,0,0.12)" }]}>
                <Text variant="overline" style={{ color: "rgba(0,0,0,0.55)" }}>
                  {postedLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.primaryLight, opacity: 0.5 }]} />

          {/* Employer */}
          {!!employer && (
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                <Buildings size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" style={{ opacity: 0.7 }}>Employer</Text>
                <Text variant="body1" style={{ color: theme.colors.text }}>{employer}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          {!!location && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openMaps(location)}
              style={styles.infoRow}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                <MapPin size={18} color={theme.colors.primaryDark} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text variant="overline" style={{ opacity: 0.7 }}>Location</Text>
                <Text
                  variant="body1"
                  style={{ color: theme.colors.text, textDecorationLine: "underline" }}
                >
                  {location}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== Contact Information Card ===== */}
        {(job.business?.email || job.business?.phone) && (
          <View style={[styles.card, styles.shadowSm, { borderColor: theme.colors.primaryLight }]}>
            <Text variant="overline" style={[styles.contactTitle, { color: theme.colors.text }]}>
              Contact Information
            </Text>

            {!!job.business?.email && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => sendEmail(job.business?.email)}
                style={[styles.contactRow, { backgroundColor: theme.colors.primaryLight }]}
              >
                <View style={styles.contactIcon}>
                  <EnvelopeSimple size={18} color={theme.colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="overline" style={{ opacity: 0.7 }}>Email</Text>
                  <Text variant="body1" style={{ color: theme.colors.text }}>
                    {job.business?.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {!!job.business?.phone && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => callPhone(job.business?.phone)}
                style={[styles.contactRow, { backgroundColor: theme.colors.primaryLight }]}
              >
                <View style={styles.contactIcon}>
                  <Phone size={18} color={theme.colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="overline" style={{ opacity: 0.7 }}>Phone</Text>
                  <Text variant="body1" style={{ color: theme.colors.text }}>
                    {job.business?.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Apply CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openExternal(job.application_link)}
          disabled={!job.application_link}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={job.application_link ? ["#1BAD7A", "#008F5C"] : ["#9CA3AF", "#9CA3AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {job.application_link ? "Apply Now" : "No Application Link"}
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
  content: { paddingHorizontal: 12, paddingTop: 8 },

  // Top bar
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Big white rounded cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  shadowSm: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  desc: { lineHeight: 22, marginBottom: 12 },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chipFilled: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOutlined: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },

  divider: { height: 1, width: "100%", marginVertical: 12 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: { flex: 1 },

  contactTitle: { fontSize: 18, marginBottom: 12 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  /* CTA */
  ctaWrap: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10 },
  ctaShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtn: { height: 56, alignItems: "center", justifyContent: "center", width: "100%" },
});

export default JobDetailScreen;
