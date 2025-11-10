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
import { Country, State } from "country-state-city";
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useTheme } from "@/theme/ThemeContext";
import {
  ArrowLeft as ArrowLeftIcon,
} from "phosphor-react-native";
import { createJobs } from "@/api/business";

type RouteParams = { businessId: string | number };

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
  { label: "Online", value: "online" as const },
];

export default function CreateJobScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const businessId = (route.params as RouteParams)?.businessId;

  const [form, setForm] = useState<FormState>({
    title: "",
    job_type: "",
    country: "",
    city: "",
    description: "",
    application_link: "",
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

  useEffect(() => {
    if (!form.country) {
      setCities([]);
      set("city", "");
      return;
    }
    const c = allCountries.find((x) => x.name === form.country);
    const next = State.getStatesOfCountry(c?.isoCode || "").map((s) => s.name);
    setCities(next);
    if (form.city && !next.includes(form.city)) set("city", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country]);

  // ---- Mutation
  const mutation = useMutation({
    mutationFn: (payload: any) => createJobs(payload),
    onSuccess: () => {
      Alert.alert("Success", "Job posted successfully!");
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  const isValidUrl = (v: string) =>
    /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\-.?=&%#]*)?$/i.test(v.trim());

  const onSubmit = () => {
    if (!businessId) {
      return Alert.alert("Missing", "Business reference not found.");
    }
    if (!form.title.trim()) return Alert.alert("Missing", "Please enter job title.");
    if (!form.job_type) return Alert.alert("Missing", "Please select job type.");
    if (!form.country) return Alert.alert("Missing", "Please select country.");
    if (!form.city) return Alert.alert("Missing", "Please select city.");
    if (!form.description.trim()) return Alert.alert("Missing", "Please add a short description.");
    if (!form.application_link.trim() || !isValidUrl(form.application_link))
      return Alert.alert("Invalid", "Please enter a valid application URL (https://...)");

    const payload = {
      businessId: typeof businessId === "string" ? Number(businessId) : businessId,
      title: form.title.trim(),
      job_type: form.job_type,
      country:form.country,
      city:form.city,
    //   location: `${form.city}, ${form.country}`,
      description: form.description.trim(),
      application_link: form.application_link.trim(),
    };

    mutation.mutate(payload as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar: back + title (left), empty spacer (right) */}
      <View style={styles.topBar}>
        <View style={styles.leftWrap}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} weight="bold" color="#fff" />
          </TouchableOpacity>
          <Text variant="body1" color={theme.colors.text} style={styles.title}>
            Post a Job
          </Text>
        </View>
        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: (insets.bottom || 16) + 84 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <InputField
          placeholder="Job title (e.g., Senior NestJS + Prisma Engineer)"
          value={form.title}
          onChangeText={(t) => set("title", t)}
          containerStyle={styles.fieldGap}
        />

        {/* Job Type */}
        <BottomSheetSelect
          value={form.job_type}
          onChange={(v) => set("job_type", v as any)}
          options={JOB_TYPES}
          placeholder="Select Job Type"
          sheetTitle="Job Type"
          containerStyle={styles.fieldGap}
        />

        {/* Country */}
        <BottomSheetSelect
          searchable
          value={form.country}
          onChange={(v) => set("country", String(v))}
          options={countries.map((c) => ({ label: c, value: c }))}
          placeholder="Select Country"
          sheetTitle="Select Country"
          containerStyle={styles.fieldGap}
        />

        {/* City */}
        {!!form.country && (
          <BottomSheetSelect
            value={form.city}
            onChange={(v) => set("city", String(v))}
            options={cities.map((s) => ({ label: s, value: s }))}
            placeholder="Select City"
            sheetTitle="Select City"
            containerStyle={styles.fieldGap}
          />
        )}

        {/* Description */}
        <InputField
          placeholder="Job description"
          value={form.description}
          onChangeText={(t) => set("description", t)}
          multiline
          numberOfLines={5}
          style={{ textAlignVertical: "top" }}
          containerStyle={styles.fieldGap}
        />

        {/* Application link */}
        <InputField
          placeholder="Application link (https://...)"
          value={form.application_link}
          onChangeText={(t) => set("application_link", t)}
          autoCapitalize="none"
          keyboardType="url"
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, mutation.isPending && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Post Job</Text>
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
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#1BAD7A",
  },
  title: { fontWeight: "700", maxWidth: 200 },

  content: { padding: 16 },
  fieldGap: { marginTop: 16 },

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
