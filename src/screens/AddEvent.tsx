import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Text } from "@/components";
import InputField from "@/components/Input";
import { useTheme } from "@/theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";

// Icons (phosphor-react-native)
import {
  CalendarBlank as CalendarIcon,
  Clock as ClockIcon,
  LinkSimple as LinkIcon,
  CurrencyDollar as DollarIcon,
  CaretDown as CaretDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ImageSquare as ImageSquareIcon,
} from "phosphor-react-native";

type FormState = {
  name: string;
  type: string;
  date: string;        // e.g., "Sat, 04 Oct 2025"
  startTime: string;   // e.g., "06:30 PM"
  endTime: string;     // e.g., "09:30 PM"
  address: string;
  state: string;
  city: string;
  spots: string;
  link: string;
  price: string;
  description: string;
  bannerUri: string; // chosen image (if any)
};

type PickerTarget = "date" | "start" | "end";

const PickerField: React.FC<{
  placeholder: string;
  value?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}> = ({ placeholder, value, icon, onPress, disabled }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={styles.pickerField}
    >
      <Text style={{ opacity: value ? 1 : 0.5 }}>
        {value || placeholder}
      </Text>
      <View style={{ marginLeft: 12 }}>{icon}</View>
    </TouchableOpacity>
  );
};

export default function PromoteEventScreen() {
      const navigation = useNavigation();
    
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Actual Date objects (for API)
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    address: "",
    state: "",
    city: "",
    spots: "",
    link: "",
    price: "",
    description: "",
    bannerUri: "",
  });

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Formatting helpers
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

  // Image picker
  const onPickBanner = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        // @ts-ignore
        quality: 0.85,
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

  const onSelectType = () => console.log("Select event type");

  // ===== Modal DateTime Picker (react-native-modal-datetime-picker) =====
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("date");
  const [tempValue, setTempValue] = useState<Date>(new Date());

  const openPicker = (target: PickerTarget, mode: "date" | "time") => {
    setPickerTarget(target);
    setPickerMode(mode);

    // Pre-fill
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
      set("date", fmtDate(d));
      // Seed sensible defaults if times not set
      if (!startAt) {
        const s = new Date(d);
        s.setHours(18, 0, 0, 0);
        setStartAt(s);
        set("startTime", fmtTime(s));
      }
      if (!endAt) {
        const e = new Date(d);
        e.setHours(21, 0, 0, 0);
        setEndAt(e);
        set("endTime", fmtTime(e));
      }
    }

    if (pickerTarget === "start") {
      const base = new Date(eventDate ?? new Date());
      base.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setStartAt(base);
      set("startTime", fmtTime(base));
      if (endAt && endAt < base) {
        const e = new Date(base);
        e.setHours(base.getHours() + 1);
        setEndAt(e);
        set("endTime", fmtTime(e));
      }
    }

    if (pickerTarget === "end") {
      const base = new Date(eventDate ?? new Date());
      base.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setEndAt(base);
      set("endTime", fmtTime(base));
      if (startAt && base < startAt) {
        Alert.alert("End time is before start", "Please choose a later time.");
      }
    }

    setPickerVisible(false);
  };

  const onCancel = () => setPickerVisible(false);

  // Triggers
  const onSelectDate = () => openPicker("date", "date");
  const onSelectStart = () => openPicker("start", "time");
  const onSelectEnd = () => openPicker("end", "time");

  // Submit
  const onSubmit = () => {
    if (!form.name?.trim()) return Alert.alert("Missing", "Please enter event name.");
    if (!eventDate) return Alert.alert("Missing", "Please pick an event date.");
    if (!startAt || !endAt) return Alert.alert("Missing", "Please pick start & end times.");
    if (startAt >= endAt) return Alert.alert("Invalid time", "End time must be after start.");

    console.log("Submitting form:", {
      ...form,
      eventDateISO: eventDate?.toISOString(),
      startISO: startAt?.toISOString(),
      endISO: endAt?.toISOString(),
    });
    //@ts-ignore
              navigation.navigate("Events")

  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => console.log("Back")}>
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
        {/* Upload box */}
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

        {/* Fields */}
        <InputField
          placeholder="Event name"
          value={form.name}
          onChangeText={(t) => set("name", t)}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Event type"
          value={form.type}
          onChangeText={(t) => set("type", t)}
          right={<CaretDownIcon size={18} color={theme.colors.placeholder} />}
          onPressRight={onSelectType as any}
          containerStyle={styles.fieldGap}
        />

        {/* Date / Time: use pressable picker fields */}
        <View style={styles.fieldGap}>
          <PickerField
            placeholder="Event date"
            value={form.date}
            icon={<CalendarIcon size={18} color={theme.colors.placeholder} />}
            onPress={onSelectDate}
          />
        </View>

        <View style={[styles.row, styles.fieldGap]}>
          <View style={styles.col}>
            <PickerField
              placeholder="Start Time"
              value={form.startTime}
              icon={<ClockIcon size={18} color={theme.colors.placeholder} />}
              onPress={onSelectStart}
            />
          </View>
          <View style={styles.col}>
            <PickerField
              placeholder="End Time"
              value={form.endTime}
              icon={<ClockIcon size={18} color={theme.colors.placeholder} />}
              onPress={onSelectEnd}
            />
          </View>
        </View>

        <InputField
          placeholder="Address"
          value={form.address}
          onChangeText={(t) => set("address", t)}
          containerStyle={styles.fieldGap}
        />

        {/* State / City */}
        <View style={[styles.row, styles.fieldGap]}>
          <View style={styles.col}>
            <InputField
              placeholder="State"
              value={form.state}
              onChangeText={(t) => set("state", t)}
            />
          </View>
          <View style={styles.col}>
            <InputField
              placeholder="City"
              value={form.city}
              onChangeText={(t) => set("city", t)}
            />
          </View>
        </View>

        <InputField
          placeholder="Total spots (optional)"
          value={form.spots}
          onChangeText={(t) => set("spots", t.replace(/[^0-9]/g, ""))}
          keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Ticket link (optional)"
          value={form.link}
          onChangeText={(t) => set("link", t)}
          right={<LinkIcon size={18} color={theme.colors.placeholder} />}
          containerStyle={styles.fieldGap}
          autoCapitalize="none"
        />

        <InputField
          placeholder="Ticket price (optional)"
          value={form.price}
          onChangeText={(t) => set("price", t.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
          right={<DollarIcon size={18} color={theme.colors.placeholder} />}
          containerStyle={styles.fieldGap}
        />

        <InputField
          placeholder="Description"
          value={form.description}
          onChangeText={(t) => set("description", t)}
          multiline
          textAlignVertical="top"
          inputStyle={{ height: 120, paddingTop: 12 }}
          containerStyle={styles.fieldGap}
        />
      </ScrollView>

      {/* Sticky Submit */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitText}>Submit Event</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Modal DateTime Picker ===== */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={pickerMode}
        date={tempValue}
        // Optional: restrict past dates for Event Date
        minimumDate={pickerMode === "date" ? new Date() : undefined}
        onConfirm={onConfirm}
        onCancel={onCancel}
        // Nice iOS/Android consistent UX:
        //@ts-ignore
        headerTextIOS={pickerMode === "date" ? "Select Date" : "Select Time"}
        confirmTextIOS="Done"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#191D214D",
    borderRadius: 20,
  },

  content: { paddingHorizontal: 16, paddingTop: 8 },

  uploadBox: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
  },
  uploadInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },

  changeHintWrap: {
    position: "absolute",
    right: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  changeHintText: { color: "#fff", fontSize: 12 },

  fieldGap: { marginBottom: 14 },

  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  submitBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  pickerField: {
    height: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d9d9d9",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
