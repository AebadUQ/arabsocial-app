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

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  // PICK IMAGE (Event style)
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
      const sList = State.getStatesOfCountry(cObj?.isoCode || "").map((s) => s.name);
      setStates(sList);

      //@ts-ignore
      setNationality(cObj?.demonym || `${country} Citizen`);
    }
  }, [country]);

  // SUBMIT
  const onSubmit = async () => {
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
      navigation.goBack();

    } catch (err) {
      console.log("CREATE GROUP ERROR:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Back Button */}
      <View style={styles.overlayRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 130 }}
        showsVerticalScrollIndicator={false}
      >

        {/* IMAGE UPLOAD */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity activeOpacity={0.9} style={styles.uploadBox} onPress={pickImage}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.bannerImg} />

                {uploading && (
                  <View style={styles.bannerOverlay}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.bannerOverlayText}>Uploading...</Text>
                  </View>
                )}

                <View style={styles.changeHintWrap}>
                  <Text style={styles.changeHintText}>Tap to change</Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadInner}>
                <View style={{ backgroundColor: theme.colors.primaryShade, padding: 10, borderRadius: 20 }}>
                  <UploadSimpleIcon size={24} color={theme.colors.primary} />
                </View>
                <Text variant="body1" color={theme.colors.textLight}>
                  Upload group cover image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* GROUP INFO */}
        <View style={styles.sectionWrap}>
          <InputField
            label="Group Name"
            labelColor={theme.colors.textLight}
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            inputStyle={{ backgroundColor: "#fff" }}
          />

          <View style={styles.fieldGap} />

          <InputField
            label="Description"
            labelColor={theme.colors.textLight}
            placeholder="Tell what your group is about"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            inputStyle={{ backgroundColor: "#fff" }}
          />
        </View>

        {/* COUNTRY / STATE */}
        <View style={styles.sectionWrap}>
          <BottomSheetSelect
            label="Country"
            labelColor={theme.colors.textLight}
            value={country}
            options={countries}
            onChange={setCountry}
            placeholder="Select Country"
            fieldStyle={{ backgroundColor: "#fff" }}
          />

          {country ? (
            <>
              <View style={styles.fieldGap} />
              <BottomSheetSelect
                label="State / Region"
                labelColor={theme.colors.textLight}
                value={state}
                options={states}
                onChange={setState}
                placeholder="Select State"
                fieldStyle={{ backgroundColor: "#fff" }}
              />
            </>
          ) : null}

          <View style={styles.fieldGap} />

          <InputField
            label="Nationality"
            labelColor={theme.colors.textLight}
            value={nationality}
            onChangeText={setNationality}
            inputStyle={{ backgroundColor: "#fff" }}
          />
        </View>

        {/* PRIVACY */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <View style={[styles.optionBlock, { backgroundColor: isPublic ? "#E3F6EE" : "white" }]}>
            <View>
              <Text style={styles.optionTitle}>Public Group</Text>
              <Text style={styles.optionSub}>Anyone can find and join</Text>
            </View>
            <Switch value={isPublic} onToggle={setIsPublic} />
          </View>

          <View style={[styles.optionBlock, { backgroundColor: !isPublic ? "#E3F6EE" : "white" }]}>
            <View>
              <Text style={styles.optionTitle}>Private Group</Text>
              <Text style={styles.optionSub}>Members need approval to join</Text>
            </View>
            <Switch value={!isPublic} onToggle={(v) => setIsPublic(!v)} />
          </View>
        </View>

        {/* RESTRICTIONS */}
        <View style={styles.sectionWrap}>
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
        </View>
      </ScrollView>

      {/* BUTTON */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={loadingSubmit}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primary]} style={styles.ctaBtn}>
            {loadingSubmit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Create Group</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

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

  /* IMAGE UPLOAD */
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

  uploadInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

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

  changeHintText: {
    color: "#fff",
    fontSize: 12,
  },

  /* SPACING SYSTEM */
  sectionWrap: {
    marginBottom: 28,
  },

  fieldGap: {
    height: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    color: "#333",
  },

  optionBlock: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "#F4F4F4",
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

  optionTitle: { fontSize: 15, fontWeight: "600", color: "#333" },

  optionSub: { fontSize: 12, color: "#777", marginTop: 2 },

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
