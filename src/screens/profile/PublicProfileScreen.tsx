import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text as RNText,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";

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

import { getPublicUserProfile } from "@/api/auth"; // <- update this import path to wherever you put getPublicUserProfile

// ---------- helpers ----------
const safeValue = (value: any) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

// if visibility says false => hide, else show value or N/A
function maybeShow(
  visible: boolean | undefined,
  value: any
): string | null {
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
          { backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
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
          { backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
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

  // interests -> could be array or string or null
  const interestsArr =
    Array.isArray(data.interests) && data.interests.length > 0
      ? data.interests
      : typeof data.interests === "string" && data.interests?.trim() !== ""
      ? [data.interests]
      : [];

  // languages -> array of strings
  const languagesArr =
    Array.isArray(data.language_spoken) && data.language_spoken.length > 0
      ? data.language_spoken
      : [];

  // gallery
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const hasGallery = vs.gallery && gallery.length > 0;
  const MAX_PREVIEW = 3;
  const preview = hasGallery ? gallery.slice(0, MAX_PREVIEW) : [];

  // prepare details WITH visibility rules
  // If vs.<field> = true -> show value
  // If false/undefined -> hide whole row (return null and we won't render)
  const detailRowsRaw = [
    {
      key: "email",
      icon: EnvelopeSimpleIcon,
      label: "Email",
      val: maybeShow(true, data.email), // email isn't in sample visibility, so default to hidden? your call.
      // if you only want to show when vs.email === true, change to maybeShow(vs.email, data.email)
    },
    {
      key: "phone",
      icon: PhoneIcon,
      label: "Phone",
      val: maybeShow(true, data.phone),
    },
    {
      key: "city_state",
      icon: MapPinIcon,
      label: "State · City",
      val: maybeShow(true, `${safeValue(data.state)} · ${safeValue(data.location || data.country)}`),
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

  // interests visibility
  const interestsVisible = vs.interests;
  const showInterests =
    interestsVisible && interestsArr.length > 0
      ? interestsArr.join(", ")
      : null;

  // username visibility
  const usernameText = vs.username ? safeValue(data.username) : null;

  // dob/age visibility
  const dobVisible = vs.dob;
  const dobText =
    dobVisible && (safeValue(data.dob) !== "N/A" || safeValue(data.age) !== "N/A")
      ? (data.age ? `${data.age} yrs` : data.dob)
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
      {/* header back */}
      <View style={styles.overlayRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
        >
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
        {/* public profile is read-only, no edit pencil */}
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />

          <Text variant="h5">{safeValue(data.name)}</Text>

          {/* profession (only if visible) */}
          {professionText ? (
            <Text variant="caption" color={theme.colors.textLight}>
              {professionText}
            </Text>
          ) : null}

        </View>

        {/* Social Icons */}
        {socialsEntries.length > 0 && (
          <View style={styles.socialRow}>
            {socialsEntries.map(([key, value], idx) => {
              // choose proper icon
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
                  style={{ marginRight: 12 }}
                  onPress={() => {
                    console.log("open social link:", key, value);
                    // you can Linking.openURL(value) if it's a URL
                  }}
                >
                  <IconComp size={20} color={theme.colors.text} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* About me (respect visibility) */}
        {aboutText && (
          <View
            style={[
              styles.sectionRow,
              { borderBottomColor: theme.colors.borderColor },
            ]}
          >
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
          </View>
        )}

        {/* Interests (respect visibility) */}
        {showInterests && (
          <View
            style={[
              styles.sectionRow,
              { borderBottomColor: theme.colors.borderColor },
            ]}
          >
            <View style={styles.sectionTextWrap}>
              <Text
                variant="body1"
                color={theme.colors.text}
                style={styles.sectionTitle}
              >
                Interests
              </Text>
              <Text variant="body1" color={theme.colors.textLight}>
                {showInterests}
              </Text>
            </View>
          </View>
        )}

        {/* Gallery (respect vs.gallery) */}
        <View style={styles.galleryHeader}>
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.sectionTitle}
          >
            Gallery
          </Text>
          {hasGallery && gallery.length > MAX_PREVIEW && (
            <TouchableOpacity
              onPress={() => console.log("View all gallery")}
              accessibilityRole="button"
            >
              <Text variant="caption" color={theme.colors.primary}>
                View all ({gallery.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.galleryRow}>
          {hasGallery ? (
            preview.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.thumb} />
            ))
          ) : (
            <RNText
              style={[styles.noImageText, { color: theme.colors.textLight }]}
            >
              No image in gallery
            </RNText>
          )}
        </View>

        {/* Personal details section */}
        {detailRows.length > 0 && (
          <>
            <View style={styles.sectionRowTightNoLine}>
              <Text
                variant="body1"
                color={theme.colors.text}
                style={styles.sectionTitle}
              >
                Personal details
              </Text>
            </View>

            <View style={styles.detailsList}>
              {detailRows.map((row) => {
                const IconHere = row.icon || ListDashesIcon;
                return (
                  <View style={styles.detailRow} key={row.key}>
                    <IconHere
                      size={20}
                      color={theme.colors.primaryDark}
                      weight="regular"
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text variant="overline">{row.label}</Text>
                      <Text
                        variant="body1"
                        color={theme.colors.primaryDark}
                      >
                        {row.val}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------
// styles
// ---------------------------
const TILE = 100;
const RADIUS = 10;

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  content: { padding: 20, paddingTop: 40 },

  overlayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  avatarWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: "cover",
    backgroundColor: "#e9e9e9",
    marginBottom: 8,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 6,
    marginBottom: 14,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },

  sectionRowTightNoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 16,
  },

  sectionTextWrap: { flex: 1, paddingRight: 8 },
  sectionTitle: { fontWeight: "600", marginBottom: 4 },

  galleryHeader: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },

  galleryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: TILE,
  },

  thumb: {
    width: TILE,
    height: TILE,
    borderRadius: RADIUS,
    backgroundColor: "#e9e9e9",
  },

  noImageText: {
    fontSize: 16,
    fontStyle: "italic",
  },

  detailsList: {
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default PublicProfileScreen;
