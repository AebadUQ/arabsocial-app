import React, { useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { getAllGroups, requestToJoin } from "@/api/group";
import GroupCard from "@/components/chat/GroupCard";
import { useTheme } from "@/theme/ThemeContext";

import LinearGradient from "react-native-linear-gradient";
import { PlusIcon } from "phosphor-react-native";
import { useAuth } from "@/context/Authcontext";

const PAGE_SIZE = 10;

export default function ExploreGroupsTab({ search }: any) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
const {user} = useAuth()
  const groupsQuery = useInfiniteQuery({
    queryKey: ["exploreGroups", search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllGroups({
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
    () => groupsQuery.data?.pages.flatMap((p) => p.data) || [],
    [groupsQuery.data]
  );

  const handleJoin = async (groupId: number) => {
    const res = await requestToJoin(groupId);
    const newStatus = res?.data?.status;

    queryClient.setQueryData(["exploreGroups", search], (oldData: any) => {
      if (!oldData) return oldData;
        console.log("newStatus",newStatus)
      return {
        pageParams: oldData.pageParams,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((g: any) =>
            g.id === groupId ? { ...g, status: newStatus } : g
          ),
        })),
      };
    });
  };

  if (groupsQuery.isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <>
      <FlatList
        data={allGroups}
        keyExtractor={(i) => String(i.id)}
       renderItem={({ item }) => (
  <GroupCard
  user={user}
    group={item}
    onJoin={() => handleJoin(item.id)}
    onPress={() => navigation.navigate('GroupInfo', { groupId: item?.id })}
  />
)}

        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        onEndReached={() => {
          if (groupsQuery.hasNextPage && !groupsQuery.isFetchingNextPage) {
            groupsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
      />

      {/* ⭐ CREATE GROUP FAB BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("CreateGroupScreen")}
      >
        <LinearGradient
          colors={[theme.colors.primary, "#0f8f5f"]}
          style={[styles.fabInner]}
        >

          <PlusIcon size={22} color="#fff" weight="bold"  style={{marginLeft:20}}/>

          <Text style={[styles.fabText,{marginRight:20}]}>Create Group</Text>

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
    
    // width:220
  },

  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    height: 55,

    borderRadius: 30,
    justifyContent: "center",
    elevation: 7,
  },

  fabText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    
  },
});
