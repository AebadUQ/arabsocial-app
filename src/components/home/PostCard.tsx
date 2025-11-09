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
  onDeletePost?: (postId: number | string) => void; // ✅ new
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

// helper: convert email -> @handle
const getEmailHandle = (email?: string | null): string | null => {
  if (!email) return null;
  const [local] = email.split("@");
  if (!local) return null;
  const clean = local.split("+")[0];
  if (!clean) return null;
  return `@${clean}`;
};

const PostCard: React.FC<Props> = ({
  post,
  currentUserId,
  onOpenComments,
  onToggleLike,
  onDeletePost,
}) => {
  const { theme } = useTheme();

  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  // text toggle: See more / See less
  const [measured, setMeasured] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 3-dot menu
  const [menuVisible, setMenuVisible] = useState(false);

  const emailHandle = useMemo(
    () => getEmailHandle(post.author?.email),
    [post.author?.email]
  );

  useEffect(() => {
    setLiked(post.isLikedByMe);
    setLikeCount(post.likes_count);
    setMeasured(false);
    setShowSeeMore(false);
    setIsExpanded(false);
    setMenuVisible(false);
  }, [post.isLikedByMe, post.likes_count, post.content, post.id]);

  const handleLikePress = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => Math.max(0, c + (liked ? -1 : 1)));
    onToggleLike?.();
  };

  const handleShare = () => {
    const msg = `${post.author?.name || "User"}: ${
      post.content || ""
    }`;
    Share.share({ message: msg }).catch(() => {});
  };

  const isMine =
    currentUserId != null &&
    String(post.authorId) === String(currentUserId);

  const onMeasureTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (measured) return;
      const { lines } = e.nativeEvent;
      if (lines.length > 2) setShowSeeMore(true);
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
    console.log("ssss",post.id)
    onDeletePost?.(post.id);
  };

  return (
    <View style={[styles.card, { shadowColor: "#000" }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <UserAvatar
            uri={post.author?.image || null}
            fallback={post.author?.name || "U"}
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
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
            numberOfLines={
              showSeeMore && !isExpanded ? 2 : undefined
            }
            ellipsizeMode={
              showSeeMore && !isExpanded
                ? "tail"
                : "clip"
            }
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
            color={
              liked
                ? theme.colors.primary
                : "#5F6367"
            }
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
            {likeCount > 0
              ? `· ${likeCount}`
              : ""}
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
          <ShareNetwork
            size={18}
            color="#5F6367"
          />
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

/* ------------------------- Styles ------------------------- */
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
  userName: {
    textTransform: "capitalize",
  },
  userHandle: {
    color: "#7E8A97",
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
  // menu
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
