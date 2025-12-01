import React, { useMemo } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMyGroups } from "@/api/group";
import { useNavigation } from "@react-navigation/native";
import MyGroupCard from "@/components/chat/MyGroupCard";

const PAGE_SIZE = 10;

export default function MyGroupsTab({ search }: any) {
  const navigation = useNavigation<any>();

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

  const allGroups = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) || [],
    [query.data]
  );

  const handleLeave = async (groupId: number) => {
    // await leaveGroup(groupId);
    query.refetch();
  };

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
          onLeave={() => handleLeave(item.id)}
          onPress={() => navigation.navigate("GroupDetail", { id: item.id })}
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
