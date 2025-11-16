import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LinearGradient from "react-native-linear-gradient";
import { Text } from "@/components";
import InputField from "@/components/Input";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import PickerField from "@/components/Pickerfield";
import { Country, State } from "country-state-city";
import { useMutation } from "@tanstack/react-query";
import { createEvent } from "@/api/events";

// Icons
import {
  CalendarBlank as CalendarIcon,
  Clock as ClockIcon,
  ImageSquare as ImageSquareIcon,
  ArrowLeft as ArrowLeftIcon,
  UploadSimpleIcon,
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

type PickerTarget = "date" | "start" | "end";

export default function PromoteEventScreen() {
  const navigation = useNavigation<any>();
  const { theme: appTheme } = useTheme();
  const insets = useSafeAreaInsets();

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

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

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

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("No image", "Please select a valid image.");
        return;
      }
      set("bannerUri", asset.uri);
    } catch (e) {
      console.error("Image picker error:", e);
      Alert.alert("Error", "Unable to open image picker.");
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
      if (endAt && endAt < base) {
        const e = new Date(base);
        e.setHours(base.getHours() + 1);
        setEndAt(e);
        set("end_datetime", fmtTime(e));
      }
    }

    if (pickerTarget === "end") {
      const base = new Date(eventDate ?? new Date());
      base.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setEndAt(base);
      //@ts-ignore
      set("end_datetime", fmtTime(e));
      if (startAt && base < startAt) {
        Alert.alert("End time is before start", "Please choose a later time.");
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
      Alert.alert("Success", "Event created successfully!");
      navigation.goBack();
    },
    onError: (err: any) => {
      console.error(err);
      Alert.alert("Error", err?.message || "Something went wrong");
    },
  });

  // ---- Submit ----
  const onSubmit = () => {
    if (!form.title?.trim())
      return Alert.alert("Missing", "Please enter event name.");
    if (!eventDate)
      return Alert.alert("Missing", "Please pick an event date.");
    if (!startAt || !endAt)
      return Alert.alert("Missing", "Please pick start & end times.");
    if (startAt >= endAt)
      return Alert.alert("Invalid time", "End time must be after start.");

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
      start_datetime: startAt.toISOString(),
      end_datetime: endAt.toISOString(),
      event_date: eventDate.toISOString(),
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 50 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Upload */}
        <Card>
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
                  <UploadSimpleIcon size={24} color={appTheme.colors.primary} />
                </View>
                <Text variant="body1" color={appTheme.colors.textLight}>
                  Upload your event banner here
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Card>

        {/* Form Inputs */}
        <InputField
          label="Event Name"
          labelColor={appTheme.colors.text}
          placeholder="Enter event name"
          value={form.title}
          onChangeText={(t) => set("title", t)}
          containerStyle={styles.fieldGap}
        />

        <BottomSheetSelect
          label="Event Type"
          labelColor={appTheme.colors.text}
          value={form.event_type}
          onChange={(v) => set("event_type", v)}
          options={[
            { label: "Online", value: "online" },
            { label: "In Person", value: "in_person" },
          ]}
          placeholder="Select Event Type"
          sheetTitle="Select Event Type"
          containerStyle={styles.fieldGap}
        />

        <BottomSheetSelect
          label="Country"
          labelColor={appTheme.colors.text}
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
            label="City / State"
            labelColor={appTheme.colors.text}
            value={form.city}
            onChange={(v) => set("city", v)}
            options={cities.map((s) => ({ label: s, value: s }))}
            placeholder="Select City"
            sheetTitle="Select City"
            containerStyle={styles.fieldGap}
          />
        ) : null}

        <InputField
          label="Address"
          labelColor={appTheme.colors.text}
          placeholder="Event address"
          value={form.address}
          onChangeText={(t) => set("address", t)}
          containerStyle={styles.fieldGap}
        />

        {/* Date & Time Pickers */}
        <View style={styles.fieldGap}>
          <PickerField
            label="Event Date"
            labelColor={appTheme.colors.text}
            placeholder="Event date"
            value={form.event_date}
            icon={
              <CalendarIcon size={18} color={appTheme.colors.placeholder} />
            }
            onPress={onSelectDate}
          />
        </View>

        <View style={[styles.row, styles.fieldGap]}>
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
            />
          </View>
        </View>

        <InputField
          label="Price (optional)"
          labelColor={appTheme.colors.text}
          placeholder="$0.00"
          value={form.price}
          keyboardType="numeric"
          onChangeText={(t) => set("price", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Total spots"
          labelColor={appTheme.colors.text}
          placeholder="e.g 100"
          value={form.total_spots}
          onChangeText={(t) => set("total_spots", t)}
          containerStyle={styles.fieldGap}
          keyboardType="numeric"
        />

        <InputField
          label="Event Link (optional)"
          labelColor={appTheme.colors.text}
          placeholder="http://..."
          value={form.ticket_link}
          onChangeText={(t) => set("ticket_link", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          label="Description"
          labelColor={appTheme.colors.text}
          placeholder="Describe your event.."
          value={form.description}
          onChangeText={(t) => set("description", t)}
          numberOfLines={4}
          style={{ textAlignVertical: "top" }}
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* Submit Button (sticky gradient like screenshot) */}
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
            // disabled={mutation.isLoading}
          >
            <LinearGradient
              colors={["#1BAD7A", "#008F5C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              {
                // @ts-ignore
                mutation.isLoading ? (
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
  },
  uploadInner: { alignItems: "center", justifyContent: "center", gap: 8 },
  bannerImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
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
