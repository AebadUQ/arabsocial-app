import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import Card from "@/components/Card";

import ImageView from "react-native-image-viewing";   // ⭐ FULLSCREEN PREVIEW

import {
  ArrowLeftIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  XLogoIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  MapPinIcon,
  FlagIcon,
  GenderFemaleIcon,
  RulerIcon,
  HeartIcon,
  HandsPrayingIcon,
  GraduationCapIcon,
  TranslateIcon,
  ListDashesIcon,
} from "phosphor-react-native";

import { getPublicUserProfile } from "@/api/auth";

// ======================================================
// Helpers
// ======================================================

const safeValue = (value: any) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

function maybeShow(visible: boolean | undefined, value: any): string | null {
  if (!visible) return null;
  return safeValue(value);
}

// ======================================================
// Screen
// ======================================================

const PublicProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const userId = route.params?.userId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ Avatar Preview State
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPublicUserProfile(Number(userId));
      setData(res);
    } catch (err) {
      console.error("Failed to load public profile", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ------------------------------------------------------
  // Loading / Error Screens
  // ------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text variant="body1" color={theme.colors.text}>
          Failed to load profile.
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

  // ------------------------------------------------------
  // Extract data
  // ------------------------------------------------------

  const vs = data.visibility_settings || {};
  const avatarUri = data.image || data.img || "https://i.pravatar.cc/200?img=12";

  const languagesArr =
    Array.isArray(data.language_spoken) && data.language_spoken.length > 0
      ? data.language_spoken
      : [];

  // visibility-based detail rows
  const detailRowsRaw = [
    {
      key: "email",
      icon: EnvelopeSimpleIcon,
      label: "Email",
      val: maybeShow(vs.email, data.email),
    },
    {
      key: "phone",
      icon: PhoneIcon,
      label: "Phone",
      val: maybeShow(vs.phone, data.phone),
    },
    {
      key: "city_state",
      icon: MapPinIcon,
      label: "State · City",
      val: maybeShow(
        vs.state || vs.city,
        `${safeValue(data.state)} · ${safeValue(data.location || data.country)}`
      ),
    },
    {
      key: "nationality",
      icon: FlagIcon,
      label: "Nationality",
      val: maybeShow(vs.nationality, data.nationality),
    },
    {
      key: "gender",
      icon: GenderFemaleIcon,
      label: "Gender",
      val: maybeShow(vs.gender, data.gender),
    },
    {
      key: "height",
      icon: RulerIcon,
      label: "Height",
      val: maybeShow(vs.height, data.height),
    },
    {
      key: "marital_status",
      icon: HeartIcon,
      label: "Marital status",
      val: maybeShow(vs.marital_status, data.marital_status),
    },
    {
      key: "religion",
      icon: HandsPrayingIcon,
      label: "Religion",
      val: maybeShow(vs.religion, data.religion),
    },
    {
      key: "education",
      icon: GraduationCapIcon,
      label: "Educational level",
      val: maybeShow(vs.education, data.education),
    },
    {
      key: "language_spoken",
      icon: TranslateIcon,
      label: "Languages",
      val: maybeShow(
        vs.language_spoken ?? vs.language,
        languagesArr.length > 0 ? languagesArr.join(", ") : "N/A"
      ),
    },
  ];

  const detailRows = detailRowsRaw.filter((r) => r.val !== null);

  const aboutText =
    vs.about_me && safeValue(data.about_me) !== "N/A" ? data.about_me : null;

  const professionText =
    vs.profession && safeValue(data.profession) !== "N/A"
      ? data.profession
      : null;

  const usernameText =
    vs.username && safeValue(data.username) !== "N/A"
      ? data.username
      : null;

  const dobText =
    vs.dob &&
    (safeValue(data.dob) !== "N/A" || safeValue(data.age) !== "N/A")
      ? data.age
        ? `${data.age} yrs`
        : data.dob
      : null;

  // Socials
  const socialsEntries =
    data.social_links && typeof data.social_links === "object"
      ? Object.entries(data.social_links).filter(([_, v]) => !!v)
      : [];

  // ------------------------------------------------------
  // UI RENDER
  // ------------------------------------------------------

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.background }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeftIcon size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <Text variant="body1" color={theme.colors.text}>
            Profile
          </Text>
        </View>

        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <Card>
          <View style={styles.avatarCardContent}>

            {/* ⭐ FULLSCREEN PREVIEW ENABLED */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setAvatarPreviewVisible(true)}
            >
              <View
                style={[
                  styles.avatarBorder,
                  { borderColor: theme.colors.primaryLight },
                ]}
              >
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              </View>
            </TouchableOpacity>

            {/* ⭐ Fullscreen Avatar Viewer */}
            <ImageView
              images={[{ uri: avatarUri }]}
              visible={avatarPreviewVisible}
              onRequestClose={() => setAvatarPreviewVisible(false)}
              swipeToCloseEnabled={true}
              doubleTapToZoomEnabled={true}
              backgroundColor="#000"
              animationType="slide"
              presentationStyle="overFullScreen" imageIndex={0}            />

            <Text
              variant="h5"
              style={styles.nameText}
              color={theme.colors.text}
            >
              {safeValue(data.name)}
            </Text>

            {usernameText && (
              <Text variant="caption" color={theme.colors.textLight}>
                @{usernameText}
              </Text>
            )}

            {professionText && (
              <Text variant="caption" color={theme.colors.textLight}>
                {professionText}
              </Text>
            )}

            {dobText && (
              <Text variant="caption" color={theme.colors.textLight}>
                {dobText}
              </Text>
            )}

            {/* Social Links */}
            {socialsEntries.length > 0 && (
              <View style={styles.socialRow}>
                {socialsEntries.map(([key, value]) => {
                  const IconComp =
                    key === "facebook"
                      ? FacebookLogoIcon
                      : key === "twitter"
                      ? XLogoIcon
                      : key === "instagram"
                      ? InstagramLogoIcon
                      : ListDashesIcon;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.socialIconWrap,
                        { borderColor: theme.colors.primaryLight },
                      ]}
                    >
                      <IconComp size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </Card>

        {/* About */}
        {aboutText && (
          <Card>
            <View style={styles.sectionTextWrap}>
              <Text variant="body1" style={styles.sectionTitle}>
                About me
              </Text>
              <Text variant="body1" color={theme.colors.textLight}>
                {aboutText}
              </Text>
            </View>
          </Card>
        )}

        {/* Personal details */}
        {detailRows.length > 0 && (
          <Card>
            <View style={styles.sectionHeaderRow}>
              <Text variant="body1" style={styles.sectionTitle}>
                Personal Details
              </Text>
            </View>

            <View style={styles.detailsList}>
              {detailRows.map((row) => {
                const IconComp = row.icon;
                return (
                  <View
                    style={[
                      styles.row,
                      { borderBottomColor: theme.colors.borderColor },
                    ]}
                    key={row.key}
                  >
                    <View
                      style={[
                        styles.detailIconWrap,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <IconComp size={20} color={theme.colors.primary} />
                    </View>

                    <View style={styles.detailTextWrap}>
                      <Text variant="overline" color={theme.colors.textLight}>
                        {row.label}
                      </Text>
                      <Text variant="body1" color={theme.colors.text}>
                        {row.val}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ======================================================
// Styles
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingHorizontal: 20,
    gap: 20,
  },

  retryBtn: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
  },

  avatarCardContent: {
    alignItems: "center",
  },
  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 100,
    marginBottom: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },
  nameText: {
    textTransform: "capitalize",
    marginBottom: 2,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  socialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTextWrap: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailsList: {
    paddingTop: 10,
  },

  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextWrap: {
    flex: 1,
  },
});

export default PublicProfileScreen;
