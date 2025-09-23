import React, { useCallback, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PostCard, { Post } from "@/components/home/PostCard";
import { POSTS } from "@/data/home";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const [page, setPage] = useState(1);

  const data = useMemo(() => POSTS.slice(0, PAGE_SIZE * page), [page]);

  const keyExtractor = useCallback((item: Post) => item.id, []);
  const renderItem = useCallback(({ item }: { item: Post }) => <PostCard post={item} />, []);
  const onEndReached = useCallback(() => {
    if (PAGE_SIZE * page < POSTS.length) setPage((p) => p + 1);
  }, [page]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        windowSize={7}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default HomeScreen;
