import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
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

const TILE = 100;
const RADIUS = 10;
const CHIP_BG = "#1E644CCC";

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // --- Static data ---
  const photos = [
    "https://i.pravatar.cc/200?img=12",
    "https://i.pravatar.cc/200?img=15",
    "https://i.pravatar.cc/200?img=18",
    "https://i.pravatar.cc/200?img=21",
    "https://i.pravatar.cc/200?img=25",
  ];

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

  const interests = ["UI/UX", "React Native", "Photography", "Travel", "Fitness", "Street Food"];
  const MAX_PREVIEW = 3;
  const preview = photos.slice(0, MAX_PREVIEW);
  const extraCount = Math.max(0, photos.length - MAX_PREVIEW);

  // --- Form state ---
  const [form, setForm] = useState({
    email: "harleen.quinzel@example.com",
    phone: "harleen.quinzel@example.com",
    state: "United Arab Emirates",
    city: "Dubai",
    nationality: "United Arab Emirates",
    occupation: "Psychologist",
    gender: "Female",
    height: "5'8”",
    maritalStatus: "Single",
    age: "25 years",
    religion: "Islam",
    education: "Bachelor’s degree",
    languages: "Arabic, English",
  });

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = () => console.log("Updated form:", form);

  const onEditAbout = () => {};
  const onAddPhoto = () => {};
  const onViewAll = () => {};
  const onAddInterest = () => {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.overlayRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <ArrowLeft size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave} style={styles.circleBtn}>
          <NotePencil size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 50 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* --- Avatar + Name --- */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: "https://i.pravatar.cc/200?img=12" }} style={styles.avatar} />
          <Text variant="h5">Harleen Quinzel</Text>
          <Text variant="caption" color={theme.colors.textLight}>
            Graphic Designer
          </Text>
        </View>

        {/* Socials */}
        <View style={styles.socialRow}>
          <FacebookLogo size={20} color={theme.colors.text} />
          <XLogo size={20} color={theme.colors.text} />
          <InstagramLogo size={20} color={theme.colors.text} />
        </View>

        {/* About Section */}
        <View style={[styles.sectionRow, { borderBottomColor: theme.colors.borderColor }]}>
          <View style={styles.sectionTextWrap}>
            <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
              About me
            </Text>
            <Text variant="body1" color={theme.colors.textLight}>
              Nullam euismod dui vitae nisi vestibulum, tincidunt erat semper.
            </Text>
          </View>
          <TouchableOpacity onPress={onEditAbout} style={styles.iconBtn}>
            <NotePencil size={22} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Gallery */}
        <View style={styles.galleryHeader}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
            Gallery
          </Text>
          {extraCount > 0 && (
            <TouchableOpacity onPress={onViewAll}>
              <Text variant="caption" color={theme.colors.primary}>
                View all ({photos.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.galleryRow}>
          {preview.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumb} />
          ))}
          <TouchableOpacity onPress={onAddPhoto} style={[styles.plusBox, { backgroundColor: theme.colors.primary }]}>
            <Plus size={12} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Interests */}
        <View
          style={[
            styles.interestsSection,
            { borderBottomWidth: 1, borderBottomColor: theme.colors.borderColor },
          ]}
        >
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
            Interests
          </Text>
          <View style={styles.chipsWrap}>
            {interests.map((label, i) => (
              <TouchableOpacity key={i} style={styles.chip}>
                <Text variant="overline" color={theme.colors.textWhite}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={onAddInterest} style={styles.plusChip}>
              <Plus size={12} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.detailsHeader}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
            Personal Details
          </Text>
          <TouchableOpacity onPress={onEditAbout} style={styles.iconBtn}>
            <NotePencil size={22} color={theme.colors.textLight} />
          </TouchableOpacity>
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

          {/* --- BottomSheet dropdowns --- */}
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
            placeholder="Select status"
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

  avatarWrap: { justifyContent: "center", alignItems: "center" },
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
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  sectionTextWrap: { flex: 1, paddingRight: 8 },
  sectionTitle: { fontWeight: "600", marginBottom: 4 },
  iconBtn: { padding: 6, borderRadius: 8 },

  galleryHeader: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  galleryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  thumb: { width: TILE, height: TILE, borderRadius: RADIUS, backgroundColor: "#e9e9e9" },
  plusBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  interestsSection: { marginTop: 16, paddingBottom: 16 },
  chipsWrap: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
  },
  plusChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a8f6a",
  },

  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  row: { flexDirection: "row", gap: 6 },

  ctaWrap: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    alignItems: "center",
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
  },
});

export default ProfileEditScreen;
