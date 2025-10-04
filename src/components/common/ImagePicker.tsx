import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
  PermissionsAndroid,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import {
  // launchCamera,              // ❌ camera disabled for now
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
  CameraOptions,
} from "react-native-image-picker";
// Icons (phosphor)
import { ImageSquareIcon /*, CameraIcon*/, XCircleIcon, TrashSimpleIcon } from "phosphor-react-native";

type Shape = "rounded" | "circle" | "square";

export type ImagePickerFieldHandle = {
  open: () => void;
  clear: () => void;
  getAsset: () => Asset | null;
};

export type ImagePickerFieldProps = {
  value?: string | Asset | null;
  onChange: (asset: Asset | null) => void;

  size?: number;
  shape?: Shape;
  showRemove?: boolean;
  label?: string;
  errorText?: string;

  style?: ViewStyle;
  labelStyle?: TextStyle;
  imageStyle?: ImageStyle;
  errorTextStyle?: TextStyle;

  trigger?: React.ReactNode;

  pickOptions?: ImageLibraryOptions;
  cameraOptions?: CameraOptions; // kept for future
};

const defaultPickOptions: ImageLibraryOptions = {
  mediaType: "photo",
  selectionLimit: 1,
  //@ts-ignore
  quality: 0.85,
};

const defaultCameraOptions: CameraOptions = {
  mediaType: "photo",
  saveToPhotos: false,
  //@ts-ignore

  quality: 0.85,
};

async function requestAndroidPermissions(/* forCamera: boolean */) {
  if (Platform.OS !== "android") return true;

  const perms: string[] = [];
  // if (forCamera) perms.push(PermissionsAndroid.PERMISSIONS.CAMERA); // ❌ disabled

  const sdk = Number(Platform.Version);
  if (sdk >= 33) {
    perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
  } else {
    perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
  }
//@ts-ignore
  const results = await PermissionsAndroid.requestMultiple(perms);
  return Object.values(results).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
}

const ImagePickerField = forwardRef<ImagePickerFieldHandle, ImagePickerFieldProps>(
  (
    {
      value = null,
      onChange,
      size = 96,
      shape = "rounded",
      showRemove = true,
      label,
      errorText,
      style,
      labelStyle,
      imageStyle,
      errorTextStyle,
      trigger,
      pickOptions = defaultPickOptions,
      cameraOptions = defaultCameraOptions, // keep param for later
    },
    ref
  ) => {
    const uri = useMemo(() => {
      if (!value) return null;
      if (typeof value === "string") return value;
      return value.uri || null;
    }, [value]);

    // const fromCamera = async () => { /* ❌ disabled for now */
    //   const ok = await requestAndroidPermissions(true);
    //   if (!ok) return;
    //   const res = await launchCamera(cameraOptions);
    //   const asset = res.assets?.[0];
    //   if (asset?.uri) onChange(asset);
    // };

    const fromGallery = async () => {
      const ok = await requestAndroidPermissions(/* false */);
      if (!ok) return;
      const res = await launchImageLibrary(pickOptions);
      const asset = res.assets?.[0];
      if (asset?.uri) onChange(asset);
    };

    const openChooser = () => {
      // iOS/Android: directly open gallery (no camera option shown)
      fromGallery();

      // If you later want the chooser back:
      // if (Platform.OS === "ios") {
      //   ActionSheetIOS.showActionSheetWithOptions(
      //     { options: ["Photo Library", "Cancel"], cancelButtonIndex: 1 },
      //     async (index) => { if (index === 0) await fromGallery(); }
      //   );
      // } else {
      //   Alert.alert("Add Photo", "Choose a source", [
      //     { text: "Gallery", onPress: fromGallery },
      //     { text: "Cancel", style: "cancel" },
      //   ]);
      // }
    };

    const remove = () => onChange(null);

    useImperativeHandle(ref, () => ({
      open: openChooser,
      clear: remove,
      getAsset: () => (typeof value === "string" || !value ? null : value),
    }));

    const borderRadius =
      shape === "circle" ? size / 2 : shape === "rounded" ? 12 : 4;

    return (
      <View style={style}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <View style={[styles.row, { height: size }]}>
          {/* Preview */}
          <View style={[styles.previewBox, { width: size, height: size, borderRadius }]}>
            {uri ? (
              <>
                <Image
                  source={{ uri }}
                  style={[styles.image, { borderRadius }, imageStyle]}
                  resizeMode="cover"
                />
                {showRemove && (
                  <TouchableOpacity style={styles.removeBadge} onPress={remove}>
                    <XCircleIcon size={18} weight="fill" color="#111" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.placeholder}>
                <ImageSquareIcon size={22} color="#9AA0A6" />
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {trigger ? (
              <TouchableOpacity onPress={openChooser}>{trigger}</TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.btn} onPress={fromGallery}>
                  <ImageSquareIcon size={18} color="#fff" />
                  <Text style={styles.btnText}>Gallery</Text>
                </TouchableOpacity>

                {/* Camera button hidden for now */}
                {/*
                <TouchableOpacity style={styles.btn} onPress={fromCamera}>
                  <CameraIcon size={18} color="#fff" />
                  <Text style={styles.btnText}>Camera</Text>
                </TouchableOpacity>
                */}

                {uri && (
                  <TouchableOpacity style={[styles.btn, styles.danger]} onPress={remove}>
                    <TrashSimpleIcon size={18} color="#fff" />
                    <Text style={styles.btnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {errorText ? <Text style={[ errorTextStyle]}>{errorText}</Text> : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { marginBottom: 6, fontWeight: "600" },
  previewBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  placeholderText: { fontSize: 12, color: "#9AA0A6" },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },
  actions: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  danger: { backgroundColor: "#DC2626" },
  btnText: { color: "white", fontWeight: "600" },
});

export default ImagePickerField;
