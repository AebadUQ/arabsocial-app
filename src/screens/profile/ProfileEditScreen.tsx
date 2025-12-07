import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import InputField from "@/components/Input";
import LinearGradient from "react-native-linear-gradient";
import { ArrowLeftIcon, User } from "phosphor-react-native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useAuth } from "@/context/Authcontext";
import { Country, State } from "country-state-city";
import { Asset, launchImageLibrary } from "react-native-image-picker";

import {
  MARITAL_OPTIONS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  LANGUAGE_OPTIONS,
  PROFESSION_OPTIONS,
} from "@/utils/dropdown";

import Card from "@/components/Card";
import { uploadProfileImage } from "@/api/auth";
import { theme } from "@/theme/theme";

type FormState = {
  name: string;
  state: string;
  nationality: string;
  profession: string;
  gender: string;
  height: string;
  marital_status: string;
  age: string;
  religion: string;
  education: string;
  language_spoken: string;
  about_me: string;
};

type FormErrors = Partial<FormState & { country: string }>;
type FieldName =
  | "name"
  | "profession"
  | "about_me"
  | "country"
  | "state"
  | "gender"
  | "nationality"
  | "marital_status"
  | "education"
  | "age";

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme: appTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    state: "",
    nationality: "",
    profession: "",
    gender: "",
    height: "",
    marital_status: "",
    age: "",
    religion: "",
    education: "",
    language_spoken: "",
    about_me: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  const [socialLinks, setSocialLinks] = useState({
    facebook: user?.social_links?.facebook || "",
    instagram: user?.social_links?.instagram || "",
    twitter: user?.social_links?.twitter || "",
  });

  // ---------------- Avatar State ----------------
  const defaultAvatar = user?.image || user?.img || "";
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const onPickAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        maxWidth: 1400,
        maxHeight: 1400,
        selectionLimit: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0] as Asset | undefined;
      if (!asset?.uri) return;

      setAvatarUri(asset.uri);
      setAvatarUploading(true);

      const { url } = await uploadProfileImage(asset);
      setAvatarUri(url);
    } catch (e) {
      console.log("Avatar upload error:", e);
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setAvatarUri(user.image || user.img || "");
    }
  }, [user]);

  // ---------------- Form Prefill ----------------
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        state: user.state || "",
        nationality: user.nationality || "",
        profession: user.profession || "",
        gender: user.gender || "",
        height: user.height || "",
        marital_status: user.marital_status || "",
        age: user.age ? String(user.age) : "",
        religion: user.religion || "",
        education: user.education || "",
        language_spoken: Array.isArray(user.language_spoken)
          ? user.language_spoken.join(", ")
          : user.language_spoken || "",
        about_me: user.about_me || "",
      });

      if (user.country) setSelectedCountry(user.country);
      if (user.state) setSelectedState(user.state);
    }
  }, [user]);

  // ---------------- Country / State setup ----------------
  useEffect(() => {
    setCountries(Country.getAllCountries().map((c) => c.name));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find((c) => c.name === selectedCountry);
      const stateList = State.getStatesOfCountry(countryObj?.isoCode || "").map((s) => s.name);
      setStates(stateList);

      setForm((prev) => ({
        ...prev,
        //@ts-ignore
        nationality: countryObj?.demonym || `${selectedCountry} citizen`,
      }));
    }
  }, [selectedCountry]);

  // ---------------- Handlers ----------------
  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSocialChange = (key: keyof typeof socialLinks, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required.";
    if (!form.profession.trim()) newErrors.profession = "Profession is required.";
    if (!form.about_me.trim()) newErrors.about_me = "About me is required.";

    if (!selectedCountry.trim()) newErrors.country = "Country is required.";
    if (!selectedState.trim()) newErrors.state = "State / City is required.";

    if (!form.gender.trim()) newErrors.gender = "Gender is required.";
    if (!form.nationality.trim()) newErrors.nationality = "Nationality is required.";
    if (!form.marital_status.trim()) newErrors.marital_status = "Marital status is required.";
    if (!form.education.trim()) newErrors.education = "Education is required.";

    if (!form.age.trim()) newErrors.age = "Age is required.";
    else if (isNaN(Number(form.age))) newErrors.age = "Age must be numeric.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);

      const updatedData = {
        ...form,
        country: selectedCountry,
        state: selectedState,
        age: Number(form.age),
        image: avatarUri,
        img: avatarUri,
        language_spoken: form.language_spoken
          ? form.language_spoken.split(",").map((v) => v.trim())
          : [],
        social_links: socialLinks,
      };

      await updateProfile(updatedData);
      navigation.goBack();
    } catch (err) {
      console.log("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      {/* Top Back Button */}
      <View style={styles.overlayRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* MAIN FORM */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 20 }}>
          {/* ---------------- Avatar CARD ---------------- */}
          <Card>
            <View style={styles.avatarCardRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={onPickAvatar}>
                <View
                  style={[styles.avatarBorder, { borderColor: appTheme.colors.primaryLight }]}
                >
                  {/* Circle always 100×100 */}
                  <View style={styles.avatarWrapper}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                      <User size={50} color={theme.colors.primary} weight="duotone" />
                    )}
                  </View>

                  {avatarUploading && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.avatarOverlayText}>Updating...</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.cardFieldsGap}>
              <InputField
                label="Full Name"
                labelColor={theme.colors.textLight}
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
                placeholder="Enter Full Name"
                error={errors.name}
              />

              <BottomSheetSelect
                label="Profession"
                labelColor={theme.colors.textLight}
                value={form.profession}
                onChange={(v) => handleChange("profession", v)}
                options={PROFESSION_OPTIONS}
                placeholder="Select profession"
                sheetTitle="Select Profession"
                error={errors.profession}
              />
            </View>
          </Card>

          {/* ---------------- ABOUT CARD ---------------- */}
          <Card>
            <Text style={styles.sectionTitle}>About Me</Text>

            <InputField
              value={form.about_me}
              
              onChangeText={(v) => handleChange("about_me", v)}
              multiline
              numberOfLines={4}
              placeholder="Write something..."
              error={errors.about_me}
            />
          </Card>

          {/* ---------------- Personal Details ---------------- */}
          <Card>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <View style={styles.cardFieldsGap}>
              <InputField labelColor={theme.colors.textLight} label="Email Address*" value={user?.email} readOnly />
              <InputField labelColor={theme.colors.textLight} label="Phone" value={user?.phone} readOnly />

              <BottomSheetSelect
              labelColor={theme.colors.textLight}
                label="Country"
                value={selectedCountry}
                onChange={(v) => setSelectedCountry(v)}
                options={countries}
                placeholder="Select Country"
                sheetTitle="Select Country"
                error={errors.country}
              />

              {selectedCountry ? (
                <BottomSheetSelect
                labelColor={theme.colors.textLight}
                  label="City / State"
                  value={selectedState}
                  onChange={(v) => setSelectedState(v)}
                  options={states}
                  placeholder="Select City / State"
                  sheetTitle="Select City"
                  error={errors.state}
                />
              ) : null}

              <InputField
                label="Nationality"
                labelColor={theme.colors.textLight}
                value={form.nationality}
                onChangeText={(v) => handleChange("nationality", v)}
                error={errors.nationality}
              />

              <BottomSheetSelect
                label="Gender"
                labelColor={theme.colors.textLight}
                value={form.gender}
                onChange={(v) => handleChange("gender", v)}
                options={GENDER_OPTIONS}
                error={errors.gender}
              />

              <BottomSheetSelect
                label="Religion"
                labelColor={theme.colors.textLight}
                value={form.religion}
                onChange={(v) => handleChange("religion", v)}
                options={RELIGION_OPTIONS}
              />

              <BottomSheetSelect
                label="Education"
                labelColor={theme.colors.textLight}
                value={form.education}
                onChange={(v) => handleChange("education", v)}
                options={EDUCATION_OPTIONS}
                error={errors.education}
              />

              <BottomSheetSelect
                label="Languages Spoken"
                labelColor={theme.colors.textLight}
                value={form.language_spoken}
                onChange={(v) => handleChange("language_spoken", v)}
                options={LANGUAGE_OPTIONS}
              />

              <InputField
                label="Height"
                labelColor={theme.colors.textLight}
                value={form.height}
                onChangeText={(v) => handleChange("height", v)}
              />

              <BottomSheetSelect
                label="Marital Status"
                labelColor={theme.colors.textLight}
                value={form.marital_status}
                onChange={(v) => handleChange("marital_status", v)}
                options={MARITAL_OPTIONS}
                error={errors.marital_status}
              />

              <InputField
                label="Age"
                labelColor={theme.colors.textLight}
                value={form.age}
                onChangeText={(v) => handleChange("age", v)}
                keyboardType="numeric"
                error={errors.age}
              />
            </View>
          </Card>

          {/* ---------------- SOCIAL LINKS ---------------- */}
          <Card>
            <Text style={styles.sectionTitle}>Social Links</Text>

            <View style={styles.cardFieldsGap}>
              <InputField
                label="Facebook"
                labelColor={theme.colors.textLight}
                value={socialLinks.facebook}
                onChangeText={(v) => handleSocialChange("facebook", v)}
              />

              <InputField
                label="Instagram"
                labelColor={theme.colors.textLight}
                value={socialLinks.instagram}
                onChangeText={(v) => handleSocialChange("instagram", v)}
              />

              <InputField
                label="Twitter"
                labelColor={theme.colors.textLight}
                value={socialLinks.twitter}
                onChangeText={(v) => handleSocialChange("twitter", v)}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* ---------------- SAVE BUTTON ---------------- */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.ctaShadow}>
          <TouchableOpacity activeOpacity={0.9} onPress={onSave} disabled={saving}>
            <LinearGradient colors={["#1BAD7A", "#1BAD7A"]} style={styles.ctaBtn}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlayRow: { padding: 10 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: { padding: 20, gap: 20 },

  // ------------ AVATAR UI EXACT SAME AS PROFILE SCREEN ------------
  avatarCardRow: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#EEE",
    
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    resizeMode: "cover",
  },
  avatarOverlay: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlayText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
  },

  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },

  cardFieldsGap: {
    display: "flex",
    gap: 16,
  },

  // ------------ CTA BUTTON ------------
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
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
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileEditScreen;
