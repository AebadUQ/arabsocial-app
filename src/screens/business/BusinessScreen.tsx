// screens/Business/BusinessScreen.tsx
import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import TopBar from "@/components/common/TopBar";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getAllApprovedBusiness,
  getAllMyBusiness,
  getAllFeaturedBusinesses,
} from "@/api/business";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import SearchBar from "@/components/business/SearchBar";
import AddFab from "@/components/business/FabButton";
import BusinessCard, {
  ApiBusiness as ApiBusinessBase,
} from "@/components/business/BusinessCard";
import FeaturedBusinessCard from "@/components/business/FeaturedBusinessCard";
import MyBusinessCard from "@/components/business/MyBusinessCard";
import { Star, SuitcaseIcon } from "phosphor-react-native";

// -------- Types --------
type ApiBusiness = ApiBusinessBase & {
  open_positions?: number | null;
  is_featured?: boolean | null;
  promo_code?: string | null;
};

// -------- Constants --------
const LIMIT = 10;
const MY_LIMIT = 12;
const FEATURE_LIMIT = 10;

// -------- Pagination helper --------
type MetaShape = {
  nextPage?: number | null;
  hasNextPage?: boolean;
  page?: number;
  totalPages?: number;
};

function computeNextPage(
  meta: MetaShape | undefined,
  pageParam: number,
  pageSize: number,
  itemsLength: number
): number | undefined {
  if (meta && typeof meta.nextPage === "number") return meta.nextPage;
  if (meta && meta.hasNextPage === true) return pageParam + 1;
  if (meta && meta.hasNextPage === false) return undefined;
  if (meta && typeof meta.page === "number" && typeof meta.totalPages === "number") {
    return meta.page < meta.totalPages ? pageParam + 1 : undefined;
  }
  return itemsLength === pageSize ? pageParam + 1 : undefined;
}

/* ---------------- Horizontal: My Businesses ---------------- */
const MyBusinessesRow = () => {
  const { theme } = useTheme();
  const fetchingMoreRef = useRef(false);

  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["myBusinesses"],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const res = await getAllMyBusiness({ page: pageParam as number, limit: MY_LIMIT });
        const raw = (res?.data?.data as any[]) ?? (res?.data as any[]) ?? res ?? [];
        const items: ApiBusiness[] = raw.map((b) => ({
          ...b,
          open_positions: b?.open_positions ?? b?.jobs_count ?? b?.openJobs ?? 0,
        }));
        const meta = (res?.data?.meta ?? {}) as MetaShape;
        const nextPage = computeNextPage(meta, pageParam as number, MY_LIMIT, items.length);
        return { data: items, nextPage };
      },
      getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
    });

  const myBusinesses: ApiBusiness[] = useMemo(
    () => data?.pages?.flatMap((p: any) => p.data) || [],
    [data]
  );

  if (isPending) {
    return (
      <View style={{ paddingBottom: 8 }}>
         <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 10,
        }}
      >
        <SuitcaseIcon  color={theme.colors.primary} size={16} />
        <Text variant="body1">My Business</Text>
      </View>

        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!myBusinesses.length) return null;

  return (
    <View style={{ paddingBottom: 8 }}>
         <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 10,
        }}
      >
        <SuitcaseIcon  color={theme.colors.primary} size={16} />
        <Text variant="body1">My Businesses</Text>
      </View>

      <FlatList
        data={myBusinesses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{  paddingBottom: 6 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <MyBusinessCard item={item} />}
        onEndReached={() => {
          if (!hasNextPage || isFetchingNextPage || fetchingMoreRef.current) return;
          fetchingMoreRef.current = true;
          fetchNextPage().finally(() => (fetchingMoreRef.current = false));
        }}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          fetchingMoreRef.current = false;
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 6 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
};

