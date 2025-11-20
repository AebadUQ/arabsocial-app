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

// ---------- helpers ----------
const safeValue = (value: any) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

// if visibility says false => hide, else show value or N/A
function maybeShow(visible: boolean | undefined, value: any): string | null {
  if (!visible) return null; // hide entire row
  const v = safeValue(value);
  return v;
}

type PublicUser = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  state: string | null;
  country: string | null;
  marital_status: string | null;
  interests: string[] | string | null;
  profession: string | null;
  social_links: Record<string, string> | null;
  image: string | null;
  img: string | null;
  about_me: string | null;
  nationality: string | null;
  dob: string | null;
  gender: string | null;
  height: string | null;
  education: string | null;
  language_spoken: string[] | null;
  religion: string | null;
  age: string | number | null;
  gallery: string[] | null;
  username: string | null;
  visibility_settings?: {
    [key: string]: boolean;
  };
  firebase_id?: string | null;
  roleId?: number;
};

const PublicProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const userId = route.params?.userId;

  const [data, setData] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // safety fallbacks while loading or no data
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

  const vs = data.visibility_settings || {};

  // avatar
  const avatarUri =
    data.image || data.img || "https://i.pravatar.cc/200?img=12";

  // languages -> array of strings
  const languagesArr =
    Array.isArray(data.language_spoken) && data.language_spoken.length > 0
      ? data.language_spoken
      : [];

  // prepare details WITH visibility rules
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
        vs.state || vs.city || vs.location,
        `${safeValue(data.state)} · ${safeValue(
          data.location || data.country
        )}`
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

  // filter out rows completely hidden
  const detailRows = detailRowsRaw.filter((row) => row.val !== null);

  // about me visibility
  const aboutVisible = vs.about_me;
  const aboutText =
    aboutVisible && safeValue(data.about_me) !== "N/A"
      ? data.about_me
      : null;

  // profession visibility
  const professionText = vs.profession ? safeValue(data.profession) : null;

  // username visibility
  const usernameText = vs.username ? safeValue(data.username) : null;

  // dob/age visibility
  const dobVisible = vs.dob;
  const dobText =
    dobVisible &&
    (safeValue(data.dob) !== "N/A" || safeValue(data.age) !== "N/A")
      ? data.age
        ? `${data.age} yrs`
        : data.dob
      : null;

  // socials
  const socialsEntries =
    data.social_links && typeof data.social_links === "object"
      ? Object.entries(data.social_links).filter(([_, v]) => !!v)
      : [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* 🔹 Top header same vibe as ProfileScreen */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeftIcon size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>

          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.topTitle}
          >
            Profile
          </Text>
        </View>

        {/* Right side blank (no edit) */}
        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + basic info */}
        <Card>
          <View style={styles.avatarCardContent}>
            <View
              style={[
                styles.avatarBorder,
                { borderColor: theme.colors.primaryLight },
              ]}
            >
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </View>

            <Text
              variant="h5"
              style={styles.nameText}
              color={theme.colors.text}
            >
              {safeValue(data.name)}
            </Text>

            {/* username (agar visible ho) */}
            {usernameText && (
              <Text variant="caption" color={theme.colors.textLight}>
                @{usernameText}
              </Text>
            )}

            {/* profession (only if visible) */}
            {professionText && (
              <Text
                variant="caption"
                color={theme.colors.textLight}
                style={{ marginTop: 2 }}
              >
                {professionText}
              </Text>
            )}

            {/* dob / age */}
            {dobText && (
              <Text
                variant="caption"
                color={theme.colors.textLight}
                style={{ marginTop: 2 }}
              >
                {dobText}
              </Text>
            )}

            {/* Socials */}
            {socialsEntries.length > 0 && (
              <View style={styles.socialRow}>
                {socialsEntries.map(([key, value], idx) => {
                  let IconComp: any;
                  switch (key) {
                    case "facebook":
                      IconComp = FacebookLogoIcon;
                      break;
                    case "twitter":
                      IconComp = XLogoIcon;
                      break;
                    case "instagram":
                      IconComp = InstagramLogoIcon;
                      break;
                    default:
                      IconComp = ListDashesIcon;
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.socialIconWrap,
                        { borderColor: theme.colors.primaryLight },
                      ]}
                      onPress={() =>
                        console.log("open social link:", key, value)
                      }
                    >
                      <IconComp size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </Card>

        {/* About me */}
        {aboutText && (
          <Card>
            <View style={styles.sectionTextWrap}>
              <Text
                variant="body1"
                color={theme.colors.text}
                style={styles.sectionTitle}
              >
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
              <Text
                variant="body1"
                color={theme.colors.text}
                style={styles.sectionTitle}
              >
                Personal Details
              </Text>
            </View>

            <View style={styles.detailsList}>
              {detailRows.map((row) => {
                const IconHere = row.icon || ListDashesIcon;
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
                      <IconHere
                        size={20}
                        color={theme.colors.primary}
                        weight="regular"
                      />
                    </View>

                    <View style={styles.detailTextWrap}>
                      <Text
                        variant="overline"
                        color={theme.colors.textLight}
                      >
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

// ---------------------------
// styles
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* 🔹 Top bar styles (same vibe as ProfileScreen) */
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
    columnGap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {},

  content: {
    paddingHorizontal: 20,
    display: "flex",
    gap: 20,
  },

  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  // avatar card
  avatarCardContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    resizeMode: "cover",
  },
  nameText: {
    textTransform: "capitalize",
    marginBottom: 2,
  },

  // socials
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 8,
    marginTop: 10,
  },
  socialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  // sections
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

  // detail row (same pattern as ProfileScreen)
  row: {
    flexDirection: "row",
    columnGap: 12,
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
    marginLeft: 4,
  },
});

export default PublicProfileScreen;
