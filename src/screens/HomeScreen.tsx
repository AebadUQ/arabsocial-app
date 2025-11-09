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
import {
  getAllPost,
  getPostComments,
  createPost,
  likePost,
  deletePost, // ✅ added
} from "@/api/post";
import ImagePickerField, {
  ImagePickerFieldHandle,
} from "@/components/common/ImagePicker";
import type { Asset } from "react-native-image-picker";
import {
  ImageSquareIcon,
  PaperPlaneRightIcon,
  XCircle,
} from "phosphor-react-native";
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

  const commentsRef = useRef<CommentsSheetHandle>(null);

  // composer
  const [newPost, setNewPost] = useState("");
  const [pickedImage, setPickedImage] = useState<Asset | null>(null);
  const [posting, setPosting] = useState(false);

  // like / delete in-flight guards per post
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});

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

  // optimistic add post
  const handleAddPost = async () => {
    if (posting) return;
    const text = newPost.trim();
    const imgUri = pickedImage?.uri;
    if (!text && !imgUri) return;

    const tempId = `temp-${Date.now()}`;

    const fakePost: ApiPost = {
      id: tempId as unknown as number,
      authorId: user?.id ?? 0,
      content: text + (imgUri ? "\n\n(attachment pending upload)" : ""),
      image_url: imgUri || null,
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

    // push temp post at top of first page
    queryClient.setQueryData(["posts"], (oldData: any) => {
      if (!oldData) {
        return {
          pageParams: [1],
          pages: [
            {
              data: [fakePost],
              meta: { page: 1, lastPage: 1, total: 1 },
            },
          ],
        };
      }
      const newPages = [...oldData.pages];
      if (!newPages[0]) {
        newPages[0] = {
          data: [],
          meta: { page: 1, lastPage: 1, total: 0 },
        };
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

    setNewPost("");
    setPickedImage(null);

    try {
      setPosting(true);
      const created = await createPost({ content: text });

      if (created?.id) {
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const newPages = oldData.pages.map((pg: any) => ({
            ...pg,
            data: pg.data.map((p: ApiPost) =>
              String(p.id) === String(tempId) ? { ...created } : p
            ),
          }));
          return { ...oldData, pages: newPages };
        });
      } else {
        // rollback
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const newPages = oldData.pages.map((pg: any) => ({
            ...pg,
            data: pg.data.filter(
              (p: ApiPost) => String(p.id) !== String(tempId)
            ),
            meta: {
              ...pg.meta,
              total: Math.max(0, (pg.meta?.total || 1) - 1),
            },
          }));
          return { ...oldData, pages: newPages };
        });
      }
    } catch {
      // rollback
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.filter(
            (p: ApiPost) => String(p.id) !== String(tempId)
          ),
          meta: {
            ...pg.meta,
            total: Math.max(0, (pg.meta?.total || 1) - 1),
          },
        }));
        return { ...oldData, pages: newPages };
      });
    } finally {
      setPosting(false);
    }
  };

  // optimistic like
  const handleToggleLike = useCallback(
    async (postId: number | string) => {
      const key = String(postId);
      if (likingMap[key]) return;
      setLikingMap((m) => ({ ...m, [key]: true }));

      let prevIsLiked = false;

      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.map((p: ApiPost) => {
            if (String(p.id) !== key) return p;
            prevIsLiked = p.isLikedByMe;
            const next = !p.isLikedByMe;
            return {
              ...p,
              isLikedByMe: next,
              likes_count: Math.max(
                0,
                p.likes_count + (next ? 1 : -1)
              ),
            };
          }),
        }));
        return { ...oldData, pages: newPages };
      });

      try {
        await likePost({ postId });
      } catch {
        // rollback
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          const newPages = oldData.pages.map((pg: any) => ({
            ...pg,
            data: pg.data.map((p: ApiPost) => {
              if (String(p.id) !== key) return p;
              const desired = prevIsLiked;
              const delta =
                desired === p.isLikedByMe
                  ? 0
                  : desired
                  ? 1
                  : -1;
              return {
                ...p,
                isLikedByMe: desired,
                likes_count: Math.max(
                  0,
                  p.likes_count + delta
                ),
              };
            }),
          }));
          return { ...oldData, pages: newPages };
        });
      } finally {
        setLikingMap((m) => ({ ...m, [key]: false }));
      }
    },
    [queryClient, likingMap]
  );

  // delete post (from 3-dot menu)
  const handleDeletePost = useCallback(
    async (postId: number | string) => {
      const key = String(postId);
      if (deletingMap[key]) return;

      setDeletingMap((m) => ({ ...m, [key]: true }));

      let snapshot: any = null;

      // optimistic remove
      queryClient.setQueryData(["posts"], (oldData: any) => {
        snapshot = oldData;
        if (!oldData?.pages) return oldData;

        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.filter(
            (p: ApiPost) => String(p.id) !== key
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      try {
        await deletePost({ postId });
      } catch (e) {
        // rollback if fail
        console.log("e",e)
        if (snapshot) {
          queryClient.setQueryData(["posts"], snapshot);
        }
      } finally {
        setDeletingMap((m) => ({ ...m, [key]: false }));
      }
    },
    [queryClient, deletingMap]
  );

  const onPickImage = () => pickerRef.current?.open();
  const removePicked = () => setPickedImage(null);

  const canSend =
    (newPost.trim().length > 0 || !!pickedImage?.uri) && !posting;

  const keyExtractor = useCallback(
    (item: ApiPost) => String(item.id),
    []
  );

  const openComments = useCallback(
    (post: ApiPost) =>
      commentsRef.current?.present({ id: post.id }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ApiPost }) => (
      <PostCard
        post={item}
        currentUserId={user?.id}
        onOpenComments={openComments}
        onToggleLike={() => handleToggleLike(item.id)}
        onDeletePost={() => handleDeletePost(item.id)} // ✅ pass down
      />
    ),
    [user?.id, openComments, handleToggleLike, handleDeletePost]
  );

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const loadCommentsPage = async (
    postId: number | string,
    page: number,
    limit: number
  ) => {
    const res = await getPostComments({ postId, page, limit });
    return {
      data: res?.data ?? [],
      total:
        res?.meta?.total ??
        res?.data?.length ??
        0,
    };
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
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
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: pickedImage.uri }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              onPress={removePicked}
              hitSlop={10}
              style={styles.removeBadge}
              disabled={posting}
            >
              <XCircle
                size={18}
                weight="fill"
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={onPickImage}
          style={styles.imageIcon}
          hitSlop={10}
          disabled={posting}
        >
          <ImageSquareIcon
            size={22}
            weight="regular"
            color="#9AA0A6"
          />
        </TouchableOpacity>

        {canSend && (
          <TouchableOpacity
            onPress={handleAddPost}
            style={styles.sendIcon}
            hitSlop={10}
            disabled={posting}
          >
            <PaperPlaneRightIcon
              size={22}
              weight="fill"
              color={theme.colors.primary}
            />
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
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={{ marginTop: 10 }}>
            Loading posts...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>
            {(error as any)?.message ||
              "Failed to load posts."}
          </Text>
          <TouchableOpacity
            // onPress={refetch}
            style={[
              styles.retryBtn,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={{ color: "#fff" }}>
              Retry
            </Text>
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
          refreshing={
            isFetching && !isFetchingNextPage
          }
          onRefresh={refetch}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View
                style={{
                  paddingVertical: 20,
                }}
              >
                <ActivityIndicator
                  color={theme.colors.primary}
                />
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
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    overflow: "hidden",
  },
  input: {
    minHeight: 48,
    fontSize: 14,
    paddingRight: 56,
    paddingTop: 6,
    paddingBottom: 6,
  },
  previewContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#f7f7f7",
  },
  previewImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  removeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    padding: 2,
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
});

export default HomeScreen;
