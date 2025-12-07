import { theme } from "@/theme/theme";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  activeTab: "chats" | "explore" | "mygroups";
  setActiveTab: (tab: "chats" | "explore" | "mygroups") => void;
}

export default function TabsHeader({ activeTab, setActiveTab }: Props) {
  return (
    <View style={styles.tabsRow}>
      {/* CHATS TAB */}
      <TouchableOpacity onPress={() => setActiveTab("chats")}>
        <Text
          style={[
            styles.tabText,
            activeTab === "chats" && styles.activeTabText,
            activeTab === "chats" && styles.activePill,
          ]}
        >
          Chats
        </Text>
      </TouchableOpacity>

      {/* EXPLORE GROUPS TAB */}
      <TouchableOpacity onPress={() => setActiveTab("explore")}>
        <Text
          style={[
            styles.tabText,
            activeTab === "explore" && styles.activeTabText,
            activeTab === "explore" && styles.activePill,
          ]}
        >
          Explore Groups
        </Text>
      </TouchableOpacity>

      {/* MY GROUPS TAB */}
      <TouchableOpacity onPress={() => setActiveTab("mygroups")}>
        <Text
          style={[
            styles.tabText,
            activeTab === "mygroups" && styles.activeTabText,
            activeTab === "mygroups" && styles.activePill,
          ]}
        >
          My Groups
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 8,
  },

  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#7d7d7d",
    paddingVertical: 8,
    paddingHorizontal: 18,
  },

  activeTabText: {
    color: theme.colors.textWhite,
    fontWeight: "700",
  },

  activePill: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
});
