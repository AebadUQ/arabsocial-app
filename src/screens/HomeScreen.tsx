// app/screens/HomeScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ScrollView,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  deletePost,
  uploadPostImage,
  updatePost, // ✅ add this
} from "@/api/post";
import {
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
} from "react-native-image-picker";
import { ImageSquareIcon } from "phosphor-react-native";
import { useAuth } from "@/context/Authcontext";
import CommentsSheet, {
  CommentsSheetHandle,
} from "@/components/home/CommentSheet";
import PostComposerSheet, {
  ComposerSheetHandle,
} from "@/components/home/CreatePostSheet";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const commentsRef = useRef<CommentsSheetHandle>(null);
  const composerRef = useRef<ComposerSheetHandle>(null);
  const { user } = useAuth();

  // composer state
  const [newPost, setNewPost] = useState("");
  const [pickedImage, setPickedImage] = useState<Asset | null>(null);
  const [posting, setPosting] = useState(false);

  // edit state
  const [editingPost, setEditingPost] = useState<ApiPost | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  // like / delete in-flight guards per post
  const [likingMap, setLikingMap] = useState<Record<string, boolean>>({});
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});

  // -------- Feed loader --------
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
    queryFn: async ({ pageParam = 1 }) =>
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

  // -------- Image picker --------
  const onPickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      selectionLimit: 1,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.warn("ImagePicker error:", response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

      const normalized: Asset = {
        ...asset,
        uri: asset.uri || asset.fileName || "",
      };

      setPickedImage(normalized);
      composerRef.current?.open();
    });
  };

  const removePicked = () => {
    setPickedImage(null);
    if (editingPost) {
      // edit mode me agar old image thi, usko bhi remove karna hai
      setEditingImageUrl(null);
    }
  };

  const hasExistingImage = !!editingImageUrl;
  const canSend =
    (newPost.trim().length > 0 || !!pickedImage?.uri || hasExistingImage) &&
    !posting;

  // ====================== CREATE / UPDATE POST ======================

  // create new post
  const handleCreatePost = async () => {
    if (!canSend || posting) return;

    const text = newPost.trim();
    const imageAsset = pickedImage;

    try {
      setPosting(true);

      // upload image if available
      let uploadedUrl: string | null = null;
      if (imageAsset?.uri) {
        const res = await uploadPostImage(imageAsset);
        uploadedUrl = res.url;
      }

      const created = await createPost({
        content: text,
        ...(uploadedUrl ? { image_url: uploadedUrl } : {}),
      });

      if (created?.id) {
        // prepend into first page
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData) {
            return {
              pageParams: [1],
              pages: [
                {
                  data: [created],
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
            data: [created, ...newPages[0].data],
            meta: {
              ...newPages[0].meta,
              total: (newPages[0].meta?.total || 0) + 1,
            },
          };

          return { ...oldData, pages: newPages };
        });

        // reset
        setNewPost("");
        setPickedImage(null);
        setEditingPost(null);
        setEditingImageUrl(null);
        composerRef.current?.close();
      }
    } catch (e) {
      console.warn("create post failed", e);
    } finally {
      setPosting(false);
    }
  };

  // update existing post
  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!canSend || posting) return;

    const text = newPost.trim();

    try {
      setPosting(true);

      // default: existing server image url
      let imageUrlToSend: string | null = editingImageUrl ?? null;

      // agar user ne nayi image pick ki
      if (pickedImage?.uri) {
        const res = await uploadPostImage(pickedImage);
        imageUrlToSend = res.url;
      }

      const payload: any = {
        content: text,
        image_url: imageUrlToSend, // null bhi ho sakta hai (remove image)
      };

      const updated = await updatePost(editingPost.id, payload);

      // cache update
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.map((p: ApiPost) =>
            String(p.id) === String(editingPost.id) ? { ...p, ...updated } : p
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      // reset
      setEditingPost(null);
      setEditingImageUrl(null);
      setNewPost("");
      setPickedImage(null);
      composerRef.current?.close();
    } catch (e) {
      console.warn("update post failed", e);
    } finally {
      setPosting(false);
    }
  };

  // wrapper (sheet se ye hi call hoga)
  const handleSubmitPost = async () => {
    if (editingPost) {
      await handleUpdatePost();
    } else {
      await handleCreatePost();
    }
  };

  // ====================== /CREATE / UPDATE POST ======================

  // -------- Like / Delete / Comments --------
  const handleToggleLike = useCallback(
    async (postId: number | string) => {
      const key = String(postId);

      let alreadyInFlight = false;
      setLikingMap((prev) => {
        if (prev[key]) {
          alreadyInFlight = true;
          return prev;
        }
        return { ...prev, [key]: true };
      });
      if (alreadyInFlight) return;

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
        queryClient.setQueryData(["posts"], (oldData: any) => {
          if (!oldData?.pages) return oldData;

          const newPages = oldData.pages.map((pg: any) => ({
            ...pg,
            data: pg.data.map((p: ApiPost) => {
              if (String(p.id) !== key) return p;
              return {
                ...p,
                isLikedByMe: prevIsLiked,
                likes_count: Math.max(
                  0,
                  p.likes_count + (prevIsLiked ? 1 : -1)
                ),
              };
            }),
          }));

          return { ...oldData, pages: newPages };
        });
      } finally {
        setLikingMap((prev) => {
          const clone = { ...prev };
          delete clone[key];
          return clone;
        });
      }
    },
    [queryClient]
  );

  const handleDeletePost = useCallback(
    async (postId: number | string) => {
      const key = String(postId);
      if (deletingMap[key]) return;

      setDeletingMap((m) => ({ ...m, [key]: true }));

      let snapshot: any = null;

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
        console.log("delete error", e);
        if (snapshot) {
          queryClient.setQueryData(["posts"], snapshot);
        }
      } finally {
        setDeletingMap((m) => {
          const clone = { ...m };
          delete clone[key];
          return clone;
        });
      }
    },
    [queryClient, deletingMap]
  );

  const openComments = useCallback(
    (post: ApiPost) =>
      commentsRef.current?.present({ id: post.id }),
    []
  );

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
  };

  // 🔥 comment add hone pe PostCard ka comments_count increment
  const handleCommentAdded = useCallback(
    (postId: number | string) => {
      const key = String(postId);

      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        const newPages = oldData.pages.map((pg: any) => ({
          ...pg,
          data: pg.data.map((p: ApiPost) => {
            if (String(p.id) !== key) return p;
            return {
              ...p,
              comments_count: (p.comments_count || 0) + 1,
            };
          }),
        }));

        return { ...oldData, pages: newPages };
      });
    },
    [queryClient]
  );

  // ===== Edit start handler =====
  const startEditPost = (post: ApiPost) => {
    setEditingPost(post);
    setNewPost(post.content || "");
    setPickedImage(null);
    setEditingImageUrl(post.image_url || null);
    composerRef.current?.open();
  };

  // -------- Infinite scroll with ScrollView --------
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasNextPage || isFetchingNextPage) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 250; // px
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isNearBottom) {
      fetchNextPage();
    }
  };

  // -------- Composer UI (top) --------
  const renderComposer = () => (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 18,
        marginBottom: 20,
        marginTop: 8,
      }}
    >
      {/* fake input -> open bottom sheet */}
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.9}
        onPress={() => {
          setEditingPost(null);
          setEditingImageUrl(null);
          setNewPost("");
          setPickedImage(null);
          composerRef.current?.open();
        }}
      >
        <View
          style={{
            width: "100%",
            borderWidth: 0.25,
            borderColor: theme.colors.borderColor,
            padding: 14,
            backgroundColor: "white",
            borderRadius: 9999,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#999" }}>
            Share Something interesting about yourself..
          </Text>
        </View>
      </TouchableOpacity>

      {/* image icon */}
      <TouchableOpacity
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 0.25,
          borderColor: theme.colors.primary,
          width: 40,
          height: 40,
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 20,
        }}
        onPress={() => {
          setEditingPost(null);
          setEditingImageUrl(null);
          onPickImage();
        }}
      >
        <ImageSquareIcon color={theme.colors.primary} size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <TopBar onMenuPress={() => navigation.openDrawer()} showCenterLogo />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage && !isLoading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {renderComposer()}

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={{ marginTop: 10 }}>Loading posts...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>
              {(error as any)?.message || "Failed to load posts."}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              // onPress={refetch}
            >
              <Text style={{ color: "#fff" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.center}>
            <Text>No posts yet.</Text>
          </View>
        ) : (
          <View>
            {posts.map((item) => (
              <PostCard
                key={String(item.id)}
                post={item}
                currentUserId={user?.id}
                onOpenComments={openComments}
                onToggleLike={() => handleToggleLike(item.id)}
                onDeletePost={() => handleDeletePost(item.id)}
                onEditPost={() => startEditPost(item)} // ✅ edit handler
              />
            ))}

            {isFetchingNextPage && (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Comments Bottom Sheet */}
      <CommentsSheet
        ref={commentsRef}
        loadPage={loadCommentsPage}
        pageSize={10}
        title="Comments"
        onCommentAdded={handleCommentAdded}
      />

      {/* Post Composer Bottom Sheet */}
      <PostComposerSheet
        ref={composerRef}
        newPost={newPost}
        onChangeText={setNewPost}
        pickedImage={pickedImage}
        onRemoveImage={removePicked}
        onSend={handleSubmitPost}
        posting={posting}
        onPickImage={onPickImage}
        userName={user?.name}
        userLocation={user?.country || ""}
        userAvatarUri={user?.image ?? null}
        mode={editingPost ? "edit" : "create"}         // ✅
        existingImageUrl={editingImageUrl}             // ✅
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
