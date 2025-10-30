import React, { memo, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import { ThumbsUpIcon, ChatCircleIcon, DotsThreeVertical } from "phosphor-react-native";
import { theme } from "@/theme/theme";

export type ApiPost = {
  id: number;
  authorId: number;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  isLikedByMe: boolean;
  author: {
    id: number;
    name: string;
    image: string | null;
    country: string | null;
  };
};

type Props = {
  post: ApiPost;
  currentUserId?: number | null;
  onOpenComments?: (post: ApiPost) => void; // parent handles API & bottom sheet
};

const AVATAR = 28;

const UserAvatar = ({ uri, fallback }: { uri: string | null; fallback: string }) => {
  const initials =
    fallback
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "U";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        backgroundColor: "#5F6367",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: AVATAR * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
};

const PostCard: React.FC<Props> = ({ post, currentUserId, onOpenComments }) => {
  const { theme: activeTheme } = useTheme();
  const [liked, setLiked] = useState(post.isLikedByMe);

  const likeCount = post.likes_count + (liked && !post.isLikedByMe ? 1 : 0);
  const isMine = currentUserId != null && post.authorId === currentUserId;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <UserAvatar uri={post.author?.image || null} fallback={post.author?.name || "U"} />
          <View style={{ flex: 1 }}>
            <Text
              variant="caption"
              color={activeTheme.colors.text}
              style={{ textTransform: "capitalize" }}
            >
              {post.author?.name || "Unknown"}
            </Text>
            <Text variant="caption" color={activeTheme.colors.textLight}>
              {post.author?.country || "N/A"}
            </Text>
          </View>
        </View>

        {isMine && (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <DotsThreeVertical size={20} weight="bold" color={activeTheme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {!!post.content && <Text variant="body1" color={activeTheme.colors.text}>{post.content}</Text>}

      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => setLiked((v) => !v)}
          activeOpacity={0.7}
        >
          <ThumbsUpIcon
            size={20}
            color={liked ? activeTheme.colors.primary : activeTheme.colors.text}
            weight={liked ? "fill" : "regular"}
          />
          <Text
            variant="caption"
            color={liked ? activeTheme.colors.primary : activeTheme.colors.text}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => onOpenComments?.(post)}
          activeOpacity={0.7}
        >
          <ChatCircleIcon size={20} color={activeTheme.colors.text} />
          <Text variant="caption" color={activeTheme.colors.text}>
            Comments ({post.comments_count})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
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
});

export default memo(PostCard);
