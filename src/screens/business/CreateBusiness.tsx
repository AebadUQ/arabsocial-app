import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Text as RNText,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import { Text } from "@/components";
import InputField from "@/components/Input";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { Country, State } from "country-state-city";
import { useMutation } from "@tanstack/react-query";
import { createBusiness } from "@/api/business";
import {
  ArrowLeft as ArrowLeftIcon,
  ImageSquare as ImageSquareIcon,
} from "phosphor-react-native";

type FormState = {
  name: string;
  about_me: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  city: string;
  website_link: string;
  business_type: "online" | "physical" | "hybrid" | "";
  category: string; // <-- single select like business_type
  fb_link: string;
  insta_link: string;
  discount: string;
  promo_code: string;
  logoUri: string; // business_logo
};

const CATEGORY_OPTIONS = [
  "technology",
  "health",
  "finance",
  "education",
  "travel",
  "food",
  "fashion",
  "sports",
  "art",
  "music",
  "business",
  "others",
] as const;

export default function CreateBusinessScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<FormState>({
    name: "",
    about_me: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    city: "",
    website_link: "",
    business_type: "",
    category: "", // <-- new
    fb_link: "",
    insta_link: "",
    discount: "",
    promo_code: "",
    logoUri: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Countries / Cities
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  useEffect(() => {
    setCountries(Country.getAllCountries().map((c) => c.name));
  }, []);
  useEffect(() => {
    if (form.country) {
      const c = Country.getAllCountries().find((x) => x.name === form.country);
      setCities(State.getStatesOfCountry(c?.isoCode || "").map((s) => s.name));
      set("city", "");
    } else {
      setCities([]);
      set("city", "");
    }
  }, [form.country]);

  // Image Picker (single: business_logo)
  const pickLogo = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: "photo",
        maxWidth: 1400,
        maxHeight: 1400,
        selectionLimit: 1,
      });
      if (res.didCancel) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return Alert.alert("No image", "Please select a valid image.");
      set("logoUri", asset.uri);
    } catch {
      Alert.alert("Error", "Unable to open image picker.");
    }
  };

  // Submit
  const mutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      Alert.alert("Success", "Business submitted successfully!");
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  const onSubmit = () => {
    if (!form.name.trim()) return Alert.alert("Missing", "Please enter business name.");
    if (!form.business_type) return Alert.alert("Missing", "Please select a business type.");
    if (!form.category) return Alert.alert("Missing", "Please select a category.");
    if (!form.address.trim()) return Alert.alert("Missing", "Please enter address.");
    if (!form.country) return Alert.alert("Missing", "Please select country.");
    if (!form.city) return Alert.alert("Missing", "Please select city.");

    const payload = {
      name: form.name,
      about_me: form.about_me,
      phone: form.phone,
      email: form.email,
      address: form.address,
      country: form.country,
      city: form.city,
      categories: form.category ? [form.category] : [], // <-- array like API expects
      website_link: form.website_link,
      business_type: form.business_type, // "online" | "physical" | "hybrid"
      fb_link: form.fb_link,
      insta_link: form.insta_link,
      discount: form.discount,
      business_logo: form.logoUri,       // ONLY image field
      promo_code: form.promo_code || undefined, // optional
    };

    mutation.mutate(payload as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={"white"} />
        </TouchableOpacity>
        <Text variant="body1" color={theme.colors.text} style={{ fontWeight: "600" }}>
          Create Business
        </Text>
        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: (insets.bottom || 16) + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Logo */}
        <Text style={styles.sectionLabel}>Business Image / Logo</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.uploadBox, { borderColor: theme.colors.borderColor, backgroundColor: "transparent" }]}
          onPress={pickLogo}
        >
          {form.logoUri ? (
            <>
              <Image source={{ uri: form.logoUri }} style={styles.bannerImg} />
              <View style={styles.changeHintWrap}>
                <Text style={styles.changeHintText}>Tap to change</Text>
              </View>
            </>
          ) : (
            <View style={styles.uploadInner}>
              <ImageSquareIcon size={80} color={theme.colors.textLight} />
              <Text variant="body1" color={theme.colors.textLight}>Upload business logo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Basic Info */}
        <InputField placeholder="Business name" value={form.name} onChangeText={(t) => set("name", t)} containerStyle={styles.fieldGap} />
        <InputField
          placeholder="Description (about us)"
          value={form.about_me}
          onChangeText={(t) => set("about_me", t)}
          multiline
          numberOfLines={4}
          style={{ textAlignVertical: "top" }}
          containerStyle={styles.fieldGap}
        />

        {/* Category (same pattern as business_type) */}
        <BottomSheetSelect
          value={form.category}
          onChange={(v) => set("category", v as any)}
          options={CATEGORY_OPTIONS.map((c) => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))}
          placeholder="Select Category"
          sheetTitle="Select Category"
          containerStyle={styles.fieldGap}
        />

        {/* Business Type */}
        <BottomSheetSelect
          value={form.business_type}
          onChange={(v) => set("business_type", v as any)}
          options={[
            { label: "Online", value: "online" },
            { label: "Physical", value: "physical" },
            { label: "Hybrid", value: "hybrid" },
          ]}
          placeholder="Select Business Type"
          sheetTitle="Select Business Type"
          containerStyle={styles.fieldGap}
        />

        {/* Address */}
        <InputField placeholder="Address" value={form.address} onChangeText={(t) => set("address", t)} containerStyle={styles.fieldGap} />

        <BottomSheetSelect
          searchable
          value={form.country}
          onChange={(v) => set("country", v)}
          options={countries.map((c) => ({ label: c, value: c }))}
          placeholder="Select Country"
          sheetTitle="Select Country"
          containerStyle={styles.fieldGap}
        />

        {form.country ? (
          <BottomSheetSelect
            value={form.city}
            onChange={(v) => set("city", v)}
            options={cities.map((s) => ({ label: s, value: s }))}
            placeholder="Select City"
            sheetTitle="Select City"
            containerStyle={styles.fieldGap}
          />
        ) : null}

        {/* Contacts / Links */}
        <InputField placeholder="Website URL" value={form.website_link} onChangeText={(t) => set("website_link", t)} containerStyle={styles.fieldGap} autoCapitalize="none" />
        <InputField placeholder="Phone" value={form.phone} onChangeText={(t) => set("phone", t)} containerStyle={styles.fieldGap} keyboardType="phone-pad" />
        <InputField placeholder="Email" value={form.email} onChangeText={(t) => set("email", t)} containerStyle={styles.fieldGap} autoCapitalize="none" keyboardType="email-address" />
        <InputField placeholder="Facebook link" value={form.fb_link} onChangeText={(t) => set("fb_link", t)} containerStyle={styles.fieldGap} autoCapitalize="none" />
        <InputField placeholder="Instagram link" value={form.insta_link} onChangeText={(t) => set("insta_link", t)} containerStyle={styles.fieldGap} autoCapitalize="none" />
        <InputField placeholder="Discount (e.g. Intro offer 20% off)" value={form.discount} onChangeText={(t) => set("discount", t)} containerStyle={styles.fieldGap} />
        <InputField placeholder="Promo code (optional)" value={form.promo_code} onChangeText={(t) => set("promo_code", t)} containerStyle={styles.fieldGap} autoCapitalize="characters" />
      </ScrollView>

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
        {
          // @ts-ignore
          mutation.isLoading ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Submit</Text>
          )
        }
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BAD7A",
  },
  content: { padding: 16 },
  sectionLabel: { marginBottom: 8, fontWeight: "600" },
  fieldGap: { marginTop: 16 },
  uploadBox: {
    height: 160,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  bannerImg: { width: "100%", height: "100%", borderRadius: 12, resizeMode: "cover" },
  changeHintWrap: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeHintText: { color: "#fff", fontSize: 12 },
  submitBtn: {
    backgroundColor: "#1BAD7A",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
});
