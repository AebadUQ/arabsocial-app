// screens/Business/EditBusinessScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  LayoutChangeEvent,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { launchImageLibrary } from "react-native-image-picker";
import { Country, State } from "country-state-city";
import LinearGradient from "react-native-linear-gradient";

// Components
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import Card from "@/components/Card";
import { useTheme } from "@/theme/ThemeContext";

// Icons
import {
  ArrowLeft as ArrowLeftIcon,
  UploadSimple as UploadSimpleIcon,
} from "phosphor-react-native";

// API
import { getBusinessDetail, updateBusiness, uploadBusinessImage } from "@/api/business";

// -----------------------------------------------
// CATEGORY OPTIONS
// -----------------------------------------------
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
];

// -----------------------------------------------
// SCREEN START
// -----------------------------------------------
const EditBusinessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { businessId } = route.params;
  const queryClient = useQueryClient();

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------
  const [form, setForm] = useState({
    business_name: "",
    about: "",
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
    bannerUri: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // --------------------------------------------------
  // ERRORS
  // --------------------------------------------------
  const [errors, setErrors] = useState<any>({});

  // --------------------------------------------------
  // SCROLL TO FIELD
  // --------------------------------------------------
  const scrollRef = useRef<ScrollView | null>(null);
  const [fieldPositions, setFieldPositions] = useState<Record<string, number>>(
    {}
  );

  const handleFieldLayout =
    (name: string) =>
    (e: NativeSyntheticEvent<LayoutChangeEvent["nativeEvent"]>) => {
      const { y } = e.nativeEvent.layout;
      setFieldPositions((prev) => ({ ...prev, [name]: y }));
    };

  const scrollToField = (name: string) => {
    const y = fieldPositions[name];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: Math.max(y - 20, 0),
        animated: true,
      });
    }
  };

  // --------------------------------------------------
  // COUNTRY / CITY
  // --------------------------------------------------
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCountries(allCountries.map((c) => c.name));
  }, [allCountries]);

  useEffect(() => {
    if (form.country) {
      const c = allCountries.find((x) => x.name === form.country);
      const nextCities = State.getStatesOfCountry(c?.isoCode || "").map(
        (s) => s.name
      );
      setCities(nextCities);

      if (form.city && !nextCities.includes(form.city)) {
        set("city", "");
      }
    } else {
      setCities([]);
      set("city", "");
    }
  }, [form.country]);

  // --------------------------------------------------
  // FETCH BUSINESS DETAILS
  // --------------------------------------------------
  const { data, isPending, isError } = useQuery({
    queryKey: ["businessDetail", businessId],
    queryFn: () => getBusinessDetail(businessId),
  });

  useEffect(() => {
    if (!data) return;

    const detail = data;

    const categoryFromArray =
      Array.isArray(detail.categories) && detail.categories.length
        ? detail.categories[0]
        : detail.category || "";

    const logo =
      detail.business_logo || detail.logo || detail.img || detail.image || "";

    setForm({
      business_name: detail.name || "",
      about: detail.about_me || detail.description || "",
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
      bannerUri: logo || "",
    });

    // Load city options for saved country
    if (detail.country) {
      const c = allCountries.find((x) => x.name === detail.country);
      const nextCities = State.getStatesOfCountry(c?.isoCode || "").map(
        (s) => s.name
      );
      setCities(nextCities);
    }
  }, [data]);

  // --------------------------------------------------
  // IMAGE PICKER
  // --------------------------------------------------
  const [bannerUploading, setBannerUploading] = useState(false);

  const pickBanner = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: "photo",
        maxWidth: 1400,
        maxHeight: 1400,
        selectionLimit: 1,
      });

      if (res.didCancel) return;

      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      set("bannerUri", asset.uri);
      setBannerUploading(true);

      const { url } = await uploadBusinessImage(asset);
      set("bannerUri", url);
    } catch (e) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setBannerUploading(false);
    }
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const mutation = useMutation({
    mutationFn: (payload: any) => updateBusiness(businessId, payload),
    onSuccess: () => {
      // Alert.alert("Success", "Business updated!");

          queryClient.invalidateQueries({ queryKey: ["myBusinesses"] });
    queryClient.invalidateQueries({ queryKey: ["approvedBusinesses"] });

      navigation.goBack();
    },
    onError: (err: any) => {
      // Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  const onSubmit = () => {
    const e: any = {};

    // REQUIRED FIELDS
    if (!form.business_name.trim())
      e.business_name = "Business name required";
    if (!form.category) e.category = "Category required";
    if (!form.business_type) e.business_type = "Business type required";
    if (!form.country) e.country = "Country required";
    if (!form.city) e.city = "City required";
    if (!form.email.trim()) e.email = "Email required";

    setErrors(e);

    if (Object.keys(e).length > 0) {
      const order = [
        "business_name",
        "category",
        "business_type",
        "country",
        "city",
        "email",
      ];

      const first = order.find((x) => e[x]);
      if (first) scrollToField(first);
      return;
    }

    const payload = {
      name: form.business_name,
      about_me: form.about,
      phone: form.phone,
      email: form.email,
      address: form.address,
      country: form.country,
      city: form.city,
      categories: [form.category],
      website_link: form.website_link,
      business_type: form.business_type,
      fb_link: form.fb_link,
      insta_link: form.insta_link,
      discount: form.discount,
      business_logo: form.bannerUri,
      promo_code: form.promo_code || undefined,
    };

    mutation.mutate(payload);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Failed to load business details</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {/* TOP BAR */}
    <View style={styles.topBar}>
  {/* Back Button */}
  <TouchableOpacity
    style={styles.navBtn}
    onPress={() => navigation.goBack()}
  >
    <ArrowLeftIcon size={22} color={theme.colors.text} />
  </TouchableOpacity>

  {/* Center Title */}
  <Text
    variant="body1"
    color={theme.colors.text}
    style={{ fontWeight: "600" }}
  >
    Edit Business
  </Text>

  {/* Post a Job Button */}
  <TouchableOpacity
    style={[
      styles.jobBtn,
      { backgroundColor: theme.colors.primaryLight }
    ]}
    onPress={() => navigation.navigate("PostJob", { businessId })}
    activeOpacity={0.9}
  >
    <Text
      style={{ color: theme.colors.primary, fontWeight: "700", fontSize: 12 }}
    >
      Post a Job
    </Text>
  </TouchableOpacity>
</View>

      {/* SCROLL */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGE UPLOAD */}
        <View onLayout={handleFieldLayout("banner")}>
          <Card style={{ padding: form.bannerUri ? 0 : 20 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.uploadBox]}
              onPress={pickBanner}
            >
              {form.bannerUri ? (
                <>
                  <Image
                    source={{ uri: form.bannerUri }}
                    style={styles.bannerImg}
                  />

                  {bannerUploading && (
                    <View style={styles.bannerOverlay}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.bannerOverlayText}>Uploading...</Text>
                    </View>
                  )}

                  <View style={styles.changeHintWrap}>
                    <Text style={styles.changeHintText}>Tap to change</Text>
                  </View>
                </>
              ) : (
                <View style={styles.uploadInner}>
                  <View
                    style={{
                      backgroundColor: theme.colors.primaryShade,
                      padding: 10,
                      borderRadius: 20,
                    }}
                  >
                    <UploadSimpleIcon
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text variant="body1" color={theme.colors.textLight}>
                    Upload business image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* BUSINESS NAME */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("business_name")}
        >
          <InputField
            label="Business Name"
            labelColor={theme.colors.text}
            value={form.business_name}
            placeholder="Enter business name"
            onChangeText={(t) => {
              set("business_name", t);
              setErrors((p: any) => ({ ...p, business_name: "" }));
            }}
            error={errors.business_name}
          />
        </View>

        {/* CATEGORY */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("category")}
        >
          <BottomSheetSelect
            label="Category"
            labelColor={theme.colors.text}
            value={form.category}
            onChange={(v) => {
              set("category", v);
              setErrors((p: any) => ({ ...p, category: "" }));
            }}
            options={CATEGORY_OPTIONS.map((c) => ({
              label: c.charAt(0).toUpperCase() + c.slice(1),
              value: c,
            }))}
            placeholder="Select Category"
            sheetTitle="Select Category"
            error={errors.category}
          />
        </View>

        {/* BUSINESS TYPE */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("business_type")}
        >
          <BottomSheetSelect
            label="Business Type"
            labelColor={theme.colors.text}
            value={form.business_type}
            onChange={(v) => {
              set("business_type", v);
              setErrors((p: any) => ({ ...p, business_type: "" }));
            }}
            options={[
              { label: "Online", value: "online" },
              { label: "Physical", value: "physical" },
              { label: "Hybrid", value: "hybrid" },
            ]}
            placeholder="Select Business Type"
            sheetTitle="Select Business Type"
            error={errors.business_type}
          />
        </View>

        {/* COUNTRY */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("country")}
        >
          <BottomSheetSelect
            label="Country"
            labelColor={theme.colors.text}
            searchable
            value={form.country}
            onChange={(v) => {
              set("country", v);
              set("city", "");
              setErrors((p: any) => ({ ...p, country: "" }));
            }}
            options={countries.map((c) => ({ label: c, value: c }))}
            placeholder="Select Country"
            sheetTitle="Select Country"
            error={errors.country}
          />
        </View>

        {/* CITY */}
        {!!form.country && (
          <View
            style={styles.fieldGap}
            onLayout={handleFieldLayout("city")}
          >
            <BottomSheetSelect
              label="City"
              labelColor={theme.colors.text}
              value={form.city}
              onChange={(v) => {
                set("city", v);
                setErrors((p: any) => ({ ...p, city: "" }));
              }}
              options={cities.map((c) => ({ label: c, value: c }))}
              placeholder="Select City"
              sheetTitle="Select City"
              error={errors.city}
            />
          </View>
        )}

        {/* ADDRESS */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("address")}
        >
          <InputField
            label="Address"
            labelColor={theme.colors.text}
            value={form.address}
            placeholder="Business address"
            onChangeText={(t) => set("address", t)}
          />
        </View>

        {/* EMAIL */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("email")}
        >
          <InputField
            label="Email"
            labelColor={theme.colors.text}
            value={form.email}
            placeholder="Business email"
            onChangeText={(t) => {
              set("email", t);
              setErrors((p: any) => ({ ...p, email: "" }));
            }}
            error={errors.email}
          />
        </View>

        {/* OPTIONAL FIELDS BELOW */}
        <InputField
          label="About Business"
          labelColor={theme.colors.text}
          value={form.about}
          onChangeText={(t) => set("about", t)}
          placeholder="Describe your business"
          multiline
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Phone"
          labelColor={theme.colors.text}
          value={form.phone}
          onChangeText={(t) => set("phone", t)}
          placeholder="Phone number"
          keyboardType="phone-pad"
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Website Link"
          labelColor={theme.colors.text}
          value={form.website_link}
          onChangeText={(t) => set("website_link", t)}
          placeholder="http://..."
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Facebook Link"
          labelColor={theme.colors.text}
          value={form.fb_link}
          onChangeText={(t) => set("fb_link", t)}
          placeholder="Facebook URL"
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Instagram Link"
          labelColor={theme.colors.text}
          value={form.insta_link}
          onChangeText={(t) => set("insta_link", t)}
          placeholder="Instagram URL"
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Discount"
          labelColor={theme.colors.text}
          value={form.discount}
          onChangeText={(t) => set("discount", t)}
          placeholder="Example: 20% Off"
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Promo Code"
          labelColor={theme.colors.text}
          value={form.promo_code}
          onChangeText={(t) => set("promo_code", t)}
          placeholder="ABC123"
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* STICKY SAVE BUTTON */}
      <View
        style={[
          styles.submitWrap,
          { paddingBottom: insets.bottom || 16 },
        ]}
      >
        <View style={styles.submitShadow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSubmit}
            disabled={bannerUploading}
          >
            <LinearGradient
              colors={["#1BAD7A", "#008F5C"]}
              style={styles.submitBtn}
            >
              {mutation.isPending || bannerUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Save Changes
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --------------------------------------------------
// STYLES (Copied from Event Edit Screen)
// --------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16 },
  fieldGap: { marginTop: 16 },

  // Upload Box (Same as Event UI)
  uploadBox: {
    height: 180,
    borderWidth: 0.5,
    borderRadius: 12,
    borderColor: "#1BAD7A",
    backgroundColor: "rgba(27,173,122,0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  bannerImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  bannerOverlayText: {
    color: "#fff",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },

  changeHintWrap: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeHintText: {
    color: "#fff",
    fontSize: 12,
  },

  submitWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  submitShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },

  submitBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  jobBtn: {
  height: 34,
  paddingHorizontal: 12,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
},

});

export default EditBusinessScreen;