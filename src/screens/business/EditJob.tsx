import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Country, City } from "country-state-city";
import LinearGradient from "react-native-linear-gradient";

// Components
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useTheme } from "@/theme/ThemeContext";

// Icons
import { ArrowLeft as ArrowLeftIcon } from "phosphor-react-native";

// API
import { getJobDetails, updateJob } from "@/api/business";

type RouteParams = { jobId: string | number };

const JOB_TYPES = [
  { label: "Remote", value: "remote" },
  { label: "Work from Home", value: "work from home" },
  { label: "Onsite", value: "onsite" },
];

export default function EditJobScreen() {
  const navigation = useNavigation<any>();
  const { jobId } = useRoute<any>().params as RouteParams;

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // FORM STATE
  const [form, setForm] = useState({
    title: "",
    job_type: "",
    country: "",
    city: "",
    description: "",
    application_link: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------
  // SCROLL TO FIELD
  // ---------------------------------------------
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

  // ---------------------------------------------
  // COUNTRY / CITY LOADING
  // ---------------------------------------------
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countryList, setCountryList] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCountryList(allCountries.map((c) => c.name));
  }, [allCountries]);

  useEffect(() => {
    if (!form.country) {
      setCities([]);
      set("city", "");
      return;
    }

    const iso = allCountries.find((x) => x.name === form.country)?.isoCode;
    //@ts-ignore
    const nextCities = City.getCitiesOfCountry(iso || "").map((ci) => ci.name);

    setCities([...new Set(nextCities)]);
  }, [form.country]);

  // ---------------------------------------------
  // LOAD EXISTING JOB DETAILS
  // ---------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getJobDetails(jobId);

        if (mounted) {
          setForm({
            title: data?.title || "",
            job_type: data?.job_type || "",
            country: data?.country || data?.business?.country || "",
            city: data?.city || data?.business?.city || "",
            description: data?.description || "",
            application_link: data?.application_link || "",
          });
        }
      } catch (err: any) {
        Alert.alert("Error", "Failed to load job");
        navigation.goBack();
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  // ---------------------------------------------
  // UPDATE JOB MUTATION
  // ---------------------------------------------
  const mutation = useMutation({
    mutationFn: (payload: any) => updateJob(jobId, payload),
    onSuccess: () => {
      Alert.alert("Success", "Job updated!");
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  const isValidUrl = (v: string) =>
    /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\-.?=&%#]*)?$/i.test(v.trim());

  const onSubmit = () => {
    const e: any = {};

    if (!form.title.trim()) e.title = "Required";
    if (!form.job_type) e.job_type = "Required";
    if (!form.country) e.country = "Required";
    if (!form.city) e.city = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.application_link.trim() || !isValidUrl(form.application_link))
      e.application_link = "Valid URL required";

    setErrors(e);

    if (Object.keys(e).length > 0) {
      const order = ["title", "job_type", "country", "city", "description", "application_link"];
      const first = order.find((key) => e[key]);
      if (first) scrollToField(first);
      return;
    }

    mutation.mutate(form);
  };

  const disableUI = loading || mutation.isPending;

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1BAD7A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* ---------------------- TOP BAR ---------------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={22} color="#000" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Edit Job</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* ---------------------- FORM ---------------------- */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("title")}>
          <InputField
            label="Job Title"
            labelColor="#000"
            value={form.title}
            placeholder="Enter job title"
            
            onChangeText={(t) => {
              set("title", t);
              setErrors((p: any) => ({ ...p, title: "" }));
            }}
            error={errors.title}
          />
        </View>

        {/* JOB TYPE */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("job_type")}>
          <BottomSheetSelect
            label="Job Type"
            labelColor="#000"
            value={form.job_type}
            onChange={(v) => {
              set("job_type", v);
              setErrors((p: any) => ({ ...p, job_type: "" }));
            }}
            options={JOB_TYPES}
            placeholder="Select Job Type"
            sheetTitle="Job Type"
            error={errors.job_type}
          />
        </View>

        {/* COUNTRY */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("country")}>
          <BottomSheetSelect
            label="Country"
            labelColor="#000"
            searchable
            value={form.country}
            onChange={(v) => {
              set("country", v);
              set("city", "");
              setErrors((p: any) => ({ ...p, country: "" }));
            }}
            options={countryList.map((c) => ({ label: c, value: c }))}
            placeholder="Select Country"
            sheetTitle="Country"
            error={errors.country}
          />
        </View>

        {/* CITY */}
        {!!form.country && (
          <View style={styles.fieldGap} onLayout={handleFieldLayout("city")}>
            <BottomSheetSelect
              label="City"
              labelColor="#000"
              value={form.city}
              onChange={(v) => {
                set("city", v);
                setErrors((p: any) => ({ ...p, city: "" }));
              }}
              options={cities.map((c) => ({ label: c, value: c }))}
              placeholder="Select City"
              sheetTitle="City"
              error={errors.city}
            />
          </View>
        )}

        {/* DESCRIPTION */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("description")}>
          <InputField
            label="Description"
            labelColor="#000"
            multiline
            numberOfLines={5}
            placeholder="Enter job details"
            value={form.description}
            onChangeText={(t) => {
              set("description", t);
              setErrors((p: any) => ({ ...p, description: "" }));
            }}
            // style={{ textAlignVertical: "top" }}
            error={errors.description}
          />
        </View>

        {/* APPLICATION LINK */}
        <View style={styles.fieldGap} onLayout={handleFieldLayout("application_link")}>
          <InputField
            label="Application Link"
            labelColor="#000"
            value={form.application_link}
            placeholder="https://..."
            onChangeText={(t) => {
              set("application_link", t);
              setErrors((p: any) => ({ ...p, application_link: "" }));
            }}
            keyboardType="url"
            error={errors.application_link}
          />
        </View>
      </ScrollView>

      {/* ---------------------- STICKY SAVE BUTTON ---------------------- */}
      <View style={[styles.submitWrap, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.submitShadow}>
          <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={disableUI}>
            <LinearGradient
              colors={["#1BAD7A", "#008F5C"]}
              style={styles.submitBtn}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// STYLES — (Copied from EditBusiness)
// --------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

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
    elevation: 3,
  },

  topTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  content: {
    padding: 16,
  },

  fieldGap: {
    marginTop: 16,
  },

  submitWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    backgroundColor: "white",
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

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
