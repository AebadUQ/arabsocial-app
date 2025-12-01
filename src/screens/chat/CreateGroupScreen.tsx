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
import Card from "@/components/Card";
import BottomSheetSelect from "@/components/BottomSheetSelect";
import Switch from "@/components/Switch";

import { ArrowLeftIcon } from "phosphor-react-native";
import { Country, State } from "country-state-city";
import { launchImageLibrary, Asset } from "react-native-image-picker";

import { uploadGroupImage, createGroup } from "@/api/group"; // ★ USE THIS

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

  // PRIVACY
  const [isPublic, setIsPublic] = useState(true);

  // RESTRICTIONS
  const [restrictCountry, setRestrictCountry] = useState(false);
  const [restrictState, setRestrictState] = useState(false);
  const [restrictNationality, setRestrictNationality] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // PICK IMAGE + UPLOAD
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

      // UPLOAD GROUP IMAGE
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

      // @ts-ignore
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

      console.log("CREATE GROUP PAYLOAD:", payload);

      const res = await createGroup(payload);

      console.log("GROUP CREATED:", res);

      navigation.goBack();
    } catch (err) {
      console.log("CREATE GROUP ERROR:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Back Arrow */}
      <View style={styles.overlayRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* IMAGE */}
        <Card>
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity activeOpacity={0.8} onPress={pickImage}>
              <View style={[styles.avatarBorder, { borderColor: theme.colors.primaryLight }]}>
                <Image
                  source={{ uri: image || "https://i.pravatar.cc/200?img=65" }}
                  style={styles.avatar}
                />

                {uploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.avatarOverlayText}>Uploading...</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <InputField
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            inputStyle={{ backgroundColor: "#fff" }}
          />

          <InputField
            label="Description"
            placeholder="Tell what your group is about"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            inputStyle={{ backgroundColor: "#fff" }}
          />
        </Card>

        {/* COUNTRY / STATE */}
        <Card>
          <BottomSheetSelect
            label="Country"
            value={country}
            options={countries}
            onChange={setCountry}
            placeholder="Select Country"
            fieldStyle={{ backgroundColor: "#fff" }}
          />

          {country ? (
            <BottomSheetSelect
              label="State / Region"
              value={state}
              options={states}
              onChange={setState}
              placeholder="Select State"
              fieldStyle={{ backgroundColor: "#fff" }}
            />
          ) : null}

          <InputField
            label="Nationality"
            value={nationality}
            onChangeText={setNationality}
            inputStyle={{ backgroundColor: "#fff" }}
          />
        </Card>

        {/* PRIVACY */}
        <Card style={styles.cardSoft}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <View
            style={[
              styles.optionBlock,
              { backgroundColor: isPublic ? "#E3F6EE" : "#F4F4F4" },
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
              { backgroundColor: !isPublic ? "#E3F6EE" : "#F4F4F4" },
            ]}
          >
            <View>
              <Text style={styles.optionTitle}>Private Group</Text>
              <Text style={styles.optionSub}>Members need approval to join</Text>
            </View>

            <Switch value={!isPublic} onToggle={(v) => setIsPublic(!v)} />
          </View>
        </Card>

        {/* RESTRICTIONS */}
        <Card style={styles.cardSoft}>
          <Text style={styles.sectionTitle}>Restrictions</Text>

          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>Restrict Country</Text>
            <Switch value={restrictCountry} onToggle={setRestrictCountry} />
          </View>

          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>Restrict State</Text>
            <Switch value={restrictState} onToggle={setRestrictState} />
          </View>

          <View style={styles.optionBlock}>
            <Text style={styles.optionTitle}>Restrict Nationality</Text>
            <Switch value={restrictNationality} onToggle={setRestrictNationality} />
          </View>
        </Card>
      </ScrollView>

      {/* BUTTON */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={loadingSubmit}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            style={styles.ctaBtn}
          >
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

  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 999,
  },

  avatar: { width: 100, height: 100, borderRadius: 60 },

  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  avatarOverlayText: { color: "#fff", marginTop: 4, fontSize: 12 },

  cardSoft: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#F2F8F6",
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },

  optionBlock: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
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
