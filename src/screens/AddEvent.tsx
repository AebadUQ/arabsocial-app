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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
} from "phosphor-react-native";

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
  const navigation = useNavigation();
  const { theme } = useTheme();
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
      set("end_datetime", fmtTime(base));
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
    if (!form.title?.trim()) return Alert.alert("Missing", "Please enter event name.");
    if (!eventDate) return Alert.alert("Missing", "Please pick an event date.");
    if (!startAt || !endAt) return Alert.alert("Missing", "Please pick start & end times.");
    if (startAt >= endAt) return Alert.alert("Invalid time", "End time must be after start.");

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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={"white"} />
        </TouchableOpacity>
        <Text variant="body1" color={theme.colors.text} style={{ fontWeight: "600" }}>
          Promote Event
        </Text>
        <View style={[styles.navBtn, { opacity: 0 }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (insets.bottom || 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Upload */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.uploadBox,
            { borderColor: theme.colors.borderColor, backgroundColor: "transparent" },
          ]}
          onPress={onPickBanner}
        >
          {form.bannerUri ? (
            <>
              <Image source={{ uri: form.bannerUri }} style={styles.bannerImg} />
              <View style={styles.changeHintWrap}>
                <Text style={styles.changeHintText}>Tap to change</Text>
              </View>
            </>
          ) : (
            <View style={styles.uploadInner}>
              <ImageSquareIcon size={80} color={theme.colors.textLight} />
              <Text variant="body1" color={theme.colors.textLight}>
                Upload your event banner here
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Inputs */}
        <InputField
          placeholder="Event name"
          value={form.title}
          onChangeText={(t) => set("title", t)}
          containerStyle={styles.fieldGap}
        />

        <BottomSheetSelect
          label="Event Type"
          labelColor={theme.colors.textLight}
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
          labelColor={theme.colors.textLight}
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
            labelColor={theme.colors.textLight}
            value={form.city}
            onChange={(v) => set("city", v)}
            options={cities.map((s) => ({ label: s, value: s }))}
            placeholder="Select City"
            sheetTitle="Select City"
            containerStyle={styles.fieldGap}
          />
        ) : null}

        {/* Date & Time Pickers */}
        <View style={styles.fieldGap}>
          <PickerField
            placeholder="Event date"
            value={form.event_date}
            icon={<CalendarIcon size={18} color={theme.colors.placeholder} />}
            onPress={onSelectDate}
          />
        </View>

        <View style={[styles.row, styles.fieldGap]}>
          <View style={styles.col}>
            <PickerField
              placeholder="Start Time"
              value={form.start_datetime}
              icon={<ClockIcon size={18} color={theme.colors.placeholder} />}
              onPress={onSelectStart}
            />
          </View>
          <View style={styles.col}>
            <PickerField
              placeholder="End Time"
              value={form.end_datetime}
              icon={<ClockIcon size={18} color={theme.colors.placeholder} />}
              onPress={onSelectEnd}
            />
          </View>
        </View>

        {/* Other Fields */}
        <InputField
          placeholder="Event address"
          value={form.address}
          onChangeText={(t) => set("address", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Price (optional)"
          value={form.price}
          keyboardType="numeric"
          onChangeText={(t) => set("price", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Total spots"
          value={form.total_spots}
          onChangeText={(t) => set("total_spots", t)}
          containerStyle={styles.fieldGap}
          keyboardType="numeric"
        />

        <InputField
          placeholder="Event Link (optional)"
          value={form.ticket_link}
          onChangeText={(t) => set("ticket_link", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Description"
          value={form.description}
          onChangeText={(t) => set("description", t)}
          multiline
          numberOfLines={4}
          style={{ textAlignVertical: "top" }}
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
        {
        //@ts-ignore
        mutation.isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Submit</Text>
        )}
      </TouchableOpacity>

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
  fieldGap: { marginTop: 16 },
  uploadBox: {
    height: 180,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
