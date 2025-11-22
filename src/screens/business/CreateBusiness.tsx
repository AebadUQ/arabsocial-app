import React, { useEffect, useState, useRef } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components";
import InputField from "@/components/Input";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { Country, State } from "country-state-city";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBusiness, uploadBusinessImage } from "@/api/business";
import { launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import Card from "@/components/Card";
import {
  ArrowLeft as ArrowLeftIcon,
  UploadSimple as UploadSimpleIcon,
} from "phosphor-react-native";

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

export default function PromoteBusinessScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // --------------------------------------------------
  // FORM STATE
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

  const [errors, setErrors] = useState<any>({});
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // --------------------------------------------------
  // SCROLL-TO-ERROR LOGIC
  // --------------------------------------------------
  const scrollRef = useRef<ScrollView | null>(null);
  const [fieldPositions, setFieldPositions] = useState<Record<string, number>>({});

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
  // COUNTRY / CITY LOGIC
  // --------------------------------------------------
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [bannerUploading, setBannerUploading] = useState(false);

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

  // --------------------------------------------------
  // IMAGE PICKER
  // --------------------------------------------------
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
      Alert.alert("Error", "Failed to upload banner");
    } finally {
      setBannerUploading(false);
    }
  };

  // --------------------------------------------------
  // SUBMIT FORM + SCROLL TO FIRST ERROR
  // --------------------------------------------------
  const mutation = useMutation({
    mutationFn: createBusiness,
onSuccess: () => {
    // 🔥 invalidate listings so new business appears
    // queryClient.invalidateQueries({ queryKey: ["approvedBusinesses"] });
    queryClient.invalidateQueries({ queryKey: ["myBusinesses"] });
    // queryClient.invalidateQueries({ queryKey: ["featuredBusinesses"] });

    navigation.goBack();
  },  });

  const onSubmit = () => {
    const e: any = {};

    // REQUIRED FIELDS
    if (!form.business_name) e.business_name = "Business name required";
    if (!form.category) e.category = "Select category";
    if (!form.business_type) e.business_type = "Select business type";
    if (!form.country) e.country = "Select country";
    if (!form.city) e.city = "Select city/state";
    if (!form.email?.trim()) e.email = "Email is required";

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

      const firstError = order.find((key) => e[key]);
      if (firstError) scrollToField(firstError);
      return;
    }

    mutation.mutate({
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
      promo_code: form.promo_code,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text variant="body1" color={theme.colors.text}>Promote Business</Text>

        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      {/* SCROLL */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View onLayout={handleFieldLayout("banner")}>
          <Card style={{ padding: form.bannerUri ? 0 : 20 }}>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={pickBanner}
              disabled={bannerUploading}
            >
              {form.bannerUri ? (
                <>
                  <Image source={{ uri: form.bannerUri }} style={styles.bannerImg} />
                  {bannerUploading && (
                    <View style={styles.bannerOverlay}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.bannerOverlayText}>Uploading...</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.uploadInner}>
                  <UploadSimpleIcon size={24} color={theme.colors.primary} />
                  <Text color={theme.colors.textLight}>Upload business banner</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* Business Name */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("business_name")}>
          <InputField
            label="Business Name"
            labelColor={theme.colors.text}
            value={form.business_name}
            onChangeText={(t) => {
              set("business_name", t);
              setErrors((p: any) => ({ ...p, business_name: "" }));
            }}
            placeholder="Enter business name"
            error={errors.business_name}
          />
        </View>

        {/* Category */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("category")}>
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

        {/* Business Type */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("business_type")}>
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

        {/* Country */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("country")}>
          <BottomSheetSelect
            label="Country"
            labelColor={theme.colors.text}
            searchable
            value={form.country}
            onChange={(v) => {
              set("country", v);
              setErrors((p: any) => ({ ...p, country: "" }));
            }}
            options={countries.map((c) => ({ label: c, value: c }))}
            placeholder="Select Country"
            sheetTitle="Select Country"
            error={errors.country}
          />
        </View>

        {/* City */}
        {!!form.country && (
          <View style={styles.fieldGap} onLayout={handleFieldLayout("city")}>
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

        {/* About */}
        <InputField
          label="About Business"
            labelColor={theme.colors.text}

          value={form.about}
          onChangeText={(t) => set("about", t)}
          placeholder="Describe your business"
          multiline
          containerStyle={styles.fieldGap}
        />

        {/* Address */}
        <InputField
          label="Address"
            labelColor={theme.colors.text}

          value={form.address}
          onChangeText={(t) => set("address", t)}
          placeholder="Business Address"
          containerStyle={styles.fieldGap}
        />

        {/* Phone */}
        <InputField
          label="Phone"
            labelColor={theme.colors.text}

          value={form.phone}
          onChangeText={(t) => set("phone", t)}
          placeholder="Phone"
          keyboardType="phone-pad"
          containerStyle={styles.fieldGap}
        />

        {/* Email (required) */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("email")}>
          <InputField
            label="Email"
            labelColor={theme.colors.text}

            value={form.email}
            onChangeText={(t) => {
              set("email", t);
              setErrors((p: any) => ({ ...p, email: "" }));
            }}
            placeholder="Email"
            error={errors.email}
          />
        </View>

        {/* Website */}
        <InputField
          label="Website Link"
            labelColor={theme.colors.text}

          value={form.website_link}
          onChangeText={(t) => set("website_link", t)}
          placeholder="http://..."
          containerStyle={styles.fieldGap}
        />

        {/* FB */}
        <InputField
          label="Facebook Link"
            labelColor={theme.colors.text}

          value={form.fb_link}
          onChangeText={(t) => set("fb_link", t)}
          placeholder="Facebook URL"
          containerStyle={styles.fieldGap}
        />

        {/* Insta */}
        <InputField
          label="Instagram Link"
            labelColor={theme.colors.text}

          value={form.insta_link}
          onChangeText={(t) => set("insta_link", t)}
          placeholder="Instagram URL"
          containerStyle={styles.fieldGap}
        />

        {/* Discount */}
        <InputField
          label="Discount"
            labelColor={theme.colors.text}

          value={form.discount}
          onChangeText={(t) => set("discount", t)}
          placeholder="Example: 20% Off"
          containerStyle={styles.fieldGap}
        />

        {/* Promo Code */}
        <InputField
          label="Promo Code (Optional)"
            labelColor={theme.colors.text}

          value={form.promo_code}
          onChangeText={(t) => set("promo_code", t)}
          placeholder="ABC123"
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* SUBMIT */}
      <View style={[styles.submitWrap, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit}>
          <LinearGradient colors={["#1BAD7A", "#008F5C"]} style={styles.submitBtn}>
            {bannerUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Submit Business
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  navBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBox: {
    height: 180,
    borderWidth: 0.8,
    borderColor: "#1BAD7A",
    borderRadius: 12,
    backgroundColor: "#E7F9F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerOverlayText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
  },
  fieldGap: {
    marginTop: 16,
  },
  submitWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  submitBtn: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});
