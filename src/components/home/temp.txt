import React, { memo, useMemo, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import CustomBottomSheet from "@/components/BottomSheet";
import { ChatCircleIcon, ThumbsUpIcon, PaperPlaneRightIcon } from "phosphor-react-native";
import { theme } from "@/theme/theme";

export type Reply = { id: string; user: string; text: string; avatarUri?: string };
export type Comment = {
  id: string;
  user: string;
  text: string;
  avatarUri?: string;
  replies?: Reply[];
};
export type Post = {
  id: string;
  name: string;
  location: string;
  content: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  image?: any;
  avatarUri?: string;
};

type Props = { post: Post };

const AVATAR = 28;
const COMMENT_AVATAR = 28;
const REPLY_AVATAR = 22;
const REVEAL_STEP = 4;

// ----- helpers -----
const CURRENT_USER = "You";
const isMine = (user?: string) => (user || "").trim().toLowerCase() === CURRENT_USER.toLowerCase();

// Avatar with initials fallback
const UserAvatar: React.FC<{
  uri?: string;
  size: number;
  name?: string;
  bg?: string;
  fg?: string;
}> = ({ uri, size, name = "", bg = "#5F6367", fg = "#fff" }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: size * 0.38 }}>{initials || "U"}</Text>
    </View>
  );
};

type ActionTarget =
  | { kind: "comment"; cid: string }
  | { kind: "reply"; cid: string; rid: string }
  | null;

