import React, { useMemo, useEffect } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMyGroups } from "@/api/group";
import { useNavigation } from "@react-navigation/native";
import MyGroupCard from "@/components/chat/MyGroupCard";
import { useSocket } from "@/context/SocketContext"; // Assuming you have a SocketContext
import { useTheme } from "@/theme/ThemeContext";

const PAGE_SIZE = 10;

export default function MyGroupsTab({ search }: any) {
  const navigation = useNavigation<any>();
  const { socket } = useSocket(); // Assuming socket is provided in your context
  const { theme } = useTheme(); // For styling

  // React Query Infinite Query to load group data
  const query = useInfiniteQuery({
    queryKey: ["myGroups", search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllMyGroups({
        page: pageParam,
        limit: PAGE_SIZE,
        search,
      });

      const groups = res.data || [];
      const meta = res.meta || { page: 1, lastPage: 1 };
      const nextPage = meta.page < meta.lastPage ? pageParam + 1 : undefined;
      return { data: groups, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  // All groups fetched using React Query
  const allGroups = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) || [],
    [query.data]
  );

  // Listen for socket events to update the unread count or last message
  useEffect(() => {
    if (!socket) return;

    // Event listener for when a new message is sent in a group
    socket.on("group_chat:new_group_message", (updatedGroup) => {
      // Update the unread count or other properties of the group
      query.refetch();  // Refetch groups data to update the unread count
    });

    // Event listener for marking messages as read
    socket.on("group_chat:messages_read", (updatedGroup) => {
      // Refetch to update unread count after messages are read
      query.refetch();
    });

    return () => {
      socket.off("group_chat:new_group_message");
      socket.off("group_chat:messages_read");
    };
  }, [socket]);

  if (query.isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <FlatList
      data={allGroups}
      keyExtractor={(i) => String(i.id)}
      renderItem={({ item }) => (
        <MyGroupCard
          group={item}
          onPress={() => navigation.navigate("GroupDetail", { group: item })}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.3}
    />
  );
}
