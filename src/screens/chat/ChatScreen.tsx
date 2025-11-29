// screens/ChatScreen.tsx
import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import ChatCard from "@/components/chat/ChatCard";
import TopBar from "@/components/common/TopBar";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMyChatRooms } from "@/api/chat";
import { useSocket } from "@/context/SocketContext";
import { PlusIcon, MagnifyingGlass as SearchIcon, X as XIcon } from "phosphor-react-native";
import LinearGradient from "react-native-linear-gradient";

const PAGE_SIZE = 10;

const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const { socket, onlineUsers } = useSocket();   // ⭐ Online users

  const [search, setSearch] = useState("");

  const chatQuery = useInfiniteQuery({
    queryKey: ["chatRooms"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllMyChatRooms({
        page: pageParam,
        limit: PAGE_SIZE,
      });
      const rooms = res.data || [];
      const meta = res.meta || { page: 1, lastPage: 1 };
      const nextPage = meta.page < meta.lastPage ? pageParam + 1 : undefined;
      return { data: rooms, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const allRooms = useMemo(
    () => chatQuery.data?.pages.flatMap((p) => p.data) || [],
    [chatQuery.data]
  );

  // 🔍 SEARCH
  const filteredRooms = useMemo(() => {
    if (!search.trim()) return allRooms;
    return allRooms.filter((room) => {
      const name = room.chatUser?.name?.toLowerCase() || "";
      const lastMsg = room?.lastMessage?.content?.toLowerCase() || "";
      return (
        name.includes(search.toLowerCase()) ||
        lastMsg.includes(search.toLowerCase())
      );
    });
  }, [search, allRooms]);

  // SOCKET REFRESH
  useEffect(() => {
    if (!socket) return;

    const refresh = () => chatQuery.refetch();
    socket.on("chat_list_update", refresh);
    socket.on("messages_read", refresh);
    socket.on("new_message", refresh);

    return () => {
      socket.off("chat_list_update", refresh);
      socket.off("messages_read", refresh);
      socket.off("new_message", refresh);
    };
  }, [socket]);

  if (chatQuery.isLoading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TopBar />

      {/* 🔍 SEARCH BAR */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search chats..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={styles.searchInput}
          />

          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <XIcon size={16} weight="bold" color="#333" />
            </TouchableOpacity>
          ) : null}

          <SearchIcon size={18} weight="bold" color="#333" />
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => String(item.roomId)}
        renderItem={({ item }) => (
          <ChatCard
            chat={item}
            online={onlineUsers[item.chatUser.id]} // ⭐ ONLINE STATUS HERE
            onPress={() =>
              navigation.navigate("ChatDetail", {
                roomId: item.roomId,
                room: item,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (chatQuery.hasNextPage && !chatQuery.isFetchingNextPage) {
            chatQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("UserListScreen")}
      >
        <LinearGradient
          colors={[theme.colors.primary, "#0f8f5f"]}
          style={styles.fabInner}
        >
          <PlusIcon size={26} color="#fff" weight="bold" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ChatScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerScreen: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchRow: { paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    backgroundColor: "#fff",
    elevation: 4,
  },

  searchInput: { flex: 1, fontSize: 15 },

  listContent: { paddingHorizontal: 20, paddingBottom: 120 },

  separator: { height: 10 },

  fab: { position: "absolute", bottom: 25, right: 20, zIndex: 999 },

  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
  },
});
