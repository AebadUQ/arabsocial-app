import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PostCard, { Post } from "@/components/home/PostCard";
import { POSTS } from "@/data/home";
import TopBar from "@/components/common/TopBar";
import CompleteProfileModal from "@/components/modal/CompleteProfile";
// Icons (Phosphor)
import { ImageSquareIcon, PaperPlaneRightIcon } from "phosphor-react-native";

// Picker (gallery-only)
import ImagePickerField, {
  ImagePickerFieldHandle,
} from "@/components/common/ImagePicker";
import type { Asset } from "react-native-image-picker";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = ({navigation}:any) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Post[]>(POSTS.slice(0, PAGE_SIZE));
  const [newPost, setNewPost] = useState("");

  const [pickedImage, setPickedImage] = useState<Asset | null>(null);
  const pickerRef = useRef<ImagePickerFieldHandle>(null);

  const keyExtractor = useCallback((item: Post) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    []
  );

  const onEndReached = useCallback(() => {
    if (PAGE_SIZE * page < POSTS.length) {
      setPage((p) => p + 1);
      setData((prev) => [
        ...prev,
        ...POSTS.slice(PAGE_SIZE * page, PAGE_SIZE * (page + 1)),
      ]);
    }
  }, [page]);

  const handleAddPost = () => {
    const text = newPost.trim();
    if (!text && !pickedImage?.uri) return;

    // NOTE: tumhare sample data me `image:` prop use ho rahi hai (require(...)).
    // Local pick ke liye hum { uri } pass kar rahe hain:
    const newEntry: Post & { image?: any } = {
      id: Date.now().toString(),
      content: text || "",
      name: "You",
      location: "Unknown",
      likes: 0,
      commentsCount: 0,
      comments: [],
      image: pickedImage?.uri ? { uri: pickedImage.uri } : undefined,
    };

    setData([newEntry, ...data]);
    setNewPost("");
    setPickedImage(null);
  };

  const onPickImage = () => {
    // sirf gallery chooser
    pickerRef.current?.open();
  };

  const canSend = newPost.trim().length > 0 || !!pickedImage?.uri;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar   onMenuPress={() => navigation.openDrawer()} />

      {/* <CompleteProfileModal
        visible={open}
        onClose={() => setOpen(false)}
        onProceed={() => {
          setOpen(false);
          console.log("Proceed clicked!");
        }}
        title="Complete Your Profile"
      /> */}

      {/* Add Post Input Bar */}
      <View style={styles.inputWrap}>
        <TextInput
          placeholder="Ask for help or give suggestions"
          placeholderTextColor="#999"
          value={newPost}
          onChangeText={setNewPost}
          style={styles.input}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Tiny preview */}
        {pickedImage?.uri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: pickedImage.uri }} style={styles.preview} />
          </View>
        ) : null}

        {/* Top-right image icon → opens gallery picker */}
        <TouchableOpacity
          onPress={onPickImage}
          style={styles.imageIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ImageSquareIcon size={22} weight="regular" color="#9AA0A6" />
        </TouchableOpacity>

        {/* Bottom-right send icon (text OR image) */}
        {canSend && (
          <TouchableOpacity
            onPress={handleAddPost}
            style={styles.sendIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PaperPlaneRightIcon size={22} weight="fill" color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Hidden picker (gallery-only) */}
      <ImagePickerField
        ref={pickerRef}
        value={pickedImage}
        onChange={setPickedImage}
        size={0}
        style={{ height: 0, opacity: 0 }}
        showRemove={false}
      />

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        windowSize={7}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",

  },
  input: {
    flex: 1,
    minHeight: 32,
    paddingRight: 56,
    fontSize: 14,
  },
  imageIcon: {
    position: "absolute",
    top: 10,
    right: 12,
  },
  sendIcon: {
    position: "absolute",
    bottom: 10,
    right: 12,
  },
  previewWrap: {
    position: "absolute",
    left: 12,
    bottom: 10,
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#f2f2f2",
  },
  preview: { width: "100%", height: "100%" },
});

export default HomeScreen;