const PostCard: React.FC<Props> = ({ post }) => {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // local comment list
  const [commentList, setCommentList] = useState<Comment[]>(
    () =>
      post.comments?.map((c) => ({
        ...c,
        replies: Array.isArray(c.replies) ? c.replies : [],
      })) ?? []
  );

  // "View more replies" counter per comment
  const [shownCounts, setShownCounts] = useState<Record<string, number>>(() => {
    const obj: Record<string, number> = {};
    for (const c of commentList) obj[c.id] = 0;
    return obj;
  });

  // reply composer states
  const [composerOpen, setComposerOpen] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});

  // NEW: top-level comment composer
  const [newComment, setNewComment] = useState("");

  // edit states (comment + reply)
  const [editingComment, setEditingComment] = useState<Record<string, boolean>>({});
  const [editDraftComment, setEditDraftComment] = useState<Record<string, string>>({});
  const [editingReply, setEditingReply] = useState<Record<string, string | null>>({}); // key: `${cid}:${rid}`
  const [editDraftReply, setEditDraftReply] = useState<Record<string, string>>({});   // key: `${cid}:${rid}`

  // long-tap action target
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const closeActionBar = () => setActionTarget(null);
  const showActionsForComment = (c: Comment) => {
    if (!isMine(c.user)) return;
    setActionTarget({ kind: "comment", cid: c.id });
  };
  const showActionsForReply = (cid: string, r: Reply) => {
    if (!isMine(r.user)) return;
    setActionTarget({ kind: "reply", cid, rid: r.id });
  };

  const liveCommentCount = useMemo(() => commentList.length, [commentList]);

  // ----- top-level comment add -----
  const handleAddComment = () => {
    const text = newComment.trim();
    if (!text) return;
    const newC: Comment = {
      id: `c-${Date.now()}`,
      user: CURRENT_USER,
      text,
      replies: [],
    };
    setCommentList((prev) => [newC, ...prev]); // prepend so user sees it instantly
    setNewComment("");
  };

  // ----- reply flow -----
  const handleViewMore = (cid: string) => {
    const total = commentList.find((c) => c.id === cid)?.replies?.length ?? 0;
    const current = shownCounts[cid] ?? 0;
    const next = Math.min(total, current + REVEAL_STEP);
    setShownCounts((s) => ({ ...s, [cid]: next }));
  };

  const handleToggleComposer = (cid: string) => {
    setComposerOpen((s) => ({ ...s, [cid]: !s[cid] }));
  };

  const handleSendReply = (cid: string) => {
    const text = (draft[cid] || "").trim();
    if (!text) return;

    setCommentList((list) =>
      list.map((c) => {
        if (c.id !== cid) return c;
        const nextIndex = (c.replies?.length ?? 0) + 1;
        const newReply: Reply = { id: `r-${cid}-${nextIndex}`, user: CURRENT_USER, text };
        return { ...c, replies: [...(c.replies || []), newReply] };
      })
    );

    // ensure visible
    setShownCounts((s) => ({ ...s, [cid]: (s[cid] ?? 0) + 1 }));
    setDraft((d) => ({ ...d, [cid]: "" }));
    setComposerOpen((s) => ({ ...s, [cid]: false }));
  };

  // ----- comment edit/delete -----
  const startEditComment = (cid: string, currentText: string) => {
    setEditingComment((m) => ({ ...m, [cid]: true }));
    setEditDraftComment((m) => ({ ...m, [cid]: currentText }));
  };

  const cancelEditComment = (cid: string) => {
    setEditingComment((m) => ({ ...m, [cid]: false }));
  };

  const saveEditComment = (cid: string) => {
    const text = (editDraftComment[cid] || "").trim();
    if (!text) return;
    setCommentList((list) => list.map((c) => (c.id === cid ? { ...c, text } : c)));
    setEditingComment((m) => ({ ...m, [cid]: false }));
  };

  const deleteComment = (cid: string) => {
    setCommentList((list) => list.filter((c) => c.id !== cid));
    // cleanup local states
    setShownCounts((m) => {
      const { [cid]: _, ...rest } = m;
      return rest;
    });
    setComposerOpen((m) => {
      const { [cid]: _, ...rest } = m;
      return rest;
    });
    setEditingComment((m) => {
      const { [cid]: _, ...rest } = m;
      return rest;
    });
    setEditDraftComment((m) => {
      const { [cid]: _, ...rest } = m;
      return rest;
    });
    if (actionTarget?.kind === "comment" && actionTarget.cid === cid) setActionTarget(null);
  };

  // ----- reply edit/delete -----
  const keyForReply = (cid: string, rid: string) => `${cid}:${rid}`;

  const startEditReply = (cid: string, rid: string, currentText: string) => {
    const k = keyForReply(cid, rid);
    setEditingReply((m) => ({ ...m, [k]: rid }));
    setEditDraftReply((m) => ({ ...m, [k]: currentText }));
  };

  const cancelEditReply = (cid: string, rid: string) => {
    const k = keyForReply(cid, rid);
    setEditingReply((m) => ({ ...m, [k]: null }));
  };

  const saveEditReply = (cid: string, rid: string) => {
    const k = keyForReply(cid, rid);
    const text = (editDraftReply[k] || "").trim();
    if (!text) return;

    setCommentList((list) =>
      list.map((c) => {
        if (c.id !== cid) return c;
        return {
          ...c,
          replies: (c.replies || []).map((r) => (r.id === rid ? { ...r, text } : r)),
        };
      })
    );
    setEditingReply((m) => ({ ...m, [k]: null }));
  };

  const deleteReply = (cid: string, rid: string) => {
    const k = keyForReply(cid, rid);
    setCommentList((list) =>
      list.map((c) => {
        if (c.id !== cid) return c;
        return { ...c, replies: (c.replies || []).filter((r) => r.id !== rid) };
      })
    );
    setEditingReply((m) => ({ ...m, [k]: null }));
    setEditDraftReply((m) => {
      const { [k]: _, ...rest } = m;
      return rest;
    });
    if (actionTarget?.kind === "reply" && actionTarget.cid === cid && actionTarget.rid === rid) {
      setActionTarget(null);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.userRow}>
          <UserAvatar size={AVATAR} name={post.name} {...(post.avatarUri ? { uri: post.avatarUri } : {})} />
          <View>
            <Text variant="caption" color={theme.colors.text}>{post.name}</Text>
            <Text variant="caption" color={theme.colors.textLight}>{post.location}</Text>
          </View>
        </View>

        {!!post.content && <Text variant="body1" color={theme.colors.text}>{post.content}</Text>}
        {post.image && <Image source={post.image} style={styles.image} resizeMode="cover" />}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={() => setLiked((v) => !v)}>
            <ThumbsUpIcon size={20} color={liked ? theme.colors.primary : theme.colors.text} />
            <Text variant="caption" color={liked ? theme.colors.primary : theme.colors.text}>
              {post.likes + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.action}
            onPress={() => {
              setCommentsVisible(true);
              setActionTarget(null);
            }}
          >
            <ChatCircleIcon size={20} color={theme.colors.text} />
            <Text variant="caption" color={theme.colors.text}>{liveCommentCount} Comments</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomBottomSheet
        visible={commentsVisible}
        onClose={() => {
          setCommentsVisible(false);
          setActionTarget(null);
        }}
      >
        {/* Backdrop press to close the action bar */}
        <TouchableOpacity activeOpacity={1} onPress={closeActionBar} style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
          >
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              Comments ({liveCommentCount})
            </Text>

            
            {/* ========================================= */}

            {commentList.length ? (
              commentList.map((c) => {
                const replies = c.replies || [];
                const shown = shownCounts[c.id] ?? 0;
                const remaining = Math.max(0, replies.length - shown);
                const mine = isMine(c.user);
                const isEditingThisComment = !!editingComment[c.id];

                return (
                  <View key={c.id} style={styles.commentBlock}>
                    {/* Comment row */}
                    <View style={styles.commentRow}>
                      <UserAvatar size={COMMENT_AVATAR} name={c.user} {...(c.avatarUri ? { uri: c.avatarUri } : {})} />

                      <View style={styles.commentBubble}>
                        {/* TOP: name + time */}
                        <Text style={[styles.commentUser, { color: theme.colors.text }]} variant="caption">
                          {c.user}{" "}
                          <Text variant="caption" style={{ color: theme.colors.textLight }}>
                            30m
                          </Text>
                        </Text>

                        {/* BODY: text or editor */}
                        {!isEditingThisComment ? (
                          <TouchableOpacity
                            activeOpacity={mine ? 0.6 : 1}
                            delayLongPress={250}
                            onLongPress={() => showActionsForComment(c)}
                          >
                            <Text color={theme.colors.text}>{c.text}</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.editWrap}>
                            <TextInput
                              value={editDraftComment[c.id] ?? ""}
                              onChangeText={(t) => setEditDraftComment((m) => ({ ...m, [c.id]: t }))}
                              multiline
                              style={[
                                styles.editInput,
                                { color: theme.colors.text, borderColor: theme.colors.border || "#e5e7eb" },
                              ]}
                              placeholder="Edit your comment…"
                              placeholderTextColor={theme.colors.textLight}
                            />
                            <View style={styles.editBtns}>
                              <TouchableOpacity onPress={() => saveEditComment(c.id)} style={styles.editBtn}>
                                <Text variant="caption" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                                  Save
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => cancelEditComment(c.id)} style={styles.editBtn}>
                                <Text variant="caption" style={{ color: theme.colors.textLight }}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => deleteComment(c.id)} style={styles.editBtn}>
                                <Text variant="caption" style={{ color: "#ef4444", fontWeight: "700" }}>
                                  Delete
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Long-tap action bar for comment */}
                    {!isEditingThisComment &&
                      actionTarget?.kind === "comment" &&
                      actionTarget.cid === c.id && (
                        <View style={styles.longTapBar}>
                          <TouchableOpacity
                            onPress={() => {
                              setActionTarget(null);
                              startEditComment(c.id, c.text);
                            }}
                          >
                            <Text variant="caption" style={styles.longTapBtn}>Edit</Text>
                          </TouchableOpacity>
                          <Text variant="caption" style={styles.dot}>·</Text>
                          <TouchableOpacity
                            onPress={() => {
                              setActionTarget(null);
                              deleteComment(c.id);
                            }}
                          >
                            <Text variant="caption" style={[styles.longTapBtn, styles.destructive]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                    {/* Actions under the bubble */}
                    {!isEditingThisComment && (
                      <View style={styles.commentActionsRow}>
                        <TouchableOpacity onPress={() => handleToggleComposer(c.id)}>
                          <Text variant="caption" style={styles.replyBtn}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Replies */}
                    {shown > 0 && (
                      <View style={styles.repliesWrap}>
                        {replies.slice(0, shown).map((r) => {
                          const mineR = isMine(r.user);
                          const k = keyForReply(c.id, r.id);
                          const isEditingThisReply = editingReply[k] === r.id;

                          return (
                            <View key={r.id} style={styles.replyRow}>
                              <UserAvatar size={REPLY_AVATAR} name={r.user} {...(r.avatarUri ? { uri: r.avatarUri } : {})} />
                              <View style={styles.replyBubble}>
                                <Text variant="caption" style={[styles.replyUser, { color: theme.colors.text }]}>
                                  {r.user}
                                </Text>

                                {!isEditingThisReply ? (
                                  <TouchableOpacity
                                    activeOpacity={mineR ? 0.6 : 1}
                                    delayLongPress={250}
                                    onLongPress={() => showActionsForReply(c.id, r)}
                                  >
                                    <Text color={theme.colors.text}>{r.text}</Text>
                                  </TouchableOpacity>
                                ) : (
                                  <View style={styles.editWrap}>
                                    <TextInput
                                      value={editDraftReply[k] ?? ""}
                                      onChangeText={(t) => setEditDraftReply((m) => ({ ...m, [k]: t }))}
                                      multiline
                                      style={[
                                        styles.editInput,
                                        { color: theme.colors.text, borderColor: theme.colors.border || "#e5e7eb" },
                                      ]}
                                      placeholder="Edit your reply…"
                                      placeholderTextColor={theme.colors.textLight}
                                    />
                                    <View style={styles.editBtns}>
                                      <TouchableOpacity onPress={() => saveEditReply(c.id, r.id)} style={styles.editBtn}>
                                        <Text variant="caption" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                                          Save
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity onPress={() => cancelEditReply(c.id, r.id)} style={styles.editBtn}>
                                        <Text variant="caption" style={{ color: theme.colors.textLight }}>Cancel</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity onPress={() => deleteReply(c.id, r.id)} style={styles.editBtn}>
                                        <Text variant="caption" style={{ color: "#ef4444", fontWeight: "700" }}>
                                          Delete
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                )}

                                {/* Long-tap action bar for reply */}
                                {!isEditingThisReply &&
                                  actionTarget?.kind === "reply" &&
                                  actionTarget.cid === c.id &&
                                  actionTarget.rid === r.id && (
                                    <View style={styles.longTapBarReply}>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setActionTarget(null);
                                          startEditReply(c.id, r.id, r.text);
                                        }}
                                      >
                                        <Text variant="caption" style={styles.longTapBtn}>Edit</Text>
                                      </TouchableOpacity>
                                      <Text variant="caption" style={styles.dot}>·</Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setActionTarget(null);
                                          deleteReply(c.id, r.id);
                                        }}
                                      >
                                        <Text variant="caption" style={[styles.longTapBtn, styles.destructive]}>
                                          Delete
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* View more / show replies */}
                    {remaining > 0 && (
                      <View style={styles.centerRow}>
                        <TouchableOpacity onPress={() => handleViewMore(c.id)}>
                          <Text variant="caption" style={[styles.viewMore, { color: theme.colors.textLight }]}>
                            {shown === 0
                              ? `View ${remaining} repl${remaining === 1 ? "y" : "ies"}`
                              : `View ${remaining} more repl${remaining === 1 ? "y" : "ies"}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Inline reply composer */}
                    {composerOpen[c.id] && (
                      <View style={[styles.composerRow, { borderColor: theme.colors.borderColor || "#e5e7eb" }]}>
                        <TextInput
                          placeholder="Write a reply…"
                          placeholderTextColor={theme.colors.textLight}
                          value={draft[c.id] ?? ""}
                          onChangeText={(t) => setDraft((d) => ({ ...d, [c.id]: t }))}
                          style={[styles.input, { color: theme.colors.text }]}
                          multiline
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendReply(c.id)}>
                          <PaperPlaneRightIcon size={18} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text color={theme.colors.text}>No comments yet.</Text>
            )}
            {/* ===== NEW: Top-level comment composer ===== */}
            <View style={[styles.newCommentRow, { borderColor: theme.colors.borderColor || "#e5e7eb" }]}>
              <UserAvatar size={COMMENT_AVATAR} name={CURRENT_USER} />
              <TextInput
                placeholder="Add a comment…"
                placeholderTextColor={theme.colors.textLight}
                value={newComment}
                onChangeText={setNewComment}
                style={[styles.newCommentInput, { color: theme.colors.text }]}
                multiline
              />
              <TouchableOpacity
                style={styles.newCommentSend}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <PaperPlaneRightIcon size={18} color={newComment.trim() ? theme.colors.primary : theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </CustomBottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    // elevation: 3,
    marginBottom: 16,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.12,
    // shadowRadius: 3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  image: { height: 300, width: "100%", borderRadius: 16, marginTop: 16 },
  actions: { flexDirection: "row", gap: 18, marginTop: 16 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  sheetTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },

  // NEW: top-level comment composer
  newCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    marginBottom: 16,
  },
  newCommentInput: { flex: 1, minHeight: 36, maxHeight: 96, paddingTop: 4, paddingBottom: 4 },
  newCommentSend: { padding: 6 },

  // comments
  commentBlock: { marginBottom: 16 },
  commentRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  commentBubble: { flex: 1, borderRadius: 10 },
  commentUser: { fontWeight: "600", marginBottom: 2 },

  commentActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
    marginLeft: COMMENT_AVATAR + 10,
    marginBottom: 16,
  },
  replyBtn: { fontWeight: "600" },

  // replies
  repliesWrap: { marginTop: 8, marginLeft: COMMENT_AVATAR + 10 },
  replyRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
  replyBubble: { flex: 1, borderRadius: 10 },
  replyUser: { fontWeight: "600", marginBottom: 2 },

  replyActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  centerRow: { alignItems: "center", marginTop: 4, marginLeft: COMMENT_AVATAR + 10 },
  viewMore: {},

  // per-comment reply composer
  composerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    marginLeft: COMMENT_AVATAR + 10,
  },
  input: { flex: 1, minHeight: 36, maxHeight: 96, paddingTop: 4, paddingBottom: 4 },
  sendBtn: { padding: 6 },

  // edit UI
  editWrap: { marginTop: 6, gap: 8 },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
  },
  editBtns: { flexDirection: "row", alignItems: "center", gap: 14 },
  editBtn: { paddingVertical: 6 },

  // long-tap action bars
  longTapBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginLeft: COMMENT_AVATAR + 10,
  },
  longTapBarReply: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginLeft: REPLY_AVATAR + 10,
  },
  longTapBtn: { fontWeight: "700" },
  destructive: { color: "#ef4444" },
  dot: { color: theme.colors.textLight },
});

export default memo(PostCard);
