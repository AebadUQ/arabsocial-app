import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Text as RNText } from "react-native";
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
  Plus,
} from "phosphor-react-native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useAuth } from "@/context/Authcontext";

const TILE = 100;
const RADIUS = 10;
const CHIP_BG = "#1E644CCC";

const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"];
const RELIGION_OPTIONS = ["Islam", "Christianity", "Hinduism", "Buddhism", "Atheist", "Other"];
const EDUCATION_OPTIONS = [
  "High School Diploma",
  "Bachelor’s Degree",
  "Master’s Degree",
  "Doctorate / PhD",
  "Other",
];
const LANGUAGE_OPTIONS = ["Arabic", "English", "Urdu", "Hindi", "French", "Other"];

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();

  // initialize form state based on user data
  const [form, setForm] = useState({
    email: "",
    phone: "",
    state: "",
    city: "",
    nationality: "",
    occupation: "",
    gender: "",
    height: "",
    maritalStatus: "",
    age: "",
    religion: "",
    education: "",
    languages: "",
  });

  useEffect(() => {
    console.log("user",user)
    if (user) {
      setForm({
        email: user.email || "",
        phone: user.phone || "",
        state: user.state || "",
        city: user.location || user.city || "",
        nationality: user.nationality || "",
        occupation: user.profession || "",
        gender: user.gender || "",
        height: user.height || "",
        maritalStatus: user.marital_status || "",
        age: user.age ? String(user.age) : "",
        religion: user.religion || "",
        education: user.education || "",
        languages: Array.isArray(user.language_spoken) 
                     ? user.language_spoken.join(", ") 
                     : user.language_spoken || "",
      });
    }
  }, [user]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = () => {
    // Prepare data for API / update
    const updatedData = {
      ...form,
      language_spoken: form.languages.split(",").map((l) => l.trim()),
    };
    console.log("Updated form:", updatedData);
    // TODO: Call update API or context method
  };

  const onEditAbout = () => {};
  const onAddPhoto = () => {};
  const onViewAll = () => {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header controls */}
      <View style={styles.overlayRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <ArrowLeft size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave} style={styles.circleBtn}>
          <NotePencil size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 50 }]} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {/* Avatar + Name */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: user?.image || user?.img || "https://i.pravatar.cc/200?img=12" }} style={styles.avatar} />
          <Text variant="h5">{user?.name || ""}</Text>
          <Text variant="caption" color={theme.colors.textLight}>{user?.profession || ""}</Text>
        </View>

        {/* Social icons */}
        <View style={styles.socialRow}>
          <FacebookLogo size={20} color={theme.colors.text} />
          <XLogo size={20} color={theme.colors.text} />
          <InstagramLogo size={20} color={theme.colors.text} />
        </View>

        {/* Form Fields */}
        <View style={{ display: "flex", gap: 10 }}>
          <InputField
            label="Email"
            labelColor={theme.colors.textLight}
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            placeholder="Enter email"
          />
          <InputField
            label="Phone"
            labelColor={theme.colors.textLight}
            value={form.phone}
            onChangeText={(v) => handleChange("phone", v)}
            placeholder="Enter phone"
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <InputField
                label="State/Country"
                labelColor={theme.colors.textLight}
                value={form.state}
                onChangeText={(v) => handleChange("state", v)}
                placeholder="Enter state"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="City"
                labelColor={theme.colors.textLight}
                value={form.city}
                onChangeText={(v) => handleChange("city", v)}
                placeholder="Enter city"
              />
            </View>
          </View>

          <InputField
            label="Nationality"
            labelColor={theme.colors.textLight}
            value={form.nationality}
            onChangeText={(v) => handleChange("nationality", v)}
            placeholder="Enter nationality"
          />

          <InputField
            label="Occupation"
            labelColor={theme.colors.textLight}
            value={form.occupation}
            onChangeText={(v) => handleChange("occupation", v)}
            placeholder="Enter occupation"
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
            value={form.languages}
            onChange={(v) => handleChange("languages", v)}
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
          <InputField
            label="Marital status"
            labelColor={theme.colors.textLight}
            value={form.maritalStatus}
            onChangeText={(v) => handleChange("maritalStatus", v)}
            placeholder="Enter marital status"
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

      {/* Save Button */}
      <View pointerEvents="box-none" style={styles.ctaWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={onSave} style={styles.ctaShadow}>
          <LinearGradient
            colors={["#1BAD7A", "#1BAD7A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  content: { padding: 20 },

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

  row: { flexDirection: "row", gap: 6 },

  ctaWrap: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  ctaShadow: {
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtn: {
    height: 56,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
});

export default ProfileEditScreen;
