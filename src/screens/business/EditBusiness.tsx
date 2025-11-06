import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { launchImageLibrary } from "react-native-image-picker";
import { Country, State } from "country-state-city";
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useTheme } from "@/theme/ThemeContext";
import {
  ArrowLeft as ArrowLeftIcon,
  BriefcaseIcon,
  ImageSquare as ImageSquareIcon,
} from "phosphor-react-native";
import { getBusinessDetail, updateBusiness } from "@/api/business";

type RouteParams = { businessId: string | number };

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
  category: string;
  fb_link: string;
  insta_link: string;
  discount: string;
  promo_code: string;
  logoUri: string; // URL or local URI
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

const EditBusinessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { businessId } = route.params as RouteParams;
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
    category: "",
    fb_link: "",
    insta_link: "",
    discount: "",
    promo_code: "",
    logoUri: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Countries / Cities
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCountries(allCountries.map((c) => c.name));
  }, [allCountries]);

  const setCountryAndCities = (countryName: string, cityName?: string) => {
    const c = allCountries.find((x) => x.name === countryName);
    const nextCities = State.getStatesOfCountry(c?.isoCode || "").map((s) => s.name);
    setCities(nextCities);
    setForm((f) => ({
      ...f,
      country: countryName || "",
      city: cityName && nextCities.includes(cityName) ? cityName : "",
    }));
  };

  useEffect(() => {
    if (!form.country) {
      setCities([]);
      return;
    }
    const c = allCountries.find((x) => x.name === form.country);
    const next = State.getStatesOfCountry(c?.isoCode || "").map((s) => s.name);
    setCities(next);
    if (form.city && !next.includes(form.city)) set("city", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country]);

  // Fetch existing business details
  const {
    data,
    isPending: isDetailPending,
    isError,
  } = useQuery({
    queryKey: ["businessDetail", businessId],
    queryFn: () => getBusinessDetail(businessId),
  });

  // Prefill form once details arrive
  useEffect(() => {
    if (!data) return;
    const detail = data || {};

    const categoryFromArray: string =
      Array.isArray(detail.categories) && detail.categories.length
        ? String(detail.categories[0])
        : (detail.category || "");

    const logo =
      detail.business_logo ||
      detail.logo ||
      detail.img ||
      detail.image ||
      "";

    setForm((f) => ({
      ...f,
      name: detail.name || "",
      about_me: detail.about_me || detail.description || "",
      phone: detail.phone || "",
      email: detail.email || "",
      address: detail.address || detail.location || "",
      country: detail.country || "",
      city: detail.city || "",
      website_link: detail.website_link || detail.website || "",
      business_type: detail.business_type || "",
      category: categoryFromArray || "",
      fb_link: detail.fb_link || detail.facebook || "",
      insta_link: detail.insta_link || detail.instagram || "",
      discount: detail.discount || "",
      promo_code: detail.promo_code || "",
      logoUri: logo || "",
    }));

    if (detail.country) setCountryAndCities(detail.country, detail.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Image Picker
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

  // Update mutation (v5 flags)
  const mutation = useMutation({
    mutationFn: (payload: any) => updateBusiness(businessId, payload),
    onSuccess: () => {
      Alert.alert("Success", "Business updated successfully!");
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
      categories: form.category ? [form.category] : [],
      website_link: form.website_link,
      business_type: form.business_type,
      fb_link: form.fb_link,
      insta_link: form.insta_link,
      discount: form.discount,
      business_logo: form.logoUri,
      promo_code: form.promo_code || undefined,
    };

    mutation.mutate(payload as any);
  };

  const isBusy = isDetailPending || mutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
    <View style={styles.topBar}>
  {/* Left: back + title */}
  <View style={styles.leftWrap}>
    <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
      <ArrowLeftIcon size={20} weight="bold" color="#fff" />
    </TouchableOpacity>
    <Text
      variant="body1"
      color={theme.colors.text}
      style={styles.title}
      numberOfLines={1}
    >
      Edit Business
    </Text>
  </View>

  {/* Right: Post a Job */}
  <TouchableOpacity
    style={styles.ctaBtn}
    onPress={() => navigation.navigate("PostJob", { businessId })}
    activeOpacity={0.9}
  >
    <BriefcaseIcon size={16} weight="fill" color="#fff" />
    <Text style={styles.ctaText}>Post a Job</Text>
  </TouchableOpacity>
</View>

      {isDetailPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text>Failed to load business details.</Text>
        </View>
      ) : (
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
          <InputField
            placeholder="Business name"
            value={form.name}
            onChangeText={(t) => set("name", t)}
            containerStyle={styles.fieldGap}
          />
          <InputField
            placeholder="Description (about us)"
            value={form.about_me}
            onChangeText={(t) => set("about_me", t)}
            multiline
            numberOfLines={4}
            style={{ textAlignVertical: "top" }}
            containerStyle={styles.fieldGap}
          />

          {/* Category */}
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
          <InputField
            placeholder="Address"
            value={form.address}
            onChangeText={(t) => set("address", t)}
            containerStyle={styles.fieldGap}
          />

          {/* Country */}
          <BottomSheetSelect
            searchable
            value={form.country}
            onChange={(v) => setCountryAndCities(String(v))}
            options={countries.map((c) => ({ label: c, value: c }))}
            placeholder="Select Country"
            sheetTitle="Select Country"
            containerStyle={styles.fieldGap}
          />

          {/* City */}
          {form.country ? (
            <BottomSheetSelect
              value={form.city}
              onChange={(v) => set("city", v as any)}
              options={cities.map((s) => ({ label: s, value: s }))}
              placeholder="Select City"
              sheetTitle="Select City"
              containerStyle={styles.fieldGap}
            />
          ) : null}

          {/* Contacts / Links */}
          <InputField
            placeholder="Website URL"
            value={form.website_link}
            onChangeText={(t) => set("website_link", t)}
            containerStyle={styles.fieldGap}
            autoCapitalize="none"
          />
          <InputField
            placeholder="Phone"
            value={form.phone}
            onChangeText={(t) => set("phone", t)}
            containerStyle={styles.fieldGap}
            keyboardType="phone-pad"
          />
          <InputField
            placeholder="Email"
            value={form.email}
            onChangeText={(t) => set("email", t)}
            containerStyle={styles.fieldGap}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <InputField
            placeholder="Facebook link"
            value={form.fb_link}
            onChangeText={(t) => set("fb_link", t)}
            containerStyle={styles.fieldGap}
            autoCapitalize="none"
          />
          <InputField
            placeholder="Instagram link"
            value={form.insta_link}
            onChangeText={(t) => set("insta_link", t)}
            containerStyle={styles.fieldGap}
            autoCapitalize="none"
          />
          <InputField
            placeholder="Discount (e.g. Intro offer 20% off)"
            value={form.discount}
            onChangeText={(t) => set("discount", t)}
            containerStyle={styles.fieldGap}
          />
          <InputField
            placeholder="Promo code (optional)"
            value={form.promo_code}
            onChangeText={(t) => set("promo_code", t)}
            containerStyle={styles.fieldGap}
            autoCapitalize="characters"
          />
        </ScrollView>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, isBusy && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={isBusy}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  
  
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
  topBar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 12,
},

leftWrap: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  flexShrink: 1, // keep title from pushing CTA
},

navBtn: {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#1BAD7A",
},

title: { fontWeight: "700", maxWidth: 180 }, // tweak width if needed

ctaBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 14,
  height: 40,
  borderRadius: 999,
  backgroundColor: "#1BAD7A",
},

ctaText: { color: "#fff", fontWeight: "700" },

});

export default EditBusinessScreen;
