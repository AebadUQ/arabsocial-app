// src/components/TopBar.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BellIcon, ListIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import Logo from "@/assets/images/logo.svg";
import { useAuth } from "@/context/Authcontext";
import { getInitials } from "@/utils";

type Props = {
  title?: string;
  avatarUri?: string;
  notificationsCount?: number;
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
  showCenterLogo?: boolean;
};

const TopBar: React.FC<Props> = ({
  avatarUri,
  notificationsCount = 10,
  onMenuPress,
  showCenterLogo = false,
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const initials = getInitials(user?.name); // ✅ SAFE INITIALS

  return (
    <View style={styles.bar}>
      {/* Left: Hamburger */}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onMenuPress}
        style={styles.leftBtn}
      >
        <ListIcon size={18} weight="bold" />
      </TouchableOpacity>

      {/* Center Logo */}
      {showCenterLogo && (
        <View style={styles.centerLogoWrap}>
          <Logo width={80} height={30} />
        </View>
      )}

      {/* Right Side */}
      <View style={styles.rightGroup}>
        {/* Notifications */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            // @ts-ignore
            navigation.navigate("Notifications");
          }}
          style={styles.iconBtn}
        >
          <View>
            <BellIcon size={22} weight="bold" />
            {notificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationsCount > 99 ? "99+" : notificationsCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          // @ts-ignore
          onPress={() => navigation.navigate("ProfileTab")}
          style={styles.avatarWrap}
        >
          {user?.image ? (
            <Image source={{ uri: user?.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.fallback]}>
              <Text style={styles.fallbackTxt}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // LEFT
  leftBtn: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Center Logo
  centerLogoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  // Right Section
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  avatarWrap: {
    marginLeft: 4,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Fallback initials
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  fallbackTxt: { fontSize: 14, fontWeight: "700", color: "#111" },
});

export default TopBar;
