// app/components/home/PostComposerSheet.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Asset } from "react-native-image-picker";
import { useTheme } from "@/theme/ThemeContext";
import { XCircle, SmileyIcon, ImageSquareIcon } from "phosphor-react-native";
import LinearGradient from "react-native-linear-gradient";
import { theme } from "@/theme/theme";

export type ComposerSheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  newPost: string;
  onChangeText: (text: string) => void;
  pickedImage: Asset | null;
  onRemoveImage: () => void;
  onSend: () => void;
  posting: boolean;
  onPickImage: () => void;
  userName?: string;
  userLocation?: string;
  userAvatarUri?: string | null;
};

const PostComposerSheet = forwardRef<ComposerSheetHandle, Props>(
  (
    {
      newPost,
      onChangeText,
      pickedImage,
      onRemoveImage,
      onSend,
      posting,
      onPickImage,
      userName = "You",
      userLocation = "",
      userAvatarUri,
    },
    ref
  ) => {
    const { theme: ctxTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<TextInput | null>(null);

    // keyboard pe typing ho rahi ho to sheet pan block karein
    const [isComposing, setIsComposing] = useState(false);

    // ✅ same style as CommentsSheet, but default 80%
    const snapPoints = useMemo(() => ["40%", "80%"], []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetModalRef.current?.present(),
      close: () => bottomSheetModalRef.current?.dismiss(),
    }));

    const handleSend = () => {
      if (posting) return;
      onSend();
    };

    const hasContent = newPost.trim().length > 0 || !!pickedImage?.uri;

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    const initials = userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        // 👉 index 1 = 80% initial height
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableOverDrag={false}
        enableContentPanningGesture={!isComposing}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        topInset={insets.top + 20}
        handleIndicatorStyle={{ backgroundColor: "#CCC" }}
        backgroundStyle={{
          backgroundColor: ctxTheme.colors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <BottomSheetView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: ctxTheme.colors.text }]}>
              Create Post
            </Text>

            {/* Gradient Post button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSend}
              disabled={!hasContent || posting}
              style={{ marginLeft: 8 }}
            >
              <LinearGradient
                colors={
                  hasContent ? ["#1BAD7A", "#008F5C"] : ["#CFCFCF", "#B4B4B4"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.postBtnGradient,
                  (!hasContent || posting) && { opacity: 0.8 },
                ]}
              >
                <View style={styles.postBtnContent}>
                  {posting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.postBtnLabel}>Post</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Card container */}
          <View style={styles.card}>
            {/* User row */}
            <View style={styles.userRow}>
              {userAvatarUri ? (
                <Image source={{ uri: userAvatarUri }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: ctxTheme.colors.primaryLight },
                  ]}
                >
                  <Text style={styles.avatarText}>{initials || "U"}</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: ctxTheme.colors.text }]}>
                  {userName}
                </Text>
                {userLocation ? (
                  <Text
                    style={[
                      styles.userLocation,
                      { color: ctxTheme.colors.textLight },
                    ]}
                  >
                    {userLocation}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              style={[styles.mainInput, { color: ctxTheme.colors.text }]}
              placeholder="What’s on your mind?"
              placeholderTextColor={ctxTheme.colors.textLight}
              multiline
              value={newPost}
              onChangeText={onChangeText}
              onFocus={() => setIsComposing(true)}
              onBlur={() => setIsComposing(false)}
              textAlignVertical="top"
            />

            {/* Add emoji + add photo row */}
            <View style={styles.toolsRow}>
                <View                 style={styles.toolsLeft}
>

                </View>
              {/* <TouchableOpacity
                style={styles.toolsLeft}
                onPress={() => {
                  inputRef.current?.focus();
                  onChangeText((newPost || "") + " 😊");
                }}
              >
                <SmileyIcon size={20} color={ctxTheme.colors.textLight} />
                <Text
                  style={{
                    marginLeft: 6,
                    color: ctxTheme.colors.textLight,
                    fontSize: 13,
                  }}
                >
                  Add emoji
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[
                  styles.addImageBtn,
                  { backgroundColor: ctxTheme.colors.primaryLight },
                ]}
                onPress={onPickImage}
                disabled={posting}
              >
                <ImageSquareIcon size={18} color={ctxTheme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Image preview */}
            {pickedImage?.uri ? (
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: pickedImage.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeBadge}
                  onPress={onRemoveImage}
                  disabled={posting}
                >
                  <XCircle color="#fff" size={18} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Story card */}
            {/* <View style={styles.storyCard}>
              <View style={styles.storyIconCircle}>
                <SmileyIcon size={18} color={"white"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.storyTitle}>Share your story</Text>
                <Text style={styles.storyText}>
                  Tell us about your adventures, experiences, or anything
                  you&apos;d like to share with the community.
                </Text>
              </View>
            </View> */}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
  },
  postBtnGradient: {
    borderRadius: 999,
  },
  postBtnContent: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  postBtnLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 20,
    borderWidth: 0.25,
    borderColor: theme.colors.primary,
    backgroundColor: "#ffffff",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  userLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  mainInput: {
    minHeight: 70,
    fontSize: 14,
    marginBottom: 8,
  },
  toolsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  toolsLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addImageBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    marginTop: 6,
  },
  previewImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  removeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 14,
    padding: 4,
  },
  storyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 0.25,
    borderColor: theme.colors.primary,
    marginTop: 4,
  },
  storyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    marginRight: 10,
  },
  storyTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  storyText: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
});

export default PostComposerSheet;
