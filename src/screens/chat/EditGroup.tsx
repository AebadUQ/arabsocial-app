import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import InputField from "@/components/Input";
import LinearGradient from "react-native-linear-gradient";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import Switch from "@/components/Switch";
import {
  ArrowLeft as ArrowLeftIcon,
  UploadSimple as UploadSimpleIcon,
} from "phosphor-react-native";
import { Country, State } from "country-state-city";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import { uploadGroupImage, getGroupDetail, updateGroup } from "@/api/group";
import { theme } from "@/theme/theme";

export default function EditGroupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const groupId = route?.params?.groupId;

  // ----------- FORM -----------
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [nationality, setNationality] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [restrictCountry, setRestrictCountry] = useState(false);
  const [restrictState, setRestrictState] = useState(false);
  const [restrictNationality, setRestrictNationality] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // ----------- ERRORS -----------
  const [errors, setErrors] = useState({
    groupName: "",
    description: "",
    country: "",
    state: "",
    nationality: "",
    image: "",
  });

  // ----------- COUNTRY / STATE HOOKS ----------
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countries, setCountries] = useState<string[]>([]);
  const [statesList, setStatesList] = useState<string[]>([]);

  useEffect(() => {
    setCountries(allCountries.map((c) => c.name));
  }, []);

  useEffect(() => {
    if (country) {
      const selected = allCountries.find((x) => x.name === country);
      const nextStates = State.getStatesOfCountry(selected?.isoCode || "").map(
        (s) => s.name
      );
      setStatesList(nextStates);

      if (state && !nextStates.includes(state)) {
        setState("");
      }

      // Auto nationality
      // @ts-ignore
      setNationality(selected?.demonym || `${country} Citizen`);
    } else {
      setStatesList([]);
      setState("");
    }
  }, [country]);

  // -------- FETCH GROUP DATA --------
  const fetchGroup = async () => {
    try {
      const res = await getGroupDetail(groupId);

      setGroupName(res.name);
      setDescription(res.description);
      setImage(res.image);
      setCountry(res.country ?? "");
      setState(res.state ?? "");
      setNationality(res.nationality ?? "");

      setIsPublic(res.isPublic);
      setRestrictCountry(res.restrictCountry);
      setRestrictState(res.restrictState);
      setRestrictNationality(res.restrictNationality);
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  // -------- IMAGE PICKER --------
  const pickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
      });

      if (res.didCancel) return;
      const asset = res.assets?.[0] as Asset;
      if (!asset?.uri) return;

      setUploading(true);
      const upload = await uploadGroupImage(asset);
      setImage(upload.url);
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      console.log("UPLOAD ERROR", err);
    } finally {
      setUploading(false);
    }
  };

  // ---------- VALIDATION ----------
  const validate = () => {
    let newErrors: any = {};

    if (!groupName.trim()) newErrors.groupName = "Group name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!nationality.trim()) newErrors.nationality = "Nationality is required";
    if (!image.trim()) newErrors.image = "Image is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------- SUBMIT ----------
  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setLoadingSubmit(true);

      const payload = {
        name: groupName,
        description,
        image,
        isPublic,
        country,
        state,
        nationality,
        restrictCountry,
        restrictState,
        restrictNationality,
      };

      await updateGroup(groupId, payload);
      navigation.goBack();
    } catch (err) {
      console.log("UPDATE GROUP ERROR:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* BACK BUTTON */}
      <View style={styles.overlayRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 130 }}>
        
        {/* IMAGE UPLOAD */}
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.bannerImg} />
              {uploading && (
                <View style={styles.bannerOverlay}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.bannerOverlayText}>Uploading...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.uploadInner}>
              <UploadSimpleIcon size={24} color={theme.colors.primary} />
              <Text variant="body1" color={theme.colors.textLight}>
                Upload group image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {errors.image && <Text style={styles.error}>{errors.image}</Text>}

        {/* GROUP NAME */}
        <InputField
          label="Group Name"
          value={groupName}
          onChangeText={(t) => {
            setGroupName(t);
            if (errors.groupName) setErrors({ ...errors, groupName: "" });
          }}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.groupName && <Text style={styles.error}>{errors.groupName}</Text>}

        {/* DESCRIPTION */}
        <InputField
          label="Description"
          value={description}
          multiline
          onChangeText={(t) => {
            setDescription(t);
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          numberOfLines={4}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.description && <Text style={styles.error}>{errors.description}</Text>}

        {/* COUNTRY */}
        <BottomSheetSelect
          label="Country"
          value={country}
          options={countries}
          onChange={(v) => {
            setCountry(v);
            if (errors.country) setErrors({ ...errors, country: "" });
          }}
          placeholder="Select Country"
          fieldStyle={{ backgroundColor: "#fff" }}
        />
        {errors.country && <Text style={styles.error}>{errors.country}</Text>}

        {/* STATE */}
        {country ? (
          <>
            <BottomSheetSelect
              label="State"
              value={state}
              options={statesList}
              onChange={(v) => {
                setState(v);
                if (errors.state) setErrors({ ...errors, state: "" });
              }}
              placeholder="Select State"
              fieldStyle={{ backgroundColor: "#fff" }}
            />
            {errors.state && <Text style={styles.error}>{errors.state}</Text>}
          </>
        ) : null}

        {/* NATIONALITY */}
        <InputField
          label="Nationality"
          value={nationality}
          onChangeText={(t) => {
            setNationality(t);
            if (errors.nationality) setErrors({ ...errors, nationality: "" });
          }}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.nationality && <Text style={styles.error}>{errors.nationality}</Text>}

        {/* PRIVACY */}
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <View style={[styles.optionBlock, { backgroundColor: isPublic ? "#E3F6EE" : "#fff" }]}>
          <Text style={styles.optionTitle}>Public Group</Text>
          <Switch value={isPublic} onToggle={setIsPublic} />
        </View>

        <View style={[styles.optionBlock, { backgroundColor: !isPublic ? "#E3F6EE" : "#fff" }]}>
          <Text style={styles.optionTitle}>Private Group</Text>
          <Switch value={!isPublic} onToggle={() => setIsPublic(!isPublic)} />
        </View>

        {/* RESTRICTIONS */}
        <Text style={styles.sectionTitle}>Restrictions</Text>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict Country</Text>
          <Switch value={restrictCountry} onToggle={setRestrictCountry} />
        </View>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict State</Text>
          <Switch value={restrictState} onToggle={setRestrictState} />
        </View>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict Nationality</Text>
          <Switch value={restrictNationality} onToggle={setRestrictNationality} />
        </View>
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity onPress={onSubmit} disabled={loadingSubmit}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primary]} style={styles.ctaBtn}>
            {loadingSubmit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Update Group</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlayRow: { padding: 10 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBox: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryShade,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadInner: { alignItems: "center", gap: 6 },
  bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerOverlayText: { color: "#fff", marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  optionBlock: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionBlockTwo: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTitle: { fontSize: 15, fontWeight: "600" },
  error: {
    color: "red",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  ctaBtn: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});
