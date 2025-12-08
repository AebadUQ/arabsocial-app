import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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

import { uploadGroupImage, createGroup } from "@/api/group";
import { theme } from "@/theme/theme";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // FORM STATE
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [nationality, setNationality] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [restrictCountry, setRestrictCountry] = useState(false);
  const [restrictState, setRestrictState] = useState(false);
  const [restrictNationality, setRestrictNationality] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // VALIDATION ERRORS
  const [errors, setErrors] = useState({
    groupName: "",
    description: "",
    image: "",
    country: "",
    state: "",
    nationality: "",
  });

  // PICK IMAGE
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
      const uploaded = await uploadGroupImage(asset);
      setImage(uploaded.url);
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
    } finally {
      setUploading(false);
    }
  };

  // LOAD COUNTRIES
  useEffect(() => {
    const list = Country.getAllCountries().map((c) => c.name);
    setCountries(list);
  }, []);

  useEffect(() => {
    if (country) {
      const cObj = Country.getAllCountries().find((c) => c.name === country);
      const sList = State.getStatesOfCountry(cObj?.isoCode || "").map(
        (s) => s.name
      );
      setStates(sList);

      //@ts-ignore
      setNationality(cObj?.demonym || `${country} Citizen`);
      setErrors((prev) => ({ ...prev, country: "" }));
    }
  }, [country]);

  // VALIDATION FUNCTION
  const validate = () => {
    let newErrors: any = {};

    if (!image) newErrors.image = "Group image is required";
    if (!groupName.trim()) newErrors.groupName = "Group name is required";
    // if (!description.trim()) newErrors.description = "Description is required";
    // if (!country.trim()) newErrors.country = "Country is required";
    // if (!state.trim()) newErrors.state = "State is required";
    // if (!nationality.trim()) newErrors.nationality = "Nationality is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
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

      await createGroup(payload);

      queryClient.invalidateQueries({ queryKey: ["exploreGroups"] });

      navigation.goBack();
    } catch (err) {
      console.log("CREATE GROUP ERROR:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* BACK BUTTON */}
      <View style={styles.overlayRow}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 130,
        }}
        showsVerticalScrollIndicator={false}
      >
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
              <View
                style={{
                  backgroundColor: theme.colors.primaryShade,
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <UploadSimpleIcon size={24} color={theme.colors.primary} />
              </View>
              <Text variant="body1" color={theme.colors.textLight}>
                Upload group image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {errors.image && <Text style={styles.error}>{errors.image}</Text>}

        {/* GROUP NAME */}

        <View style={{display:'flex',gap:10}}>

        <InputField
          label="Group Name"
          labelColor={theme.colors.textLight}
          value={groupName}
          onChangeText={(t) => {
            setGroupName(t);
            if (errors.groupName) setErrors({ ...errors, groupName: "" });
          }}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.groupName && (
          <Text style={styles.error}>{errors.groupName}</Text>
        )}

        <InputField
          label="Description"
                    labelColor={theme.colors.textLight}

          value={description}
          multiline
          numberOfLines={4}
          onChangeText={(t) => {
            setDescription(t);
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.description && (
          <Text style={styles.error}>{errors.description}</Text>
        )}
{/* 
        <BottomSheetSelect
                  labelColor={theme.colors.textLight}

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

        {country ? (
          <>
            <BottomSheetSelect
                      labelColor={theme.colors.textLight}

              label="State / Region"
              value={state}
              options={states}
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

        <InputField
                  labelColor={theme.colors.textLight}

          label="Nationality"
          value={nationality}
          onChangeText={(t) => {
            setNationality(t);
            if (errors.nationality)
              setErrors({ ...errors, nationality: "" });
          }}
          inputStyle={{ backgroundColor: "#fff" }}
        />
        {errors.nationality && (
          <Text style={styles.error}>{errors.nationality}</Text>
        )} */}
        </View>

        {/* <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <View
          style={[
            styles.optionBlock,
            { backgroundColor: isPublic ? "#E3F6EE" : "white" },
          ]}
        >
          <View>
            <Text style={styles.optionTitle}>Public Group</Text>
            <Text style={styles.optionSub}>Anyone can find and join</Text>
          </View>
          <Switch value={isPublic} onToggle={setIsPublic} />
        </View>

        <View
          style={[
            styles.optionBlock,
            { backgroundColor: !isPublic ? "#E3F6EE" : "white" },
          ]}
        >
          <View>
            <Text style={styles.optionTitle}>Private Group</Text>
            <Text style={styles.optionSub}>Members need approval</Text>
          </View>
          <Switch value={!isPublic} onToggle={() => setIsPublic(!isPublic)} />
        </View> */}
{/* 
        <Text style={styles.sectionTitle}>Restrictions</Text>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict Country</Text>
          <Switch
            value={restrictCountry}
            onToggle={setRestrictCountry}
          />
        </View>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict State</Text>
          <Switch value={restrictState} onToggle={setRestrictState} />
        </View>

        <View style={styles.optionBlockTwo}>
          <Text style={styles.optionTitle}>Restrict Nationality</Text>
          <Switch
            value={restrictNationality}
            onToggle={setRestrictNationality}
          />
        </View> */}
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom - 40 }]}>
        <TouchableOpacity onPress={onSubmit} disabled={loadingSubmit}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            style={styles.ctaBtn}
          >
            {loadingSubmit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Request Group
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------------- STYLES -----------------

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    marginBottom:10
  },

  uploadInner: { alignItems: "center", gap: 8 },

  bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  bannerOverlayText: { color: "#fff", marginTop: 6 },

  sectionWrap: { marginBottom: 28 },
  fieldGap: { height: 16 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16,marginTop:20 },

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
    marginBottom: 14,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionTitle: { fontSize: 15, fontWeight: "600" },
  optionSub: { fontSize: 12, color: "#777", marginTop: 2 },

  error: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },

  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    paddingTop:10,
  },

  ctaBtn: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});
