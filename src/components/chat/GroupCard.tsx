import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";

interface Props {
  group: any;
  onPress?: () => void;
  onJoin?: () => void;
}

export default function GroupCard({ group, onPress, onJoin }: Props) {
  const { theme } = useTheme();

  const name = group?.name || "Unknown Group";
  const image = group?.image;
  const members = group?.membersCount || 0;

  // Status:
  // accepted | pending | none
  const status = group?.status;

  const initials = name
    .split(" ")
    .map((x: any) => x.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const renderButton = () => {
    if (status === "joined")
      return (
                    <TouchableOpacity style={styles.joinedBtn} onPress={onJoin}>

          <Text style={styles.joinedText}>Joined </Text>
        </TouchableOpacity>
      );

    if (status === "pending")
      return (
          <TouchableOpacity style={styles.pendingBtn} onPress={onJoin}>

          <Text style={styles.pendingText}>Requested</Text>
        </TouchableOpacity>
      );

    return (
      <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
        <Text style={styles.joinText}>Join Now</Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.container}>
        {/* Group Image */}
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
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

        {/* Name + Members */}
        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1">
            {name}
          </Text>

          <Text numberOfLines={1} variant="caption" color="#777">
            {members} members
          </Text>
        </View>

        {/* Status Button */}
        {renderButton()}
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
    borderRadius: 8,
  },

  initialsCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: 16,
    fontWeight: "700",
  },

  middle: { flex: 1 },

  joinBtn: {
    backgroundColor: "#1a8f63",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  joinText: {
    color: "#fff",
    fontWeight: "600",
  },

  joinedBtn: {
    backgroundColor: "#d4ffd4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  joinedText: {
    color: "#16a34a",
    fontWeight: "700",
  },

  pendingBtn: {
    backgroundColor: "#fff4cc",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  pendingText: {
    color: "#b08200",
    fontWeight: "700",
  },
});
