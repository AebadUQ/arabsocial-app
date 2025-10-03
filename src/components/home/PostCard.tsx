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
// import { ChatCircle, ThumbsUp, PaperPlaneTilt } from "phosphor-react-native";
import { ChatCircleIcon,ThumbsUpIcon,PaperPlaneIcon } from "phosphor-react-native";
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
const REVEAL_STEP = 4; // show 4 replies per click

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

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
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

const PostCard: React.FC<Props> = ({ post }) => {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // local list so we can add replies without mutating parent
  const [commentList, setCommentList] = useState<Comment[]>(
    () =>
      post.comments?.map((c) => ({
        ...c,
        replies: Array.isArray(c.replies) ? c.replies : [],
      })) ?? []
  );

  // zero replies shown initially, reveal on tap
  const [shownCounts, setShownCounts] = useState<Record<string, number>>(() => {
    const obj: Record<string, number> = {};
    for (const c of commentList) obj[c.id] = 0;
    return obj;
  });

  // per-comment composer visibility and draft
  const [composerOpen, setComposerOpen] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});

  const totalRenderedComments = useMemo(() => commentList.length, [commentList]);

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
        const newReply: Reply = {
          id: `r-${cid}-${nextIndex}`,
          user: "You",
          text,
          // avatarUri ko sirf tab add karo jab tumhare paas value ho:
          // ...(currentUserAvatar ? { avatarUri: currentUserAvatar } : {}),
        };

        return { ...c, replies: [...(c.replies || []), newReply] };
      })
    );

    // make sure the newly added reply is visible
    setShownCounts((s) => ({ ...s, [cid]: (s[cid] ?? 0) + 1 }));

    setDraft((d) => ({ ...d, [cid]: "" }));
    setComposerOpen((s) => ({ ...s, [cid]: false }));
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.userRow}>
          <UserAvatar
            size={AVATAR}
            name={post.name}
            {...(post.avatarUri ? { uri: post.avatarUri } : {})}
          />
          <View>
            <Text variant="caption" color={theme.colors.text}>
              {post.name} 
            </Text>
            <Text variant="caption" color={theme.colors.textLight}>
              {post.location}
            </Text>
          </View>
        </View>

        {!!post.content && (
          <Text variant="body1" color={theme.colors.text}>
            {post.content}
          </Text>
        )}

        {post.image && <Image source={post.image} style={styles.image} resizeMode="cover" />}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={() => setLiked((v) => !v)}>
            <ThumbsUpIcon size={20} color={liked ? theme.colors.primary : theme.colors.text} />
            <Text variant="caption" color={liked ? theme.colors.primary : theme.colors.text}>
              {post.likes + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => setCommentsVisible(true)}>
            <ChatCircleIcon size={20} color={theme.colors.text} />
            <Text variant="caption" color={theme.colors.text} >
              {post.commentsCount} Comments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomBottomSheet visible={commentsVisible} onClose={() => setCommentsVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
        >
          <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
            Comments ({totalRenderedComments})
          </Text>

          {commentList.length ? (
            commentList.map((c) => {
              const replies = c.replies || [];
              const shown = shownCounts[c.id] ?? 0;
              const remaining = Math.max(0, replies.length - shown);

              return (
                <View key={c.id} style={styles.commentBlock}>
                  {/* Comment row with avatar at the start */}
                  <View style={styles.commentRow}>
                    <UserAvatar
                      size={COMMENT_AVATAR}
                      name={c.user}
                      {...(c.avatarUri ? { uri: c.avatarUri } : {})}
                    />
                    <View style={styles.commentBubble}>
                      <Text
                        style={[styles.commentUser, { color: theme.colors.text }]}
                        variant="caption"
                      >
                        {c.user} <Text                         variant="caption"
 style={{color:theme.colors.textLight}}>30m</Text>
                      </Text>
                      <Text color={theme.colors.text}>{c.text}</Text>
                    </View>
                  </View>

                  {/* Actions under the bubble */}
                  <View style={styles.commentActionsRow}>
                    <TouchableOpacity onPress={() => handleToggleComposer(c.id)}>
                      <Text
                        variant="caption"
                        style={[styles.replyBtn]}
                      >
                        Reply
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Replies (avatar at start of each reply) */}
                  {shown > 0 && (
                    <View style={styles.repliesWrap}>
                      {replies.slice(0, shown).map((r) => (
                        <View key={r.id} style={styles.replyRow}>
                          <UserAvatar
                            size={REPLY_AVATAR}
                            name={r.user}
                            {...(r.avatarUri ? { uri: r.avatarUri } : {})}
                          />
                          <View style={styles.replyBubble}>
                            <Text
                              variant="caption"
                              style={[styles.replyUser, { color: theme.colors.text }]}
                            >
                              {r.user}
                            </Text>
                            <Text color={theme.colors.text}>{r.text}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* View more / show replies */}
                  {remaining > 0 && (
                    <View style={styles.centerRow}>
                      <TouchableOpacity onPress={() => handleViewMore(c.id)}>
                        <Text
                          variant="caption"
                          style={[styles.viewMore, { color: theme.colors.textLight }]}
                        >
                          {shown === 0
                            ? `View ${remaining} repl${remaining === 1 ? "y" : "ies"}`
                            : `View ${remaining} more repl${remaining === 1 ? "y" : "ies"}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Inline reply composer */}
                  {composerOpen[c.id] && (
                    <View
                      style={[
                        styles.composerRow,
                        { borderColor: theme.colors.border || "#e5e7eb" },
                      ]}
                    >
                      <TextInput
                        placeholder="Write a reply…"
                        placeholderTextColor={theme.colors.textLight}
                        value={draft[c.id] ?? ""}
                        onChangeText={(t) => setDraft((d) => ({ ...d, [c.id]: t }))}
                        style={[styles.input, { color: theme.colors.text }]}
                        multiline
                      />
                      <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendReply(c.id)}>
                        <PaperPlaneIcon size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text color={theme.colors.text} >No comments yet.</Text>
          )}
        </KeyboardAvoidingView>
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
    elevation: 3,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  image: {
    height: 300,
    width: "100%",
    borderRadius: 16,
    marginTop: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 18,
    marginTop: 16,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14,textAlign:'center' },

  // comments
  commentBlock: { marginBottom: 16 },
  commentRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  commentBubble: {
    flex: 1,
     borderRadius: 10,
  },
  commentUser: { fontWeight: "600", marginBottom: 2 },

  commentActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
    marginLeft: COMMENT_AVATAR + 10,
    marginBottom:16
  },
  replyBtn: { fontWeight: "600" },

  // replies
  repliesWrap: {
    marginTop: 8,
    marginLeft: COMMENT_AVATAR + 10,
  },
  replyRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
  replyBubble: {
    flex: 1,
    borderRadius: 10,
  },
  replyUser: { fontWeight: "600", marginBottom: 2 },

  centerRow: { alignItems: "center", marginTop: 4, marginLeft: COMMENT_AVATAR + 10 },
  viewMore: {  },

  // composer
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
});

export default memo(PostCard);
