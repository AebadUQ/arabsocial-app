import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PostCard, { Post } from "@/components/home/PostCard";
import { POSTS } from "@/data/home";
import TopBar from "@/components/common/TopBar";
import CompleteProfileModal from "@/components/modal/CompleteProfile";
// Icons (Phosphor)
import {  ImageSquareIcon, PaperPlaneRightIcon } from "phosphor-react-native";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Post[]>(POSTS.slice(0, PAGE_SIZE));
  const [newPost, setNewPost] = useState("");

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
    if (!text) return;
    const newEntry: Post = {
      id: Date.now().toString(),
      content: text,
      name: "You",
      location: "Unknown",
      likes: 0,
      commentsCount: 0,
      comments: [],
    };
    setData([newEntry, ...data]);
    setNewPost("");
  };

  const onPickImage = () => {
    // hook your image picker here
    console.log("pick image tapped");
  };

  const canSend = newPost.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar />

      <CompleteProfileModal
        visible={open}
        onClose={() => setOpen(false)}
        onProceed={() => {
          setOpen(false);
          console.log("Proceed clicked!");
        }}
        title="Complete Your Profile"
      />

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

        {/* Top-right image icon */}
        <TouchableOpacity
          onPress={onPickImage}
          style={styles.imageIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ImageSquareIcon size={22} weight="regular" color="#9AA0A6" />
        </TouchableOpacity>

        {/* Bottom-right send icon (only when there’s text) */}
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
    marginTop: 8,
    borderRadius: 10,
    // subtle border like your mock
    borderWidth: 1,
    borderColor: "#EEE",
  },
  input: {
    flex: 1,
    minHeight: 96,
    paddingRight: 56, // space for right-side icons
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
});

export default HomeScreen;
