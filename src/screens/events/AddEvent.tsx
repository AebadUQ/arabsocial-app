import React, { useState, useEffect, useRef } from "react";
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
import { Asset, launchImageLibrary } from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LinearGradient from "react-native-linear-gradient";
import { Text } from "@/components";
import InputField from "@/components/Input";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import PickerField from "@/components/Pickerfield";
import { Country, State } from "country-state-city";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent, uploadEventImage } from "@/api/events";

// Icons
import {
  CalendarBlank as CalendarIcon,
  Clock as ClockIcon,
  UploadSimple as UploadSimpleIcon,
  ArrowLeft as ArrowLeftIcon,
} from "phosphor-react-native";
import Card from "@/components/Card";
import { theme } from "@/theme/theme";

type FormState = {
  title: string;
  event_type: string;
  event_date: string;
  start_datetime: string;
  end_datetime: string;
  address: string;
  country: string;
  city: string;
  total_spots: string;
  ticket_link: string;
  price: string;
  description: string;
  bannerUri: string;
};

type FormErrors = {
  title?: string;
  event_type?: string;
  event_date?: string;
  start_datetime?: string;
  end_datetime?: string;
  country?: string;
  city?: string;
};

type PickerTarget = "date" | "start" | "end";

export default function PromoteEventScreen() {
  const navigation = useNavigation<any>();
  const { theme: appTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient(); // ✅ solution-1

  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    event_type: "",
    event_date: "",
    start_datetime: "",
    end_datetime: "",
    address: "",
    country: "",
    city: "",
    total_spots: "",
    ticket_link: "",
    price: "",
    description: "",
    bannerUri: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [bannerUploading, setBannerUploading] = useState(false);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // --- Scroll to error setup ---
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

  // --- Country / City handling ---
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const allCountries = Country.getAllCountries().map((c) => c.name);
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (form.country) {
      const selected = Country.getAllCountries().find(
        (c) => c.name === form.country
      );
      const stateList = State.getStatesOfCountry(selected?.isoCode || "").map(
        (s) => s.name
      );
      setCities(stateList);
      set("city", "");
      setErrors((prev) => ({
        ...prev,
        city: "",
      }));
    } else {
      setCities([]);
      set("city", "");
    }
  }, [form.country]);

  // ---- Date/Time Formatting ----
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // ---- Image Picker ----
  const onPickBanner = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        maxWidth: 1400,
        maxHeight: 1400,
        selectionLimit: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0] as Asset | undefined;

      if (!asset?.uri) {
        Alert.alert("No image", "Please select a valid image.");
        return;
      }

      set("bannerUri", asset.uri);
      setBannerUploading(true);

      const { url } = await uploadEventImage(asset);
      set("bannerUri", url);
    } catch (e) {
      console.error("Image picker / upload error:", e);
      Alert.alert("Error", "Unable to upload image. Please try again.");
    } finally {
      setBannerUploading(false);
    }
  };

  // ---- DateTime Picker ----
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("date");
  const [tempValue, setTempValue] = useState<Date>(new Date());

  const openPicker = (target: PickerTarget, mode: "date" | "time") => {
    setPickerTarget(target);
    setPickerMode(mode);
    let base: Date | null = null;
    if (target === "date") base = eventDate ?? new Date();
    if (target === "start") base = startAt ?? (eventDate ?? new Date());
    if (target === "end") base = endAt ?? startAt ?? (eventDate ?? new Date());
    setTempValue(base ?? new Date());
    setPickerVisible(true);
  };

  const onConfirm = (d: Date) => {
    if (pickerTarget === "date") {
      setEventDate(d);
      set("event_date", fmtDate(d));
      if (errors.event_date) {
        setErrors((prev) => ({ ...prev, event_date: "" }));
      }

      if (!startAt) {
        const s = new Date(d);
        s.setHours(18, 0, 0, 0);
        setStartAt(s);
        set("start_datetime", fmtTime(s));
      }
      if (!endAt) {
        const e = new Date(d);
        e.setHours(21, 0, 0, 0);
        setEndAt(e);
        set("end_datetime", fmtTime(e));
      }
    }

    if (pickerTarget === "start") {
      const base = new Date(eventDate ?? new Date());
      base.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setStartAt(base);
      set("start_datetime", fmtTime(base));
      if (errors.start_datetime) {
        setErrors((prev) => ({ ...prev, start_datetime: "" }));
      }
      if (endAt && endAt < base) {
        const e = new Date(base);
        e.setHours(base.getHours() + 1);
        setEndAt(e);
        set("end_datetime", fmtTime(e));
        if (errors.end_datetime) {
          setErrors((prev) => ({ ...prev, end_datetime: "" }));
        }
      }
    }

    if (pickerTarget === "end") {
      const base = new Date(eventDate ?? new Date());
      base.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setEndAt(base);

      if (startAt && base < startAt) {
        set("end_datetime", "");
        setErrors((prev) => ({
          ...prev,
          end_datetime: "End time must be after start time.",
        }));
      } else {
        set("end_datetime", fmtTime(base));
        if (errors.end_datetime) {
          setErrors((prev) => ({ ...prev, end_datetime: "" }));
        }
      }
    }

    setPickerVisible(false);
  };

  const onCancel = () => setPickerVisible(false);

  const onSelectDate = () => openPicker("date", "date");
  const onSelectStart = () => openPicker("start", "time");
  const onSelectEnd = () => openPicker("end", "time");

  // ---- React Query Mutation ----
  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // ✅ Event list ko fresh karne ke liye
      queryClient.invalidateQueries({ queryKey: ["approvedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });

      navigation.goBack();
    },
    onError: (err: any) => {
      console.error(err);
      // yahan agar chaho to toast waghera use kar sakte ho
    },
  });

  // ---- Submit ----
  const onSubmit = () => {
    const newErrors: FormErrors = {};

    if (!form.title?.trim()) {
      newErrors.title = "Please enter event name.";
    }

    if (!form.event_type?.trim()) {
      newErrors.event_type = "Please select event type.";
    }

    if (!eventDate) {
      newErrors.event_date = "Please pick event date.";
    }

    if (!startAt) {
      newErrors.start_datetime = "Please pick start time.";
    }

    if (!endAt) {
      newErrors.end_datetime = "Please pick end time.";
    }

    if (startAt && endAt && startAt >= endAt) {
      newErrors.end_datetime = "End time must be after start time.";
    }

    if (!form.country?.trim()) {
      newErrors.country = "Please select country.";
    }

    if (!form.city?.trim()) {
      newErrors.city = "Please select city/state.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const order: (keyof FormErrors)[] = [
        "title",
        "event_type",
        "country",
        "city",
        "event_date",
        "start_datetime",
        "end_datetime",
      ];

      const firstErrorKey = order.find((k) => newErrors[k]);
      if (firstErrorKey) {
        scrollToField(firstErrorKey);
      }
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      event_type: form.event_type,
      location: form.address,
      address: form.address,
      country: form.country,
      city: form.city,
      flyer: form.bannerUri,
      img: form.bannerUri,
      ticket_link: form.ticket_link,
      price: form.price,
      total_spots: Number(form.total_spots),
      start_datetime: startAt!.toISOString(),
      end_datetime: endAt!.toISOString(),
      event_date: eventDate!.toISOString(),
    };

    mutation.mutate(payload);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: appTheme.colors.background }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color={appTheme.colors.text} />
        </TouchableOpacity>

        <Text variant="body1" color={appTheme.colors.text}>
          Promote Event
        </Text>
        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 50 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Upload */}
        <View onLayout={handleFieldLayout("banner")}>
          <Card style={{ padding: form.bannerUri ? 0 : 20 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.uploadBox]}
              onPress={onPickBanner}
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
                      <Text style={styles.bannerOverlayText}>
                        Uploading...
                      </Text>
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
                      backgroundColor: appTheme.colors.primaryShade,
                      padding: 10,
                      borderRadius: 20,
                    }}
                  >
                    <UploadSimpleIcon
                      size={24}
                      color={appTheme.colors.primary}
                    />
                  </View>
                  <Text variant="body1" color={appTheme.colors.textLight}>
                    Upload your event banner here
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* Event Name */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("title")}
        >
          <InputField
            label="Event Name"
            labelColor={appTheme.colors.text}
            placeholder="Enter event name"
            value={form.title}
            onChangeText={(t) => {
              set("title", t);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: "" }));
              }
            }}
            error={errors.title}
          />
        </View>

        {/* Event Type */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("event_type")}
        >
          <BottomSheetSelect
            label="Event Type"
            labelColor={appTheme.colors.text}
            value={form.event_type}
            onChange={(v) => {
              set("event_type", v);
              if (errors.event_type) {
                setErrors((prev) => ({ ...prev, event_type: "" }));
              }
            }}
            options={[
              { label: "Online", value: "online" },
              { label: "In Person", value: "in_person" },
            ]}
            placeholder="Select Event Type"
            sheetTitle="Select Event Type"
            error={errors.event_type}
          />
        </View>

        {/* Country */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("country")}
        >
          <BottomSheetSelect
            label="Country"
            labelColor={appTheme.colors.text}
            searchable
            value={form.country}
            onChange={(v) => {
              set("country", v);
              if (errors.country) {
                setErrors((prev) => ({ ...prev, country: "" }));
              }
            }}
            options={countries.map((c) => ({ label: c, value: c }))}
            placeholder="Select Country"
            sheetTitle="Select Country"
            error={errors.country}
          />
        </View>

        {/* City */}
        {form.country ? (
          <View
            style={styles.fieldGap}
            onLayout={handleFieldLayout("city")}
          >
            <BottomSheetSelect
              label="City / State"
              labelColor={appTheme.colors.text}
              value={form.city}
              onChange={(v) => {
                set("city", v);
                if (errors.city) {
                  setErrors((prev) => ({ ...prev, city: "" }));
                }
              }}
              options={cities.map((s) => ({ label: s, value: s }))}
              placeholder="Select City"
              sheetTitle="Select City"
              error={errors.city}
            />
          </View>
        ) : null}

        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("address")}
        >
          <InputField
            label="Address"
            labelColor={appTheme.colors.text}
            placeholder="Event address"
            value={form.address}
            onChangeText={(t) => set("address", t)}
          />
        </View>

        {/* Date & Time Pickers */}
        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("event_date")}
        >
          <PickerField
            label="Event Date"
            labelColor={appTheme.colors.text}
            placeholder="Event date"
            value={form.event_date}
            icon={
              <CalendarIcon size={18} color={appTheme.colors.placeholder} />
            }
            onPress={onSelectDate}
            error={errors.event_date}
          />
        </View>

        <View
          style={[styles.row, styles.fieldGap]}
          onLayout={handleFieldLayout("start_datetime")}
        >
          <View style={styles.col}>
            <PickerField
              label="Start Time"
              labelColor={appTheme.colors.text}
              placeholder="Start Time"
              value={form.start_datetime}
              icon={
                <ClockIcon size={18} color={appTheme.colors.placeholder} />
              }
              onPress={onSelectStart}
              error={errors.start_datetime}
            />
          </View>
          <View style={styles.col}>
            <PickerField
              label="End Time"
              labelColor={appTheme.colors.text}
              placeholder="End Time"
              value={form.end_datetime}
              icon={
                <ClockIcon size={18} color={appTheme.colors.placeholder} />
              }
              onPress={onSelectEnd}
              error={errors.end_datetime}
            />
          </View>
        </View>

        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("price")}
        >
          <InputField
            label="Price (optional)"
            labelColor={appTheme.colors.text}
            placeholder="$0.00"
            value={form.price}
            keyboardType="numeric"
            onChangeText={(t) => set("price", t)}
          />
        </View>

        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("total_spots")}
        >
          {/* <InputField
            label="Total spots"
            labelColor={appTheme.colors.text}
            placeholder="e.g 100"
            value={form.total_spots}
            onChangeText={(t) => set("total_spots", t)}
            keyboardType="numeric"
            
          /> */}
          <InputField
    label="Total spots"
    labelColor={appTheme.colors.text}
    placeholder="e.g 100"
    value={form.total_spots}
    keyboardType="numeric"
    onChangeText={(t) => {
      // sirf digits allow karo
      const onlyDigits = t.replace(/[^0-9]/g, "");

      // max 4 digits
      if (onlyDigits.length <= 4) {
        set("total_spots", onlyDigits);
      }
    }}
  />
        </View>

        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("ticket_link")}
        >
          <InputField
            label="Event Link (optional)"
            labelColor={appTheme.colors.text}
            placeholder="http://..."
            value={form.ticket_link}
            onChangeText={(t) => set("ticket_link", t)}
          />
        </View>

        <View
          style={styles.fieldGap}
          onLayout={handleFieldLayout("description")}
        >
          <InputField
            label="Description"
            labelColor={appTheme.colors.text}
            placeholder="Describe your event.."
            value={form.description}
            onChangeText={(t) => set("description", t)}
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Submit Button (sticky gradient) */}
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              {
                // @ts-ignore
                mutation.isLoading || bannerUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Submit Event
                  </Text>
                )
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={pickerMode}
        date={tempValue}
        minimumDate={new Date()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
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
  uploadBox: {
    height: 180,
    borderWidth: 0.5,
    borderRadius: 12,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryShade,
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
  changeHintText: { color: "#fff", fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  col: { flex: 1 },
  submitWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
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
});
