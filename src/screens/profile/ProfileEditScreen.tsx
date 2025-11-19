import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import InputField from "@/components/Input";
import LinearGradient from "react-native-linear-gradient";
import { ArrowLeftIcon } from "phosphor-react-native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useAuth } from "@/context/Authcontext";
import { Country, State } from "country-state-city";
import { Asset, launchImageLibrary } from "react-native-image-picker";

// dropdown options
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

type FormErrors = Partial<
  FormState & {
    country: string;
  }
>;

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

  const [interests, setInterests] = useState<string[]>(
    user?.interests && Array.isArray(user.interests) && user.interests.length > 0
      ? user.interests
      : []
  );

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const [socialLinks, setSocialLinks] = useState({
    facebook: user?.social_links?.facebook || "",
    instagram: user?.social_links?.instagram || "",
    twitter: user?.social_links?.twitter || "",
  });

  // ----- Avatar upload state -----
  const defaultAvatar =
    user?.image || user?.img || "https://i.pravatar.cc/200?img=12";

  const [avatarUri, setAvatarUri] = useState<string>(defaultAvatar);
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

      // pehle local preview
      setAvatarUri(asset.uri);
      setAvatarUploading(true);

      // server pe upload
      const { url } = await uploadProfileImage(asset);
      // server se aaya final URL
      setAvatarUri(url);
    } catch (e) {
      console.log(e)
      console.error("Image picker / upload error:", e);
      
      // optional: revert to old image if needed
    } finally {
      setAvatarUploading(false);
    }
  };

  // avatar ko user change hone pe sync rakho
  useEffect(() => {
    if (user) {
      setAvatarUri(
        user.image || user.img || "https://i.pravatar.cc/200?img=12"
      );
    }
  }, [user]);

  // --- Scroll setup using measureLayout ---
  const scrollRef = useRef<ScrollView | null>(null);
  const containerRef = useRef<View | null>(null);

  const fieldRefs = useRef<Record<FieldName, View | null>>({
    name: null,
    profession: null,
    about_me: null,
    country: null,
    state: null,
    gender: null,
    nationality: null,
    marital_status: null,
    education: null,
    age: null,
  });

  const setFieldRef = (name: FieldName) => (el: View | null) => {
    fieldRefs.current[name] = el;
  };

  const scrollToField = (name: FieldName) => {
    const field = fieldRefs.current[name];
    const container = containerRef.current;
    const scroll = scrollRef.current;

    if (field && container && scroll) {
      // @ts-ignore
      field.measureLayout(
        container,
        (_x: number, y: number) => {
          scroll.scrollTo({
            y: Math.max(y - 20, 0),
            animated: true,
          });
        },
        () => {}
      );
    }
  };

  // ---- Country / State ----
  useEffect(() => {
    const countryList = Country.getAllCountries().map((c) => c.name);
    setCountries(countryList);
  }, []);

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
      if (user.state) setSelectedState(user.state);
      if (user.country) setSelectedCountry(user.country);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === selectedCountry
      );

      const stateList = State.getStatesOfCountry(countryObj?.isoCode || "").map(
        (s) => s.name
      );
      setStates(stateList);

      setForm((prev) => ({ ...prev, state: "" }));

      setForm((prev) => ({
        ...prev,
        nationality:
          // @ts-ignore
          countryObj?.demonym || `${selectedCountry} citizen`,
      }));
      setErrors((prev) => ({ ...prev, nationality: "" }));
    }
  }, [selectedCountry]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSocialChange = (
    key: keyof typeof socialLinks,
    value: string
  ) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required.";
    if (!form.profession.trim())
      newErrors.profession = "Profession is required.";
    if (!form.about_me.trim()) newErrors.about_me = "About me is required.";

    if (!selectedCountry.trim()) newErrors.country = "Country is required.";
    if (!selectedState.trim()) newErrors.state = "City is required.";

    if (!form.gender.trim()) newErrors.gender = "Gender is required.";
    if (!form.nationality.trim())
      newErrors.nationality = "Nationality is required.";
    if (!form.marital_status.trim())
      newErrors.marital_status = "Marital status is required.";
    if (!form.education.trim())
      newErrors.education = "Education level is required.";

    if (!form.age.trim()) {
      newErrors.age = "Age is required.";
    } else if (isNaN(Number(form.age))) {
      newErrors.age = "Age must be a number.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const order: FieldName[] = [
        "name",
        "profession",
        "about_me",
        "country",
        "state",
        "gender",
        "nationality",
        "marital_status",
        "education",
        "age",
      ];

      const firstErrorKey = order.find(
        (k) => newErrors[k] !== undefined && newErrors[k] !== ""
      );
      if (firstErrorKey) {
        requestAnimationFrame(() => {
          scrollToField(firstErrorKey);
        });
      }
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        ...form,
        name: form.name,
        country: selectedCountry,
        age: parseInt(form.age, 10),
        state: selectedState,
        interests: interests,
        language_spoken: form.language_spoken
          ? form.language_spoken.split(",").map((l) => l.trim())
          : [],
        social_links: socialLinks,
        // 👇 avatar ko bhi backend ko bhej rahe
        image: avatarUri,
        img: avatarUri,
      };

      await updateProfile(updatedData);
      navigation.goBack();
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: appTheme.colors.background }]}
    >
      {/* Top back button */}
      <View style={styles.overlayRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
        >
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 50 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View ref={containerRef} style={{ display: "flex", gap: 20 }}>
          {/* CARD 1: Avatar + Name + Profession */}
          <Card>
            <View style={styles.avatarCardRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPickAvatar}
              >
                <View
                  style={[
                    styles.avatarBorder,
                    { borderColor: appTheme.colors.primaryLight },
                  ]}
                >
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatar}
                  />

                  {avatarUploading && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.avatarOverlayText}>
                        Updating...
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.cardFieldsGap}>
              {/* Name (required) */}
              <View ref={setFieldRef("name")}>
                <InputField
                  label="Full Name"
                  labelColor={appTheme.colors.textLight}
                  inputStyle={{ backgroundColor: "white" }}
                  value={form.name}
                  onChangeText={(v) => handleChange("name", v)}
                  placeholder="Enter Full Name"
                  error={errors.name}
                />
              </View>

              {/* Profession (required now) */}
              <View ref={setFieldRef("profession")}>
                <BottomSheetSelect
                  label="Profession"
                  labelColor={appTheme.colors.textLight}
                  value={form.profession}
                  fieldStyle={{ backgroundColor: "white" }}
                  onChange={(v) => handleChange("profession", v)}
                  options={PROFESSION_OPTIONS}
                  placeholder="Select profession"
                  sheetTitle="Select Profession"
                  error={errors.profession}
                />
              </View>
            </View>
          </Card>

          {/* CARD 2: About Me */}
          <Card>
            <View style={styles.sectionCardHeader}>
              <Text
                variant="body1"
                color={appTheme.colors.text}
                style={styles.sectionTitle}
              >
                About Me
              </Text>
            </View>

            <View ref={setFieldRef("about_me")}>
              <InputField
                label="About Me"
                labelColor={appTheme.colors.textLight}
                value={form.about_me}
                onChangeText={(v) => handleChange("about_me", v)}
                placeholder="Write something about yourself..."
                multiline
                numberOfLines={4}
                inputStyle={{ backgroundColor: "white" }}
                error={errors.about_me}
              />
            </View>
          </Card>

          {/* CARD 3: Personal Details */}
          <Card>
            <View style={styles.sectionCardHeader}>
              <Text
                variant="body1"
                color={appTheme.colors.text}
                style={styles.sectionTitle}
              >
                Personal Details
              </Text>
            </View>

            <View style={styles.cardFieldsGap}>
              <InputField
                label="Email"
                labelColor={appTheme.colors.textLight}
                value={user?.email || ""}
                placeholder="Enter email"
                readOnly
              />

              <InputField
                label="Phone"
                labelColor={appTheme.colors.textLight}
                value={user?.phone || ""}
                placeholder="Enter phone"
                readOnly
              />

              {/* Country (required) */}
              <View ref={setFieldRef("country")}>
                <BottomSheetSelect
                  label="Country"
                  labelColor={appTheme.colors.textLight}
                  value={selectedCountry}
                  onChange={(v) => {
                    setSelectedCountry(v);
                    setErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  options={countries}
                  placeholder="Select Country"
                  sheetTitle="Select Country"
                  fieldStyle={{ backgroundColor: "white" }}
                  error={errors.country}
                />
              </View>

              {/* City / State (required – treating as city) */}
              {selectedCountry ? (
                <View ref={setFieldRef("state")}>
                  <BottomSheetSelect
                    label="City / State"
                    labelColor={appTheme.colors.textLight}
                    value={selectedState}
                    onChange={(v) => {
                      setSelectedState(v);
                      handleChange("state", v);
                    }}
                    options={states}
                    placeholder="Select City / State"
                    sheetTitle="Select City / State"
                    fieldStyle={{ backgroundColor: "white" }}
                    error={errors.state}
                  />
                </View>
              ) : null}

              {/* Nationality (required) */}
              <View ref={setFieldRef("nationality")}>
                <InputField
                  label="Nationality"
                  labelColor={appTheme.colors.textLight}
                  value={form.nationality}
                  onChangeText={(v) => handleChange("nationality", v)}
                  placeholder="Enter nationality"
                  inputStyle={{ backgroundColor: "white" }}
                  error={errors.nationality}
                />
              </View>

              {/* Gender (required) */}
              <View ref={setFieldRef("gender")}>
                <BottomSheetSelect
                  label="Gender"
                  labelColor={appTheme.colors.textLight}
                  value={form.gender}
                  onChange={(v) => handleChange("gender", v)}
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                  sheetTitle="Select Gender"
                  fieldStyle={{ backgroundColor: "white" }}
                  error={errors.gender}
                />
              </View>

              {/* Religion (optional) */}
              <BottomSheetSelect
                label="Religion"
                labelColor={appTheme.colors.textLight}
                value={form.religion}
                onChange={(v) => handleChange("religion", v)}
                options={RELIGION_OPTIONS}
                placeholder="Select religion"
                sheetTitle="Select Religion"
                fieldStyle={{ backgroundColor: "white" }}
              />

              {/* Education (required) */}
              <View ref={setFieldRef("education")}>
                <BottomSheetSelect
                  label="Education Level"
                  labelColor={appTheme.colors.textLight}
                  value={form.education}
                  onChange={(v) => handleChange("education", v)}
                  options={EDUCATION_OPTIONS}
                  placeholder="Select education level"
                  sheetTitle="Select Education"
                  fieldStyle={{ backgroundColor: "white" }}
                  error={errors.education}
                />
              </View>

              {/* Languages (optional) */}
              <BottomSheetSelect
                label="Languages Spoken"
                labelColor={appTheme.colors.textLight}
                value={form.language_spoken}
                onChange={(v) => handleChange("language_spoken", v)}
                options={LANGUAGE_OPTIONS}
                placeholder="Select languages"
                sheetTitle="Select Language"
                fieldStyle={{ backgroundColor: "white" }}
              />

              {/* Height (optional) */}
              <InputField
                label="Height"
                labelColor={appTheme.colors.textLight}
                value={form.height}
                onChangeText={(v) => handleChange("height", v)}
                placeholder="Enter height"
                inputStyle={{ backgroundColor: "white" }}
              />

              {/* Marital Status (required) */}
              <View ref={setFieldRef("marital_status")}>
                <BottomSheetSelect
                  label="Marital Status"
                  labelColor={appTheme.colors.textLight}
                  value={form.marital_status}
                  onChange={(v) => handleChange("marital_status", v)}
                  options={MARITAL_OPTIONS}
                  placeholder="Select marital status"
                  sheetTitle="Select Marital Status"
                  fieldStyle={{ backgroundColor: "white" }}
                  error={errors.marital_status}
                />
              </View>

              {/* Age (required) */}
              <View ref={setFieldRef("age")}>
                <InputField
                  label="Age"
                  labelColor={appTheme.colors.textLight}
                  value={form.age}
                  onChangeText={(v) => handleChange("age", v)}
                  placeholder="Enter age"
                  inputStyle={{ backgroundColor: "white" }}
                  keyboardType="numeric"
                  error={errors.age}
                />
              </View>
            </View>
          </Card>

          {/* CARD 4: Social Links */}
          <Card>
            <View style={styles.sectionCardHeader}>
              <Text
                variant="body1"
                color={appTheme.colors.text}
                style={styles.sectionTitle}
              >
                Social Links
              </Text>
            </View>

            <View style={styles.cardFieldsGap}>
              <InputField
                label="Facebook"
                labelColor={appTheme.colors.textLight}
                value={socialLinks.facebook}
                onChangeText={(v) => handleSocialChange("facebook", v)}
                placeholder="Enter Facebook URL"
                inputStyle={{ backgroundColor: "white" }}
              />
              <InputField
                label="Instagram"
                labelColor={appTheme.colors.textLight}
                value={socialLinks.instagram}
                onChangeText={(v) => handleSocialChange("instagram", v)}
                placeholder="Enter Instagram URL"
                inputStyle={{ backgroundColor: "white" }}
              />
              <InputField
                label="Twitter"
                labelColor={appTheme.colors.textLight}
                value={socialLinks.twitter}
                onChangeText={(v) => handleSocialChange("twitter", v)}
                placeholder="Enter Twitter URL"
                inputStyle={{ backgroundColor: "white" }}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* CTA Save */}
      <View
        pointerEvents="box-none"
        style={[
          styles.ctaWrap,
          { paddingBottom: insets.bottom || 16 },
        ]}
      >
        <View style={styles.ctaShadow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSave}
            disabled={saving || avatarUploading}
          >
            <LinearGradient
              colors={["#1BAD7A", "#1BAD7A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
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
  container: { flex: 1, position: "relative" },
  content: { padding: 20, rowGap: 16 },

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
  },

  avatarCardRow: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 9999,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlayText: {
    color: "#fff",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },

  sectionTitle: { fontWeight: "600", marginBottom: 4 },

  sectionCardHeader: {
    marginBottom: 12,
  },

  cardFieldsGap: {
    display: "flex",
    gap: 16,
  },

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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProfileEditScreen;
