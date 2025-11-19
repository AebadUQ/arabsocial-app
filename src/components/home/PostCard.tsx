import React, {
  memo,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
  NativeSyntheticEvent,
  TextLayoutEventData,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Text } from "@/components";
import {
  DotsThreeVertical,
  ThumbsUp,
  ChatCircle,
  ShareNetwork,
  Trash,
} from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";

export type ApiPost = {
  id: number | string;
  authorId: number | string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  isLikedByMe: boolean;
  author: {
    id: number | string;
    name: string;
    image: string | null;
    country: string | null;
    email?: string | null;
  };
};

type Props = {
  post: ApiPost;
  currentUserId?: number | string | null;
  onOpenComments?: (post: ApiPost) => void;
  onToggleLike?: () => void;
  onDeletePost?: (postId: number | string) => void;
};

const AVATAR = 40;

const UserAvatar = ({
  uri,
  fallback,
}: {
  uri: string | null;
  fallback: string;
}) => {
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
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const getEmailHandle = (email?: string | null): string | null => {
  if (!email) return null;
  const [local] = email.split("@");
  if (!local) return null;
  const clean = local.split("+")[0];
  if (!clean) return null;
  return `@${clean}`;
};

// -------- Time formatter (for "2h ago" etc.) --------
const formatPostTime = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return created.toLocaleDateString();
};

const PostCard: React.FC<Props> = ({
  post,
  currentUserId,
  onOpenComments,
  onToggleLike,
  onDeletePost,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  // see-more/less state
  const [measured, setMeasured] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 3-dot menu
  const [menuVisible, setMenuVisible] = useState(false);

  const emailHandle = useMemo(
    () => getEmailHandle(post.author?.email),
    [post.author?.email]
  );

  const timeLabel = useMemo(
    () => formatPostTime(post.created_at),
    [post.created_at]
  );

  // reset UI toggles when post changes
  useEffect(() => {
    setMeasured(false);
    setShowSeeMore(false);
    setIsExpanded(false);
    setMenuVisible(false);
  }, [post.id, post.content, post.image_url]);

  const liked = post.isLikedByMe;
  const likeCount = post.likes_count;

  const handleLikePress = () => {
    onToggleLike?.();
  };

  const handleShare = () => {
    const msg = `${post.author?.name || "User"}: ${post.content || ""}`;
    Share.share({ message: msg }).catch(() => {});
  };

  const isMine =
    currentUserId != null &&
    String(post.authorId) === String(currentUserId);

  const onMeasureTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (measured) return;
      const { lines } = e.nativeEvent;
      if (lines.length > 4) setShowSeeMore(true);
      setMeasured(true);
    },
    [measured]
  );

  const toggleMenu = () => {
    if (!isMine) return;
    setMenuVisible((v) => !v);
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    onDeletePost?.(post.id);
  };

  console.log("post", post.author.country);

  return (
    <View style={[styles.card, { shadowColor: "#000" }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PublicProfile", { userId: post.author.id })
            }
          >
            <UserAvatar
              uri={post.author?.image || null}
              fallback={post.author?.name || "U"}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            {/* 🔥 Name + handle (left) | Time (right) */}
            <View style={styles.nameRow}>
              <View style={styles.nameHandleWrap}>
                <Text
                  variant="body1"
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {post.author?.name || "Unknown"}
                </Text>

                {!!emailHandle && (
                  <Text
                    variant="caption"
                    style={styles.userHandle}
                    numberOfLines={1}
                  >
                    {emailHandle}
                  </Text>
                )}
              </View>

              <Text
                variant="overline"
                style={styles.postTime}
                numberOfLines={1}
              >
                {timeLabel}
              </Text>
            </View>

            {/* Location (only left) */}
            <Text
              variant="overline"
              style={styles.userLocation}
              numberOfLines={1}
            >
              {post.author?.country || "N/A"}
            </Text>
          </View>
        </View>

        {isMine && (
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={toggleMenu}
            >
              <DotsThreeVertical
                size={20}
                weight="bold"
                color={theme.colors.text}
              />
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDeletePress}
                >
                  <Trash size={16} color="#DC2626" />
                  <Text
                    variant="caption"
                    style={styles.menuItemText}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      {!!post.content && (
        <View style={{ marginTop: 4 }}>
          {/* hidden measure text */}
          {!measured && (
            <Text
              variant="body2"
              style={[
                styles.contentText,
                { position: "absolute", opacity: 0 },
              ]}
              onTextLayout={onMeasureTextLayout}
            >
              {post.content}
            </Text>
          )}

          {/* visible text */}
          <Text
            variant="body2"
            style={styles.contentText}
            numberOfLines={showSeeMore && !isExpanded ? 4 : undefined}
            ellipsizeMode={showSeeMore && !isExpanded ? "tail" : "clip"}
          >
            {post.content}
          </Text>

          {showSeeMore && !isExpanded && (
            <TouchableOpacity
              onPress={() => setIsExpanded(true)}
              activeOpacity={0.7}
              style={{ alignSelf: "flex-start" }}
            >
              <Text
                variant="caption"
                style={[
                  styles.seeMoreText,
                  { color: theme.colors.primary },
                ]}
              >
                See more
              </Text>
            </TouchableOpacity>
          )}

          {showSeeMore && isExpanded && (
            <TouchableOpacity
              onPress={() => setIsExpanded(false)}
              activeOpacity={0.7}
              style={{ alignSelf: "flex-start" }}
            >
              <Text
                variant="caption"
                style={[
                  styles.seeMoreText,
                  { color: theme.colors.primary },
                ]}
              >
                See less
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Image (no preview) */}
      {!!post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.action}
          onPress={handleLikePress}
          activeOpacity={0.7}
        >
          <ThumbsUp
            size={18}
            weight={liked ? "fill" : "regular"}
            color={liked ? theme.colors.primary : "#5F6367"}
          />
          <Text
            variant="caption"
            style={[
              styles.actionLabel,
              liked && {
                color: theme.colors.primary,
              },
            ]}
          >
            Like
            {likeCount > 0 ? `· ${likeCount}` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => onOpenComments?.(post)}
          activeOpacity={0.7}
        >
          <ChatCircle size={18} color="#5F6367" />
          <Text
            variant="caption"
            style={styles.actionLabel}
          >
            Comment
            {post.comments_count > 0
              ? `· ${post.comments_count}`
              : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <ShareNetwork size={18} color="#5F6367" />
          <Text
            variant="caption"
            style={styles.actionLabel}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarFallback: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: "#5F6367",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontWeight: "700",
    fontSize: AVATAR * 0.4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // name+email left, time right
  },
  nameHandleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  userName: {
    textTransform: "capitalize",
  },
  userHandle: {
    color: "#7E8A97",
  },
  postTime: {
    color: "#9EA6B2",
    marginLeft: 8,
  },
  userLocation: {
    color: "#9EA6B2",
    marginTop: 2,
  },
  contentText: {
    color: "#1F2933",
    lineHeight: 20,
  },
  seeMoreText: {
    marginTop: 2,
    fontWeight: "500",
  },
  image: {
    marginTop: 12,
    width: "100%",
    height: 220,
    borderRadius: 18,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 10,
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    color: "#5F6367",
  },
  menuContainer: {
    position: "absolute",
    top: 22,
    right: 0,
    minWidth: 110,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  menuItemText: {
    color: "#DC2626",
  },
});

export default memo(PostCard);
