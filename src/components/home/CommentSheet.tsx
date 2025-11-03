// components/comments/CommentsSheet.tsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import {
  addPostComment,
  getPostCommentsReplies,
  addReplytoPost,
} from "@/api/post";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export type CommentItemType = {
  id: number | string;
  content?: string | null;
  created_at?: string;
  createdAt?: string;
  user?: { name?: string | null; image?: string | null } | null;
  author?: { name?: string | null; image?: string | null } | null;
  replies_count?: number | null;
};

export type ApiPostLite = { id: number | string };

export type CommentsSheetHandle = {
  present: (post: ApiPostLite) => void;
  close: () => void;
};

type Props = {
  loadPage: (
    postId: number | string,
    page: number,
    limit: number
  ) => Promise<{ data: CommentItemType[]; total: number }>;
  pageSize?: number;
  title?: string;
};

const REPLIES_PAGE_SIZE = 3;

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

const getInitials = (name?: string | null) =>
  (!name
    ? "?"
    : name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join(""));

/* ─────────────────────────────────────────
   Header (memoized) — stays mounted
───────────────────────────────────────── */
type HeaderProps = {
  title: string;
  postId?: string | number | null;
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  disabled: boolean;
  onFocusChange: (focused: boolean) => void;
  colors: {
    text: string;
    textLight: string;
    textWhite: string;
    background: string;
    borderColor: string;
    primary: string;
  };
};

