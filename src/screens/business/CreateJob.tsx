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
import { Country, State } from "country-state-city";
import { Text } from "@/components";
import InputField from "@/components/Input";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import { useTheme } from "@/theme/ThemeContext";
import LinearGradient from "react-native-linear-gradient";
import { ArrowLeft as ArrowLeftIcon } from "phosphor-react-native";
import { createJobs } from "@/api/business";

type RouteParams = { businessId: string | number };

const JOB_TYPES = [
  { label: "Remote", value: "remote" },
  { label: "Work from Home", value: "work from home" },
  { label: "Online", value: "online" },
];

export default function CreateJobScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const businessId = (route.params as RouteParams)?.businessId;

  const [form, setForm] = useState({
    title: "",
    job_type: "",
    country: "",
    city: "",
    description: "",
    application_link: "",
  });

  const [errors, setErrors] = useState<any>({});
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // -------------------------------
  // SCROLL TO ERROR
  // -------------------------------
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
    if (scrollRef.current && y != null) {
      scrollRef.current.scrollTo({ y: Math.max(y - 20, 0), animated: true });
    }
  };

  // -------------------------------
  // COUNTRY / CITY
  // -------------------------------
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    setCountries(allCountries.map((c) => c.name));
  }, []);

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
  }, [form.country]);

  // -------------------------------
  // SUBMIT
  // -------------------------------
  const mutation = useMutation({
    mutationFn: createJobs,
    onSuccess: () => {
      Alert.alert("Success", "Job posted successfully!");
      navigation.goBack();
    },
  });

  const isValidUrl = (v: string) =>
    /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\-.?=&%#]*)?$/i.test(v.trim());

  const onSubmit = () => {
    const e: any = {};

    if (!form.title.trim()) e.title = "Job title required";
    if (!form.job_type) e.job_type = "Select job type";
    if (!form.country) e.country = "Select country";
    if (!form.city) e.city = "Select city";
    if (!form.description.trim()) e.description = "Enter description";
    if (!form.application_link.trim() || !isValidUrl(form.application_link))
      e.application_link = "Enter valid URL (https://...)";

    setErrors(e);

    if (Object.keys(e).length > 0) {
      const order = ["title", "job_type", "country", "city", "description", "application_link"];
      const first = order.find((k) => e[k]);
      if (first) scrollToField(first);
      return;
    }

    mutation.mutate({
      businessId: Number(businessId),
      ...form,
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} weight="bold" color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="body1" style={styles.title} color={theme.colors.text}>
          Post a Job
        </Text>
        <View style={{ width: 30, opacity: 0 }} />
      </View>

      {/* FORM SCROLL */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* title */}
        <View onLayout={handleFieldLayout("title")} style={styles.fieldGap}>
          <InputField
            placeholder="Job title"
            value={form.title}
            onChangeText={(t) => {
              set("title", t);
              setErrors((p: any) => ({ ...p, title: "" }));
            }}
            error={errors.title}
          />
        </View>

        {/* job type */}
        <View onLayout={handleFieldLayout("job_type")} style={styles.fieldGap}>
          <BottomSheetSelect
            value={form.job_type}
            onChange={(v) => {
              set("job_type", v);
              setErrors((p: any) => ({ ...p, job_type: "" }));
            }}
            options={JOB_TYPES}
            placeholder="Job Type"
            sheetTitle="Job Type"
            error={errors.job_type}
          />
        </View>

        {/* country */}
        <View onLayout={handleFieldLayout("country")} style={styles.fieldGap}>
          <BottomSheetSelect
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

        {/* city */}
        {!!form.country && (
          <View onLayout={handleFieldLayout("city")} style={styles.fieldGap}>
            <BottomSheetSelect
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

        {/* description */}
        <View onLayout={handleFieldLayout("description")} style={styles.fieldGap}>
          <InputField
            placeholder="Job Description"
            value={form.description}
            onChangeText={(t) => {
              set("description", t);
              setErrors((p: any) => ({ ...p, description: "" }));
            }}
            multiline
            numberOfLines={5}
            error={errors.description}
          />
        </View>

        {/* application link */}
        <View onLayout={handleFieldLayout("application_link")} style={styles.fieldGap}>
          <InputField
            placeholder="Application link (https://...)"
            value={form.application_link}
            onChangeText={(t) => {
              set("application_link", t);
              setErrors((p: any) => ({ ...p, application_link: "" }));
            }}
            autoCapitalize="none"
            keyboardType="url"
            error={errors.application_link}
          />
        </View>
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <View style={[styles.submitWrap, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={mutation.isPending}>
          <LinearGradient
            colors={["#1BAD7A", "#008F5C"]}
            style={[styles.submitBtn, mutation.isPending && { opacity: 0.6 }]}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Post Job</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },

  navBtn: {
    width: 38,
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontWeight: "700", fontSize: 16 },
  fieldGap: { marginTop: 16 },

  submitWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    paddingTop: 10,
  },

  submitBtn: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});
