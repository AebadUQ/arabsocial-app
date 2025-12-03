import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { formatDate } from "@/utils";
import { theme } from "@/theme/theme";

export default function MyGroupCard({ group, onPress }: any) {
  const { theme } = useTheme();

  const name = group?.name || "Unknown Group";
  const image = group?.image;
  const members = group?.membersCount || 0;

  const initials = name
    .split(" ")
    .map((x: any) => x.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
console.log("group",group)
const time = group.lastMessage?.createdAt
    ? formatDate(group.lastMessage.createdAt)
    : "";
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.container}>

        {/* IMAGE OR INITIALS */}
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.initialsCircle,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Text
              style={[
                styles.initialsText,
                { color: theme.colors.primary },
              ]}
            >
              {initials}
            </Text>
          </View>
        )}

        {/* NAME + MEMBERS */}
        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1">
            {name}
          </Text>

          <Text numberOfLines={1} variant="caption" color="#777">
            {members} members
          </Text>
        </View>

        {/* RIGHT SIDE EMPTY */}
          <View style={{ alignItems: "flex-end" }}>
                  <Text variant="overline" color={theme.colors.textLight}>
                    {time}
                  </Text>
        
                  {group.unreadCount > 0 && (
                    <View style={styles.unreadBubble}>
                      <Text style={styles.unreadText}>{group.unreadCount}</Text>
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
    borderRadius: AVATAR / 2, // FULL ROUND
  },

  initialsCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2, // FULL ROUND INITIALS
    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: 16,
    fontWeight: "700",
  },

  middle: {
    flex: 1,
  },
    unreadBubble: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  unreadText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

});
