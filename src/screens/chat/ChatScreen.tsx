import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopBar from "@/components/common/TopBar";
import { useTheme } from "@/theme/ThemeContext";

import ChatsTab from "./ChatsTab";
import ExploreGroupsTab from "./ExploreGroupsTab";
import MyGroupsTab from "./MyGroupTab";
import TabsHeader from "@/components/chat/TabsHeader";
import { useNavigation } from "@react-navigation/native";

export default function ChatScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "chats" | "explore" | "mygroups"
  >("mygroups");

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <TopBar onMenuPress={() => navigation.openDrawer()}  />

      {/* 🔍 SEARCH BAR */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* ⭐ TABS */}
      <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ⭐ TAB CONTENT */}
      {activeTab === "chats" && <ChatsTab search={search} />}
      {activeTab === "explore" && <ExploreGroupsTab search={search} />}
      {activeTab === "mygroups" && <MyGroupsTab search={search} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#fff",
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },
});
