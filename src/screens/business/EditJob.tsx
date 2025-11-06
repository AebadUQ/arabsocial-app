import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Country, City } from "country-state-city";
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useTheme } from "@/theme/ThemeContext";
import { ArrowLeft as ArrowLeftIcon } from "phosphor-react-native";
import { getJobDetails, updateJob } from "@/api/business";

type RouteParams = { jobId: string | number };

type FormState = {
  title: string;
  job_type: "remote" | "work from home" | "online" | "";
  country: string;
  city: string;
  description: string;
  application_link: string;
};

const JOB_TYPES = [
  { label: "Remote", value: "remote" as const },
  { label: "Work from Home", value: "work from home" as const },
  { label: "Onsite", value: "onsite" as const },
];

export default function EditJobScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const jobId = (route.params as RouteParams)?.jobId;
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>({
    title: "",
    job_type: "",
    country: "",
    city: "",
    description: "",
    application_link: "",
  });
  console.log('sssss',form)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCountries(allCountries.map((c) => c.name));
  }, [allCountries]);

  // ✅ Handle city list based on country
  useEffect(() => {
    if (!form.country) {
      setCities([]);
      set("city", "");
      return;
    }

    const c = allCountries.find((x) => x.name === form.country);
    const countryIso = c?.isoCode || "";
    const next = (City.getCitiesOfCountry(countryIso) || []).map((ci) => ci.name);

    // Remove duplicates + keep selected city if needed
    const unique = [...new Set(next)];
    setCities(unique);
  }, [form.country]);

  // ------- Load existing job details
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!jobId) {
          Alert.alert("Missing", "Job reference not found.");
          navigation.goBack();
          return;
        }
        setLoading(true);
        const data = await getJobDetails(jobId);

        if (mounted) {
          setForm({
            title: data?.title || "",
            job_type: (data?.job_type as FormState["job_type"]) || "",
            country: data?.country || data?.business?.country || "",
            city: data?.city || data?.business?.city || "",
            description: data?.description || "",
            application_link: data?.application_link || "",
          });
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to load job details");
        navigation.goBack();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jobId, navigation]);

  // ---- Update mutation
  const mutation = useMutation({
    mutationFn: (payload: any) => updateJob(jobId, payload),
    onSuccess: () => {
      Alert.alert("Success", "Job updated successfully!");
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  const isValidUrl = (v: string) =>
    /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\-.?=&%#]*)?$/i.test(v.trim());

  const onSubmit = () => {
    if (!jobId) return Alert.alert("Missing", "Job reference not found.");
    if (!form.title.trim()) return Alert.alert("Missing", "Please enter job title.");
    if (!form.job_type) return Alert.alert("Missing", "Please select job type.");
    if (!form.country) return Alert.alert("Missing", "Please select country.");
    if (!form.city) return Alert.alert("Missing", "Please select city.");
    if (!form.description.trim())
      return Alert.alert("Missing", "Please add a short description.");
    if (!form.application_link.trim() || !isValidUrl(form.application_link))
      return Alert.alert("Invalid", "Please enter a valid application URL (https://...)");

    // ✅ No location field now
    const payload = {
      title: form.title.trim(),
      job_type: form.job_type,
      country: form.country,
      city: form.city,
      description: form.description.trim(),
      application_link: form.application_link.trim(),
    };

    mutation.mutate(payload as any);
  };

  const disableUI = loading || mutation.isPending;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftWrap}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.goBack()}
            disabled={disableUI}
          >
            <ArrowLeftIcon size={20} weight="bold" color="#fff" />
          </TouchableOpacity>
          <Text variant="body1" color={theme.colors.text} style={styles.title}>
            Edit Job
          </Text>
        </View>
        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: (insets.bottom || 16) + 84 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InputField
            placeholder="Job title (e.g., Senior NestJS + Prisma Engineer)"
            value={form.title}
            onChangeText={(t) => set("title", t)}
            containerStyle={styles.fieldGap}
            editable={!disableUI}
          />

          <BottomSheetSelect
            value={form.job_type}
            onChange={(v) => set("job_type", v as any)}
            options={JOB_TYPES.map((item, i) => ({
              key: `jobtype_${item.value}_${i}`,
              label: item.label,
              value: item.value,
            }))}
            placeholder="Select Job Type"
            sheetTitle="Job Type"
            containerStyle={styles.fieldGap}
          />

          {/* ✅ Clear city when country changes */}
          <BottomSheetSelect
            searchable
            value={form.country}
            onChange={(v) => {
              const selectedCountry = String(v);
              set("country", selectedCountry);
              set("city", ""); // clear city when country changes
            }}
            options={countries.map((c, i) => ({
              key: `country_${c}_${i}`,
              label: c,
              value: c,
            }))}
            placeholder="Select Country"
            sheetTitle="Select Country"
            containerStyle={styles.fieldGap}
          />

          {!!form.country && (
            <BottomSheetSelect
              value={form.city}
              onChange={(v) => set("city", String(v))}
              options={cities.map((s, i) => ({
                key: `city_${s}_${i}`,
                label: s,
                value: s,
              }))}
              placeholder="Select City"
              sheetTitle="Select City"
              containerStyle={styles.fieldGap}
            />
          )}

          <InputField
            placeholder="Job description"
            value={form.description}
            onChangeText={(t) => set("description", t)}
            multiline
            numberOfLines={5}
            style={{ textAlignVertical: "top" }}
            containerStyle={styles.fieldGap}
            editable={!disableUI}
          />

          <InputField
            placeholder="Application link (https://...)"
            value={form.application_link}
            onChangeText={(t) => set("application_link", t)}
            autoCapitalize="none"
            keyboardType="url"
            containerStyle={styles.fieldGap}
            editable={!disableUI}
          />
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, disableUI && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={disableUI}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Save Changes</Text>
        )}
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
  leftWrap: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BAD7A",
  },
  title: { fontWeight: "700", maxWidth: 200 },
  content: { padding: 16 },
  fieldGap: { marginTop: 16 },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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
