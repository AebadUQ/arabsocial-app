// app/screens/HomeScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Text,
} from "react-native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/theme/ThemeContext";
import TopBar from "@/components/common/TopBar";
import PostCard, { ApiPost } from "@/components/home/PostCard";
import { getAllPost, getPostComments } from "@/api/post";
import { createPost } from "@/api/post"; // ✅ NEW: use your createPost
import ImagePickerField, {
  ImagePickerFieldHandle,
} from "@/components/common/ImagePicker";
import type { Asset } from "react-native-image-picker";
import { ImageSquareIcon, PaperPlaneRightIcon } from "phosphor-react-native";
import { useAuth } from "@/context/Authcontext";
import CommentsSheet, {
  CommentsSheetHandle,
} from "@/components/home/CommentSheet";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const pickerRef = useRef<ImagePickerFieldHandle>(null);
  const { user } = useAuth();

  // ---- CommentsSheet ref ----
  const commentsRef = useRef<CommentsSheetHandle>(null);

  // composer
  const [newPost, setNewPost] = useState("");
  const [pickedImage, setPickedImage] = useState<Asset | null>(null);
  const [posting, setPosting] = useState(false); // ✅ avoid double submits

  // feed loader
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) =>
      getAllPost({ page: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.page < lastPage?.meta?.lastPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const posts: ApiPost[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data) as ApiPost[];
  }, [data]);

  // ✅ optimistic add post + server replace
  const handleAddPost = async () => {
    if (posting) return;
    const text = newPost.trim();
    const imgUri = pickedImage?.uri;
    if (!text && !imgUri) return;

    // NOTE: your createPost only accepts { content }, so image won't be uploaded.
    // TODO: switch to multipart/form-data endpoint to support image upload.
    const tempId = `temp-${Date.now()}`;

    const fakePost: ApiPost = {
      id: tempId as unknown as number, // keep type happy; we’ll replace with real numeric id
      authorId: user?.id ?? 0,
      content: text + (imgUri ? "\n\n(attachment pending upload)" : ""),
      image_url: imgUri || null, // UI preview only; server won’t persist it yet
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_active: true,
      isLikedByMe: false,
      author: {
        id: user?.id ?? 0,
        name: user?.name ?? "You",
        image: user?.image ?? null,
        country: user?.country ?? null,
      },
    };

    // 1) Optimistically prepend to first page
    queryClient.setQueryData(["posts"], (oldData: any) => {
      if (!oldData) {
        return {
          pageParams: [1],
          pages: [
            { data: [fakePost], meta: { page: 1, lastPage: 1, total: 1 } },
          ],
        };
      }
      const newPages = [...oldData.pages];
      if (!newPages[0]) {
        newPages[0] = { data: [], meta: { page: 1, lastPage: 1, total: 0 } };
      }
      newPages[0] = {
        ...newPages[0],
        data: [fakePost, ...newPages[0].data],
        meta: {
          ...newPages[0].meta,
          total: (newPages[0].meta?.total || 0) + 1,
        },
      };
      return { ...oldData, pages: newPages };
    });

    // Clear composer immediately
    setNewPost("");
    setPickedImage(null);

    // 2) Call server
    try {
      setPosting(true);
      const created = await createPost({ content: text });
      // Shape assumed: { id, content, image_url?, created_at, updated_at, ... }
      if (created?.id) {
        // 3) Replace temp in cache with real post
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const newPages = oldData.pages.map((pg: any, idx: number) => {
            if (!Array.isArray(pg.data)) return pg;
            return {
              ...pg,
              data: pg.data.map((p: ApiPost) =>
                String(p.id) === String(tempId) ? { ...created } : p
              ),
            };
          });
          return { ...oldData, pages: newPages };
        });
      } else {
        // If server didn’t return an id, rollback
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const newPages = oldData.pages.map((pg: any) => ({
            ...pg,
            data: pg.data.filter((p: ApiPost) => String(p.id) !== String(tempId)),
            meta: {
              ...pg.meta,
              total:
                typeof pg.meta?.total === "number"
                  ? Math.max(0, pg.meta.total - 1)
                  : pg.meta?.total,
            },
          }));
          return { ...oldData, pages: newPages };
        });
      }
    } catch (e) {
      // 4) Rollback on error
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.filter((p: ApiPost) => String(p.id) !== String(tempId)),
          meta: {
            ...pg.meta,
            total:
              typeof pg.meta?.total === "number"
                ? Math.max(0, pg.meta.total - 1)
                : pg.meta?.total,
          },
        }));
        return { ...oldData, pages: newPages };
      });
    } finally {
      setPosting(false);
      // Optionally refetch to be 100% consistent with server-side order/meta
      // await queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  };

  const onPickImage = () => pickerRef.current?.open();
  const canSend = (newPost.trim().length > 0 || !!pickedImage?.uri) && !posting;

  const keyExtractor = useCallback((item: ApiPost) => String(item.id), []);
  const openComments = useCallback(
    (post: ApiPost) => commentsRef.current?.present({ id: post.id }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ApiPost }) => (
      <PostCard
        post={item}
        currentUserId={user?.id}
        onOpenComments={() => openComments(item)}
      />
    ),
    [user?.id, openComments]
  );

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  // adapter for CommentsSheet -> your API
  const loadCommentsPage = async (
    postId: number | string,
    page: number,
    limit: number
  ) => {
    const res = await getPostComments({ postId, page, limit });
    return {
      data: res?.data ?? [],
      total: res?.meta?.total ?? res?.data?.length ?? 0,
    };
    // (If your API already returns {data,meta:{total}}, you can pass it straight through.)
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* composer */}
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
          editable={!posting}
        />

        {pickedImage?.uri && (
          <View style={styles.previewWrap}>
            <Image source={{ uri: pickedImage.uri }} style={styles.preview} />
          </View>
        )}

        <TouchableOpacity
          onPress={onPickImage}
          style={styles.imageIcon}
          hitSlop={10}
          disabled={posting}
        >
          <ImageSquareIcon size={22} weight="regular" color="#9AA0A6" />
        </TouchableOpacity>

        {canSend && (
          <TouchableOpacity
            onPress={handleAddPost}
            style={styles.sendIcon}
            hitSlop={10}
            disabled={posting}
          >
            <PaperPlaneRightIcon size={22} weight="fill" color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ImagePickerField
        ref={pickerRef}
        value={pickedImage}
        onChange={setPickedImage}
        size={0}
        style={{ height: 0, opacity: 0 }}
        showRemove={false}
      />

      {/* feed */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10 }}>Loading posts...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>
            {(error as any)?.message || "Failed to load posts."}
          </Text>
          <TouchableOpacity
            // onPress={refetch}
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={{ color: "#fff" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          windowSize={7}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          removeClippedSubviews={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={refetch}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>No posts yet.</Text>
            </View>
          }
        />
      )}

      {/* ✅ Reusable Comments Sheet */}
      <CommentsSheet
        ref={commentsRef}
        loadPage={loadCommentsPage}
        pageSize={10}
        title="Comments"
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
  input: { flex: 1, minHeight: 32, paddingRight: 56, fontSize: 14 },
  imageIcon: { position: "absolute", top: 10, right: 12 },
  sendIcon: { position: "absolute", bottom: 10, right: 12 },
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  retryBtn: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
});

export default HomeScreen;