/* ---------------- Horizontal: Featured Businesses ---------------- */
const FeaturedBusinessesRow = () => {
  const { theme } = useTheme();
  const fetchingMoreRef = useRef(false);

  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["featuredBusinesses"],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const res = await getAllFeaturedBusinesses({
          page: pageParam as number,
          limit: FEATURE_LIMIT,
        });
        const raw = (res?.data?.data as any[]) ?? (res?.data as any[]) ?? res ?? [];
        const items: ApiBusiness[] = raw.map((b) => ({
          ...b,
          open_positions: b?.open_positions ?? b?.jobs_count ?? b?.openJobs ?? 0,
          is_featured: b?.is_featured ?? true,
        }));
        const meta = (res?.data?.meta ?? {}) as MetaShape;
        const nextPage = computeNextPage(meta, pageParam as number, FEATURE_LIMIT, items.length);
        return { data: items, nextPage };
      },
      getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
    });

  const featured: ApiBusiness[] = useMemo(
    () => data?.pages?.flatMap((p: any) => p.data) || [],
    [data]
  );

  if (isPending) {
    return (
      <View style={{ paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text variant="body1">Featured</Text>
        </View>
        <ActivityIndicator />
      </View>
    );
  }

  if (!featured.length) return null;

  return (
    <View style={{ paddingBottom: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 10,
        }}
      >
        <Star weight="fill" color={theme.colors.primary} size={16} />
          <Text variant="body1">Featured</Text>
      </View>

      <FlatList
        data={featured}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{  paddingBottom: 6 }}
        renderItem={({ item }) => <FeaturedBusinessCard item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (!hasNextPage || isFetchingNextPage || fetchingMoreRef.current) return;
          fetchingMoreRef.current = true;
          fetchNextPage().finally(() => (fetchingMoreRef.current = false));
        }}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          fetchingMoreRef.current = false;
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 6 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
};

/* ---------------- Main Screen (one vertical FlatList controls page scroll) ---------------- */
const BusinessScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [selectedCategory] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  const fetchingMoreRef = useRef(false);

  const {
    data,
    isPending,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["approvedBusinesses", selectedCategory, search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllApprovedBusiness({
        page: pageParam as number,
        limit: LIMIT,
        ...(search ? { search } : {}),
        ...(selectedCategory ? { categories: selectedCategory } : {}),
      });

      const items: ApiBusiness[] =
        (res?.data?.data as ApiBusiness[]) ?? (res?.data as ApiBusiness[]) ?? [];

      const meta = (res?.data?.meta ?? {}) as MetaShape;
      const nextPage = computeNextPage(meta, pageParam as number, LIMIT, items.length);

      return { data: items, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
  });

  const businesses: ApiBusiness[] = useMemo(
    () => data?.pages?.flatMap((p: any) => p.data) || [],
    [data]
  );

  const clearSearch = useCallback(() => {
    setSearch("");
    inputRef.current?.clear();
    Keyboard.dismiss();
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* ONE vertical FlatList controls the entire page scroll, with a big header */}
      <FlatList
        data={businesses}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BusinessCard item={item} />}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom + 72 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ display: "flex", gap: 24 }}>
            <SearchBar ref={inputRef} value={search} onChange={setSearch} onClear={clearSearch} />
            <FeaturedBusinessesRow />
            <MyBusinessesRow />
               <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 10,
        }}
      >
        <Text variant="body1">All Businesses</Text>
      </View>

          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 8 }}>Loading businesses...</Text>
            </View>
          ) : (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text>No businesses found{search ? ` for “${search}”` : ""}.</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View >
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (!hasNextPage || isFetchingNextPage || fetchingMoreRef.current) return;
          fetchingMoreRef.current = true;
          fetchNextPage().finally(() => {
            fetchingMoreRef.current = false;
          });
        }}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          fetchingMoreRef.current = false;
        }}
        refreshing={isPending}
        onRefresh={refetch}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
      />

      {/* FAB */}
      <AddFab
        color={theme.colors.primary}
        bottom={(insets.bottom || 16) + 16}
        onPress={() => nav.navigate("CreateBusiness" as never)}
      />
    </SafeAreaView>
  );
};

export default BusinessScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
});
