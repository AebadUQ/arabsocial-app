// components/chat/ChatCard.tsx
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";
import { formatDate } from "@/utils";

export default function ChatCard({ chat, onPress }: any) {
  const { theme } = useTheme();

  const partner = chat.chatUser;
  const name = partner?.name || "Unknown";

  // 🔥 Get initials (Aebad → A | Ali Raza → AR)
  const initials = name
    .split(" ")
    .map((x:any) => x.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const hasImage = Boolean(partner?.image);

  // 🔥 Last message content
  const message = chat.lastMessage?.content || "No messages yet";

  const time = chat.lastMessage?.createdAt
    ? formatDate(chat.lastMessage.createdAt)
    : "";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          {hasImage ? (
            <Image source={{ uri: partner.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.initialsCircle, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.initialsText, { color: theme.colors.primary }]}>
                {initials}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1" color={theme.colors.text}>
            {name}
          </Text>

          <Text numberOfLines={1} variant="caption" color={theme.colors.textLight}>
            {message}
          </Text>
        </View>

        <Text variant="overline" color={theme.colors.textLight}>
          {time}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const AVATAR = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },

  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
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
});