const Header = memo(function Header({
  title,
  postId,
  value,
  onChange,
  onSend,
  disabled,
  onFocusChange,
  colors,
}: HeaderProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
      <Text style={{ color: colors.text, fontWeight: "600", marginBottom: 8 ,textAlign:'center'}}>
        {title}
        {/* {postId ? ` • #${postId}` : ""} */}
      </Text>

      <View
        style={[
          styles.newCommentRow,
          {
            borderColor: colors.borderColor || "#e5e7eb",
            backgroundColor: colors.textWhite || colors.background,
          },
        ]}
      >
        <BottomSheetTextInput
          placeholder="Add a comment…"
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChange}
          style={[styles.newCommentInput, { color: colors.text }]}
          multiline
          blurOnSubmit={false}
          returnKeyType="default"
          textAlignVertical="top"
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
        />
        <TouchableOpacity onPress={onSend} disabled={!value.trim() || disabled}>
          {disabled ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{
                color: value.trim() ? colors.primary : colors.textLight,
                fontWeight: "700",
              }}
            >
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
const CommentsSheet = forwardRef<CommentsSheetHandle, Props>(
  ({ loadPage, pageSize = 10, title = "Comments" }, ref) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);

    const [selectedPost, setSelectedPost] = useState<ApiPostLite | null>(null);

    // comments pagination
    const [comments, setComments] = useState<CommentItemType[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // add comment (top composer)
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);

    // inline reply state
    const [replyToId, setReplyToId] = useState<string | number | null>(null);
    const [replyDraft, setReplyDraft] = useState<Record<string | number, string>>({});
    const [replyPosting, setReplyPosting] = useState(false);

    // replies cache per comment
    const [replies, setReplies] = useState<Record<string | number, CommentItemType[]>>({});
    const [repliesMeta, setRepliesMeta] = useState<
      Record<string | number, { page: number; total: number }>
    >({});
    const [repliesLoading, setRepliesLoading] = useState<Record<string | number, boolean>>({});
    const [openReplies, setOpenReplies] = useState<Record<string | number, boolean>>({});

    // typing lock (avoid sheet pan/blur)
    const [isComposing, setIsComposing] = useState(false);

    // fixed snaps -> sheet won't resize with content
    const snapPoints = useMemo(() => ["40%", "80%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.35}
          pressBehavior="close"
        />
      ),
      []
    );

    // ===== Comments paging =====
    const fetchFirstPage = async (postId: number | string) => {
      setLoading(true);
      try {
        const res = await loadPage(postId, 1, pageSize);
        setComments(res.data || []);
        setTotal(res.total || res.data?.length || 0);
        setPage(1);
      } finally {
        setLoading(false);
      }
    };

    const loadMore = async () => {
      if (!selectedPost) return;
      if (comments.length >= total) return;

      const next = page + 1;
      try {
        setLoadingMore(true);
        const res = await loadPage(selectedPost.id, next, pageSize);
        setComments((prev) => [...prev, ...(res.data || [])]);
        setPage(next);
      } finally {
        setLoadingMore(false);
      }
    };

    // ===== Add top-level comment =====
    const handleAddComment = async () => {
      if (!newComment.trim() || !selectedPost || posting) return;

      const tempId = `local-${Date.now()}`;
      const optimistic: CommentItemType = {
        id: tempId,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        user: { name: "You", image: null },
      };

      setComments((prev) => [optimistic, ...prev]);
      setTotal((t) => t + 1);
      setNewComment("");
      setPosting(true);

      try {
        const created = await addPostComment({
          postId: selectedPost.id,
          content: optimistic.content || "",
        });

        if (created && created.id) {
          setComments((prev) => prev.map((c) => (String(c.id) === tempId ? created : c)));
        }
      } catch {
        setComments((prev) => prev.filter((c) => String(c.id) !== tempId));
        setTotal((t) => Math.max(0, t - 1));
      } finally {
        setPosting(false);
      }
    };

    // ===== Replies (fetch/show/more) =====
    const openOrLoadReplies = async (commentId: string | number) => {
      const isOpen = !!openReplies[commentId];
      if (!isOpen && !replies[commentId]?.length) {
        setRepliesLoading((s) => ({ ...s, [commentId]: true }));
        try {
          const res = await getPostCommentsReplies({
            commentId,
            page: 1,
            limit: REPLIES_PAGE_SIZE,
          });
          setReplies((r) => ({ ...r, [commentId]: res.data || [] }));
          setRepliesMeta((m) => ({
            ...m,
            [commentId]: {
              page: 1,
              total: res?.meta?.total ?? (res.data?.length || 0),
            },
          }));
        } finally {
          setRepliesLoading((s) => ({ ...s, [commentId]: false }));
        }
      }
      setOpenReplies((s) => ({ ...s, [commentId]: !isOpen }));
    };

    const loadMoreReplies = async (commentId: string | number) => {
      if (repliesLoading[commentId]) return;
      const meta = repliesMeta[commentId] || { page: 0, total: 0 };
      const currentCount = replies[commentId]?.length || 0;
      if (currentCount >= meta.total) return;

      setRepliesLoading((s) => ({ ...s, [commentId]: true }));
      try {
        const nextPage = meta.page + 1;
        const res = await getPostCommentsReplies({
          commentId,
          page: nextPage,
          limit: REPLIES_PAGE_SIZE,
        });
        setReplies((r) => ({
          ...r,
          [commentId]: [...(r[commentId] || []), ...(res.data || [])],
        }));
        setRepliesMeta((m) => ({
          ...m,
          [commentId]: { page: nextPage, total: res?.meta?.total ?? meta.total },
        }));
      } finally {
        setRepliesLoading((s) => ({ ...s, [commentId]: false }));
      }
    };

    // ===== Send reply (optimistic) =====
    const handleSendReply = async (parentId: string | number) => {
      if (replyPosting) return;
      const text = (replyDraft[parentId] || "").trim();
      if (!text) return;

      const tempId = `reply-${Date.now()}`;
      const optimistic: CommentItemType = {
        id: tempId,
        content: text,
        createdAt: new Date().toISOString(),
        user: { name: "You", image: null },
      };

      // make sure replies list is open and initialized
      setOpenReplies((s) => ({ ...s, [parentId]: true }));
      setReplies((r) => ({ ...r, [parentId]: r[parentId] ? r[parentId] : [] }));
      setReplies((r) => ({ ...r, [parentId]: [...(r[parentId] || []), optimistic] }));
      // bump visible count & server count on parent
      setComments((prev) =>
        prev.map((c) =>
          String(c.id) === String(parentId)
            ? { ...c, replies_count: (c.replies_count ?? 0) + 1 }
            : c
        )
      );

      setReplyPosting(true);
      setReplyDraft((d) => ({ ...d, [parentId]: "" }));
      setReplyToId(null);

      try {
        const created = await addReplytoPost({ commentId: parentId, content: text });
        if (created?.id) {
          setReplies((r) => ({
            ...r,
            [parentId]: (r[parentId] || []).map((x) => (String(x.id) === tempId ? created : x)),
          }));
          setRepliesMeta((m) => {
            const meta = m[parentId] || { page: 1, total: 0 };
            const lengthNow = (replies[parentId] || []).length + 1; // optimistic added
            return { ...m, [parentId]: { ...meta, total: Math.max(meta.total, lengthNow) } };
          });
        }
      } catch {
        // rollback
        setReplies((r) => ({
          ...r,
          [parentId]: (r[parentId] || []).filter((x) => String(x.id) !== tempId),
        }));
        setComments((prev) =>
          prev.map((c) =>
            String(c.id) === String(parentId)
              ? { ...c, replies_count: Math.max(0, (c.replies_count ?? 1) - 1) }
              : c
          )
        );
      } finally {
        setReplyPosting(false);
      }
    };

    // ===== Expose controls =====
    useImperativeHandle(ref, () => ({
      present: async (post: ApiPostLite) => {
        setSelectedPost(post);
        await fetchFirstPage(post.id);
        sheetRef.current?.present(); // open at default index 0
      },
      close: () => sheetRef.current?.dismiss(),
    }));

    // ===== Item renderer =====
    const renderItem = ({ item }: { item: CommentItemType }) => {
      const name = item?.author?.name ?? item?.user?.name ?? "Anonymous";
      const avatar = item?.author?.image ?? item?.user?.image ?? null;
      const created = item?.created_at || item?.createdAt;

      const parentId = item.id;
      const isReplyingHere = replyToId === parentId;
      const draftVal = replyDraft[parentId] ?? "";

      const rItems = replies[parentId] || [];
      const rMeta = repliesMeta[parentId] || { page: 0, total: 0 };
      const rLoading = !!repliesLoading[parentId];
      const isOpen = !!openReplies[parentId];
      const remaining = Math.max(0, (rMeta.total || 0) - rItems.length);

      return (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderColor,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.commentAvatar} />
            ) : (
              <View
                style={[
                  styles.commentAvatar,
                  { backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
                ]}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280" }}>
                  {getInitials(name)}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <View style={styles.commentHeader}>
                <Text
                  style={[
                    styles.commentName,
                    { color: theme.colors.text, textTransform: "capitalize" },
                  ]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text style={[styles.commentTime, { color: theme.colors.textLight }]}>
                  {timeAgo(created)}
                </Text>
              </View>

              <Text style={[styles.commentText, { color: theme.colors.textLight }]}>
                {item?.content ?? ""}
              </Text>

              {/* Actions */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6 }}>
                <TouchableOpacity
                  onPress={() => setReplyToId(isReplyingHere ? null : parentId)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.primary }}>
                    Reply
                  </Text>
                </TouchableOpacity>

                {!!item?.replies_count && item.replies_count > 0 && (
                  <TouchableOpacity onPress={() => openOrLoadReplies(parentId)} activeOpacity={0.7}>
                    <Text style={{ fontSize: 12, color: theme.colors.textLight }}>
                      {isOpen ? "Hide" : "View"} {item.replies_count} repl
                      {item.replies_count === 1 ? "y" : "ies"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Replies */}
              {isOpen && (
                <View style={{ marginTop: 8, marginLeft: 34 }}>
                  {rLoading && rItems.length === 0 ? (
                    <ActivityIndicator color={theme.colors.primary} />
                  ) : (
                    <>
                      {rItems.map((r) => {
                        const rName = r?.author?.name ?? r?.user?.name ?? "Anonymous";
                        const rAvatar = r?.author?.image ?? r?.user?.image ?? null;
                        const rCreated = r?.created_at || r?.createdAt;
                        return (
                          <View
                            key={String(r.id)}
                            style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}
                          >
                            {rAvatar ? (
                              <Image
                                source={{ uri: rAvatar }}
                                style={{ width: 20, height: 20, borderRadius: 10 }}
                              />
                            ) : (
                              <View
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  backgroundColor: "#E5E7EB",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text style={{ fontSize: 9, fontWeight: "700", color: "#6B7280" }}>
                                  {getInitials(rName)}
                                </Text>
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: theme.colors.text,
                                    marginRight: 6,
                                  }}
                                  numberOfLines={1}
                                >
                                  {rName}
                                </Text>
                                <Text style={{ fontSize: 11, color: theme.colors.textLight }}>
                                  {timeAgo(rCreated)}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  marginTop: 2,
                                  fontSize: 12,
                                  lineHeight: 17,
                                  color: theme.colors.textLight,
                                }}
                              >
                                {r?.content ?? ""}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      {remaining > 0 && (
                        <TouchableOpacity
                          onPress={() => loadMoreReplies(parentId)}
                          activeOpacity={0.7}
                          style={{ paddingVertical: 6 }}
                          disabled={rLoading}
                        >
                          {rLoading ? (
                            <ActivityIndicator color={theme.colors.primary} />
                          ) : (
                            <Text style={{ fontSize: 12, color: theme.colors.textLight }}>
                              View {Math.min(remaining, REPLIES_PAGE_SIZE)} more
                              repl{remaining === 1 ? "y" : "ies"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* Inline reply composer */}
              {isReplyingHere && (
                <View
                  style={[
                    styles.replyComposer,
                    {
                      borderColor: theme.colors.borderColor || "#e5e7eb",
                      backgroundColor: theme.colors.textWhite || theme.colors.background,
                    },
                  ]}
                >
                  <BottomSheetTextInput
                    value={draftVal}
                    onChangeText={(t) => setReplyDraft((d) => ({ ...d, [parentId]: t }))}
                    placeholder="Write a reply…"
                    placeholderTextColor={theme.colors.textLight}
                    style={[styles.replyInput, { color: theme.colors.text }]}
                    multiline
                    blurOnSubmit={false}
                    returnKeyType="default"
                    textAlignVertical="top"
                    onFocus={() => setIsComposing(true)}
                    onBlur={() => setIsComposing(false)}
                  />
                  <TouchableOpacity
                    onPress={() => handleSendReply(parentId)}
                    disabled={!draftVal.trim() || replyPosting}
                    activeOpacity={0.7}
                    style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                  >
                    {replyPosting ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Text
                        style={{
                          fontWeight: "700",
                          color: draftVal.trim() ? theme.colors.primary : theme.colors.textLight,
                        }}
                      >
                        Send
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    };

    const ListFooter = () => (
      <View>
        {comments.length < total && (
          <TouchableOpacity
            onPress={loadMore}
            style={styles.loadMoreBtn}
            disabled={loadingMore}
            activeOpacity={0.8}
          >
            {loadingMore ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>
                Load more comments
              </Text>
            )}
          </TouchableOpacity>
        )}
        <View style={{ height: insets.bottom + 12 }} />
      </View>
    );

    const ListEmpty = () => (
      <View style={{ paddingHorizontal: 16, paddingVertical: 32, alignItems: "center" }}>
        {loading ? (
          <>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textLight, marginTop: 6 }}>
              Loading comments...
            </Text>
          </>
        ) : (
          <Text style={{ color: theme.colors.textLight }}>No comments yet.</Text>
        )}
      </View>
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableOverDrag={false}
        enableContentPanningGesture={!isComposing}  // lock pan while typing
        keyboardBehavior="interactive"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        topInset={insets.top + 20}
        handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {/* Header as a memoized element — won't unmount on keystroke */}
        <Header
          title={title || "Comments"}
          postId={selectedPost?.id ?? null}
          value={newComment}
          onChange={setNewComment}
          onSend={handleAddComment}
          disabled={posting}
          onFocusChange={setIsComposing}
          colors={{
            text: theme.colors.text,
            textLight: theme.colors.textLight,
            textWhite: theme.colors.textWhite,
            background: theme.colors.background,
            borderColor: theme.colors.borderColor,
            primary: theme.colors.primary,
          }}
        />

        <BottomSheetFlatList
          data={comments}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderItem}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 12 }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          // don't pass top-composer states here; keeps list stable while typing
          extraData={{
            replyToId,
            replyDraft,
            replyPosting,
            replies,
            repliesMeta,
            repliesLoading,
            openReplies,
            loading,
            loadingMore,
          }}
        />
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  commentHeader: { flexDirection: "row", alignItems: "center" },
  commentName: { fontSize: 13, fontWeight: "600", flexShrink: 1, marginRight: 8 },
  commentTime: { fontSize: 11 },
  commentText: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  commentAvatar: { width: 24, height: 24, borderRadius: 12, overflow: "hidden" },

  // top composer
  newCommentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    minHeight: 44,
  },
  newCommentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
  },

  // inline reply composer
  replyComposer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    minHeight: 32,
    maxHeight: 96,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: "top",
  },

  // load more
  loadMoreBtn: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
});

export default CommentsSheet;
