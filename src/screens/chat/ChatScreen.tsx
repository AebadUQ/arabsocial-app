// screens/ChatScreen.tsx
import React, { useMemo } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import ChatCard from "@/components/chat/ChatCard";
import TopBar from "@/components/common/TopBar";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMyChatRooms } from "@/api/chat";

const PAGE_SIZE = 10;

const ChatScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

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

  const handleLoadMore = () => {
    if (chatQuery.hasNextPage && !chatQuery.isFetchingNextPage) {
      chatQuery.fetchNextPage();
    }
  };

  const chatRooms = useMemo(() => {
    return chatQuery.data?.pages.flatMap((p) => p.data) || [];
  }, [chatQuery.data]);

  const renderFooter = () =>
    chatQuery.isFetchingNextPage ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" />
      </View>
    ) : null;

  if (chatQuery.isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const renderChat = ({ item }: any) => (
    <ChatCard
      chat={item}
onPress={() =>
  navigation.navigate("ChatDetail", {
    roomId: item.roomId,
    room: item,
  })
}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TopBar />
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderChat}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verticalListContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  verticalListContent: {
    paddingBottom: 24,
    paddingHorizontal: 10,
  },
  itemSeparator: {
    height: 10,
  },
});

export default ChatScreen;
