import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import InputField from "@/components/Input";
import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeft,
  NotePencil,
  FacebookLogo,
  InstagramLogo,
  XLogo,
  ArrowLeftIcon,
} from "phosphor-react-native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useAuth } from "@/context/Authcontext";
import { Country, State } from "country-state-city";
import { theme } from "@/theme/theme";
const MARITAL_OPTIONS = ["Single", "Married", "Prefer not to say"];

const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"];
const RELIGION_OPTIONS = [
  "Islam",
  "Christianity",
  "Hinduism",
  "Buddhism",
  "Atheist",
  "Other",
];
const EDUCATION_OPTIONS = [
  "High School Diploma",
  "Bachelor’s Degree",
  "Master’s Degree",
  "Doctorate / PhD",
  "Other",
];
const LANGUAGE_OPTIONS = ["Arabic", "English", "Urdu", "Hindi", "French", "Other"];
const CHIP_BG = '#1E644CCC';

const ProfileEditScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });
 const interests: string[] = user?.interests && Array.isArray(user.interests) && user.interests.length > 0
    ? user.interests
    : ['N/A'];
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    const countryList = Country.getAllCountries().map((c) => c.name);
    setCountries(countryList);
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
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
      handleChange(
        "nationality",
        // @ts-ignore
        countryObj?.demonym || `${selectedCountry} citizen`
      );
    }
  }, [selectedCountry]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const updatedData = {
        ...form,
        country: selectedCountry,
        age:parseInt(form?.age),
        state: selectedState,
        language_spoken: form.language_spoken
          ? form.language_spoken.split(",").map((l) => l.trim())
          : [],
      };
      await updateProfile(updatedData);
      Alert.alert("Success", "Your profile has been updated successfully!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.overlayRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={onSave} style={styles.circleBtn}>
          <NotePencil size={22} color="#fff" weight="bold" />
        </TouchableOpacity> */}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: user?.image || user?.img || "https://i.pravatar.cc/200?img=12",
            }}
            style={styles.avatar}
          />
          <Text variant="h5">{user?.name || ""}</Text>
          <Text variant="caption" color={theme.colors.textLight}>
            {user?.profession || ""}
          </Text>
        </View>

        <View style={styles.socialRow}>
          <FacebookLogo size={20} color={theme.colors.text} />
          <XLogo size={20} color={theme.colors.text} />
          <InstagramLogo size={20} color={theme.colors.text} />
        </View>
        <View style={[styles.interestsSection, { borderBottomWidth: 1, borderBottomColor: theme.colors.borderColor }]}>
                  <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Interests</Text>
        
                  <View style={styles.chipsWrap}>
                    {interests.map((label, i) => (
                      <TouchableOpacity key={i} style={styles.chip} accessibilityRole="button">
                        <Text variant="overline" color={theme.colors.textWhite}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
<View style={styles.sectionRowTightNoLine}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Personal details</Text>
        </View>
        <View style={{ display: "flex", gap: 10 }}>
          <InputField
            label="Email"
            labelColor={theme.colors.textLight}
            value={user?.email || ""}
            placeholder="Enter email"
            readOnly
          />

          <InputField
            label="Phone"
            labelColor={theme.colors.textLight}
            value={user?.phone || ""}
            placeholder="Enter phone"
            readOnly
          />

          <BottomSheetSelect
            label="Country"
            labelColor={theme.colors.textLight}
            value={selectedCountry}
            onChange={(v) => setSelectedCountry(v)}
            options={countries}
            placeholder="Select Country"
            sheetTitle="Select Country"
          />

          {selectedCountry ? (
            <BottomSheetSelect
              label="State / Province"
              labelColor={theme.colors.textLight}
              value={selectedState}
              onChange={(v) => {
                setSelectedState(v);
                handleChange("state", v);
              }}
              options={states}
              placeholder="Select State"
              sheetTitle="Select State"
            />
          ) : null}

          <InputField
            label="Nationality"
            labelColor={theme.colors.textLight}
            value={form.nationality}
            onChangeText={(v) => handleChange("nationality", v)}
            placeholder="Enter nationality"
          />

          <InputField
            label="Profession"
            labelColor={theme.colors.textLight}
            value={form.profession}
            onChangeText={(v) => handleChange("profession", v)}
            placeholder="Enter profession"
          />

          <BottomSheetSelect
            label="Gender"
            labelColor={theme.colors.textLight}
            value={form.gender}
            onChange={(v) => handleChange("gender", v)}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            sheetTitle="Select Gender"
          />

          <BottomSheetSelect
            label="Religion"
            labelColor={theme.colors.textLight}
            value={form.religion}
            onChange={(v) => handleChange("religion", v)}
            options={RELIGION_OPTIONS}
            placeholder="Select religion"
            sheetTitle="Select Religion"
          />

          <BottomSheetSelect
            label="Education Level"
            labelColor={theme.colors.textLight}
            value={form.education}
            onChange={(v) => handleChange("education", v)}
            options={EDUCATION_OPTIONS}
            placeholder="Select education level"
            sheetTitle="Select Education"
          />

          <BottomSheetSelect
            label="Languages Spoken"
            labelColor={theme.colors.textLight}
            value={form.language_spoken}
            onChange={(v) => handleChange("language_spoken", v)}
            options={LANGUAGE_OPTIONS}
            placeholder="Select languages"
            sheetTitle="Select Language"
          />

          <InputField
            label="Height"
            labelColor={theme.colors.textLight}
            value={form.height}
            onChangeText={(v) => handleChange("height", v)}
            placeholder="Enter height"
          />

         <BottomSheetSelect
  label="Marital Status"
  labelColor={theme.colors.textLight}
  value={form.marital_status}
  onChange={(v) => handleChange("marital_status", v)}
  options={MARITAL_OPTIONS}
  placeholder="Select marital status"
  sheetTitle="Select Marital Status"
/>


          <InputField
            label="Age"
            labelColor={theme.colors.textLight}
            value={form.age}
            onChangeText={(v) => handleChange("age", v)}
            placeholder="Enter age"
          />
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.ctaWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSave}
          style={styles.ctaShadow}
          disabled={saving}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  content: { padding: 20 },
  overlayRow: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
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
    marginBottom: 10,
  },
  ctaWrap: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    alignItems: "center",
    paddingBottom: 10,
  },
  ctaShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
  },
  ctaBtn: {
    height: 56,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionRowTightNoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 16,
  },
    sectionTitle: { fontWeight: '600', marginBottom: 4 },

  interestsSection: {
    marginTop: 16,
    paddingBottom: 16,
  },

  chipsWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
  },

  plusChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
});

export default ProfileEditScreen;
