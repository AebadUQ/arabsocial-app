import React, { useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMyChatRooms } from "@/api/chat";
import { useNavigation } from "@react-navigation/native";
import ChatCard from "@/components/chat/ChatCard";
import { useSocket } from "@/context/SocketContext";
import { useTheme } from "@/theme/ThemeContext";

import LinearGradient from "react-native-linear-gradient";
import { PlusIcon } from "phosphor-react-native";

const PAGE_SIZE = 10;

export default function ChatsTab({ search }: any) {
  const navigation = useNavigation<any>();
  const { socket, onlineUsers } = useSocket();
  const { theme } = useTheme();

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

  const filteredRooms = useMemo(() => {
    if (!search.trim()) return allRooms;
    return allRooms.filter((room) =>
      room.chatUser?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allRooms]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => chatQuery.refetch();

    socket.on("chat_list_update", refresh);
    socket.on("new_message", refresh);

    return () => {
      socket.off("chat_list_update", refresh);
      socket.off("new_message", refresh);
    };
  }, [socket]);

  if (chatQuery.isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <>
      <FlatList
        data={filteredRooms}
        keyExtractor={(i) => String(i.roomId)}
        renderItem={({ item }) => (
          <ChatCard
            chat={item}
            online={onlineUsers[item.chatUser.id]}
            onPress={() =>
              navigation.navigate("ChatDetail", {
                roomId: item.roomId,
                room: item,
              })
            }
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      />

      {/* ⭐ FAB BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("UserListScreen")}
      >
        <LinearGradient
          colors={[theme.colors.primary, "#0f8f5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <PlusIcon size={26} color="#fff" weight="bold" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    zIndex: 999,
  },

  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
});
