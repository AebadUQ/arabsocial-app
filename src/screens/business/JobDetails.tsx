import React, { useCallback, useEffect, useState } from "react";
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
  id?: number | string;
  name: string;
  business_logo?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
};

type Commenter = {
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
  created_at?: string | null;
  business?: JobBusiness | null;
  posted_by?: Commenter | null;
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

  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) return `Posted ${Math.round(diff / minute)} mins ago`;
  if (diff < day) return `Posted ${Math.round(diff / hour)} hours ago`;
  return `Posted ${Math.round(diff / day)} days ago`;
};

const openExternal = (url?: string | null) => {
  if (!url) return;
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  Linking.openURL(u).catch(() => {});
};

const sendEmail = (e?: string | null) => e && Linking.openURL(`mailto:${e}`).catch(() => {});
const callPhone = (p?: string | null) => p && Linking.openURL(`tel:${p}`).catch(() => {});
const openMaps = (loc?: string | null) => {
  if (!loc) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
  Linking.openURL(url).catch(() => {});
};

/* ----------------------------- Screen ---------------------------- */
const JobDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const jobId = route.params?.jobId;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobDetails(jobId);
      setJob(data);
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  /* ---------------------------- Loading & Error ---------------------------- */
  if (loading) {
    return (
      <SafeAreaView style={[styles.centered]}>
        <ActivityIndicator size="large" color="#1BAD7A" />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.centered]}>
        <Text>Job not found.</Text>
      </SafeAreaView>
    );
  }

  /* ------------------------------- Extracted ------------------------------- */
  const { title, description, job_type, created_at, application_link } = job;

  const employer = job.business?.name ?? "";
  const location =
    job.location ??
    (job.business?.city && job.business?.country
      ? `${job.business.city}, ${job.business.country}`
      : job.business?.city ?? job.business?.country ?? "");

  const postedLabel = timeAgo(created_at);

  /* ------------------------------- UI --------------------------------- */
  return (
    <SafeAreaView style={[styles.container]}>
      {/* ---------------------------- TOP BAR ---------------------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color="#000" weight="bold" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Job Detail</Text>

        {user?.id == job.postedById ? (
          <TouchableOpacity
            style={[styles.topBtn, { backgroundColor: "#1BAD7A" }]}
            onPress={() => navigation.navigate("EditJob", { jobId: job.id })}
          >
            <PencilSimple size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.topBtn, { opacity: 0 }]} />
        )}
      </View>

      {/* ---------------------------- CONTENT ---------------------------- */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.jobTitle}>{title}</Text>

          {!!description && <Text style={styles.desc}>{description}</Text>}

          <View style={styles.chipRow}>
            {!!job_type && (
              <View style={styles.chipFilled}>
                <Text style={styles.chipFilledText}>{humanize(job_type)}</Text>
              </View>
            )}

            {!!postedLabel && (
              <View style={styles.chipOutline}>
                <Text style={styles.chipOutlineText}>{postedLabel}</Text>
              </View>
            )}
          </View>

          {!!employer && (
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Buildings size={18} color="#1BAD7A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Employer</Text>
                <Text style={styles.value}>{employer}</Text>
              </View>
            </View>
          )}

          {!!location && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openMaps(location)}
              style={styles.infoRow}
            >
              <View style={styles.iconCircle}>
                <MapPin size={18} color="#1BAD7A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Location</Text>
                <Text style={[styles.value, { textDecorationLine: "underline" }]}>
                  {location}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Card */}
        {(job.business?.email || job.business?.phone) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            {!!job.business?.email && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => sendEmail(job.business?.email)}
              >
                <View style={styles.contactIcon}>
                  <EnvelopeSimple size={18} color="#1BAD7A" />
                </View>
                <Text style={styles.contactText}>{job.business?.email}</Text>
              </TouchableOpacity>
            )}

            {!!job.business?.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => callPhone(job.business?.phone)}
              >
                <View style={styles.contactIcon}>
                  <Phone size={18} color="#1BAD7A" />
                </View>
                <Text style={styles.contactText}>{job.business?.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ---------------------------- APPLY NOW BUTTON ---------------------------- */}
      <View style={[styles.ctaContainer, { paddingBottom: Math.max(insets.bottom) }]}>
        <View style={styles.applyShadow}>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!application_link}
            onPress={() => openExternal(application_link)}
          >
            <LinearGradient
              colors={
                application_link ? ["#1BAD7A", "#008F5C"] : ["#9CA3AF", "#9CA3AF"]
              }
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>
                {application_link ? "Apply Now" : "No Application Link"}
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  /* TOP BAR */
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  /* CONTENT */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  jobTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#000",
  },

  desc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    color: "#444",
  },

  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  chipFilled: {
    backgroundColor: "rgba(27,173,122,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipFilledText: {
    color: "#1BAD7A",
    fontSize: 12,
    fontWeight: "600",
  },
  chipOutline: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipOutlineText: {
    fontSize: 12,
    color: "#777",
  },

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
    backgroundColor: "rgba(27,173,122,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    opacity: 0.7,
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(27,173,122,0.1)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    fontSize: 15,
    color: "#000",
    flex: 1,
  },

  /* APPLY BUTTON */
  ctaContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  applyShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },

  applyBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  applyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default JobDetailScreen;
