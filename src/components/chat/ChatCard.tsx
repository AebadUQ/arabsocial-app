import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { formatDate } from "@/utils";

export default function ChatCard({ chat, online, onPress }: any) {
  const { theme } = useTheme();

  const partner = chat.chatUser;
  const name = partner?.name || "Unknown";

  const initials = name
    .split(" ")
    .map((x: any) => x.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const hasImage = Boolean(partner?.image);
  const message = chat.lastMessage?.content || "No messages yet";

  const time = chat.lastMessage?.createdAt
    ? formatDate(chat.lastMessage.createdAt)
    : "";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.container}>
        {/* AVATAR WRAPPER */}
        <View style={{ position: "relative" }}>
          {hasImage ? (
            <Image source={{ uri: partner.image }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.initialsCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text style={[styles.initialsText, { color: theme.colors.primary }]}>
                {initials}
              </Text>
            </View>
          )}

          {/* 🟢🟤 ONLINE / OFFLINE DOT */}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: online ? "#00D26A" : "#9E9E9E" }, // green / gray
            ]}
          />
        </View>

        {/* NAME + LAST MESSAGE */}
        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1" color={theme.colors.text}>
            {name}
          </Text>

          <Text
            numberOfLines={1}
            variant="caption"
            color={theme.colors.textLight}
          >
            {message}
          </Text>
        </View>

        {/* TIME + UNREAD BADGE */}
        <View style={{ alignItems: "flex-end" }}>
          <Text variant="overline" color={theme.colors.textLight}>
            {time}
          </Text>

          {chat.unreadCount > 0 && (
            <View style={styles.unreadBubble}>
              <Text style={styles.unreadText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const AVATAR = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    gap: 12,
  },

  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },

  initialsCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: 16,
    fontWeight: "700",
  },

  middle: { flex: 1 },

  unreadBubble: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // ⭐ ONLINE / OFFLINE DOT
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
