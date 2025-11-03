import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  XCircle as XCircleIcon,
  Plus as PlusIcon,
} from "phosphor-react-native";
import TopBar from "@/components/common/TopBar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllApprovedBusiness } from "@/api/business";
import { useNavigation } from "@react-navigation/native";

type ApiBusiness = {
  id: string | number;
  name: string;
  categories?: string[];
  business_logo?: string | null | undefined;
  about_me?: string | null;
  city?: string | null;
  country?: string | null;
  business_type?: "online" | "physical" | "hybrid" | string | null;
  promo_code?: string | null;
  discount?: string | null;
};

const CARD_RADIUS = 12;
const LIMIT = 10;

// ------- Card -------
const BusinessCard = ({ item }: { item: ApiBusiness }) => {
  const { theme } = useTheme();
    const navigation = useNavigation<any>(); // if you have typed RootStackParamList, replace `any`
  
  const category = item.categories?.[0] ?? "—";
  const location = [item.city, item.country].filter(Boolean).join(", ");
  const logoUri = item.business_logo || "";
const handlePress = () => {
    console.log(item.id)
    // go to detail screen and pass id
    navigation.navigate("BusinessDetail", { businessId: item.id });
  };
  return (
     <TouchableOpacity
          style={[styles.cardWrap, { backgroundColor: "#fff" }]}
          activeOpacity={0.9}
          onPress={handlePress}
        >
      <View style={styles.cardImgWrap}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.cardImg,
              { backgroundColor: (theme.colors as any)?.darkGray || "rgba(0,0,0,0.06)" },
            ]}
          />
        )}

        {!!item.promo_code && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text variant="overline" style={{ color: "#fff", fontWeight: "700" }}>
              {item.promo_code}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text variant="body1" style={{ fontWeight: "600" }}>{item.name}</Text>

        <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Text variant="overline" color={theme.colors.textLight}>Category: {category}</Text>
          {location ? (
            <Text variant="overline" color={theme.colors.textLight}> • {location}</Text>
          ) : null}
          {item.business_type ? (
            <Text variant="overline" color={theme.colors.textLight}> • {item.business_type}</Text>
          ) : null}
        </View>

        {!!item.about_me && (
          <Text variant="caption" color={theme.colors.textLight} style={{ marginTop: 6 }} numberOfLines={2}>
            {item.about_me}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ------- Screen -------
const BusinessScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const dimText = theme.colors?.text ?? "#111827";

  // Prevent double firing of onEndReached
  const fetchingMoreRef = useRef(false);

  const {
    data,
    isLoading,
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

      // Expect server like:
      // { data: ApiBusiness[], meta?: { page:number, nextPage?:number, hasNextPage?:boolean, totalPages?:number } }
      const items: ApiBusiness[] =
        (res?.data?.data as ApiBusiness[]) ??
        (res?.data as ApiBusiness[]) ??
        [];

      const meta = (res?.data?.meta ?? {}) as {
        page?: number;
        nextPage?: number | null;
        hasNextPage?: boolean;
        totalPages?: number;
      };

      // Prefer server meta; fallback to heuristic
      let nextPage: number | undefined = undefined;
      if (typeof meta.nextPage !== "undefined") {
        nextPage = meta.nextPage ?? undefined;
      } else if (typeof meta.hasNextPage !== "undefined" && typeof pageParam === "number") {
        nextPage = meta.hasNextPage ? pageParam + 1 : undefined;
      } else if (
        typeof meta.totalPages !== "undefined" &&
        typeof meta.page !== "undefined" &&
        typeof pageParam === "number"
      ) {
        nextPage = meta.page < meta.totalPages ? pageParam + 1 : undefined;
      } else if (typeof pageParam === "number") {
        nextPage = items.length === LIMIT ? pageParam + 1 : undefined;
      }

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

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || fetchingMoreRef.current) return;
    fetchingMoreRef.current = true;
    fetchNextPage().finally(() => {
      fetchingMoreRef.current = false;
    });
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* Search */}
      <View style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}>
        <View style={styles.searchBox}>
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
          <TextInput
            ref={inputRef}
            value={search}
            onChangeText={setSearch}
            placeholder="Search businesses"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <XCircleIcon size={18} weight="bold" color={"rgba(0,0,0,0.4)"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 8 }}>Loading businesses...</Text>
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom + 72 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate("BusinessDetail" as never, { business: item } as never)}
            >
              <BusinessCard item={item} />
            </TouchableOpacity>
          )}
          // ↓ Debounce + guard
          onMomentumScrollBegin={() => { fetchingMoreRef.current = false; }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          removeClippedSubviews
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text>
                No businesses found
                {selectedCategory ? ` in ${selectedCategory}` : ""}
                {search ? ` for “${search}”` : ""}.
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary, bottom: (insets.bottom || 16) + 16 },
        ]}
        onPress={() => navigation.navigate("CreateBusiness" as never)}
        accessibilityRole="button"
        accessibilityLabel="Add new business"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <PlusIcon size={26} weight="bold" color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },

  // Search + Filter
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: { flex: 1, paddingVertical: 0 },

  // Card
  cardWrap: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardImgWrap: {
    position: "relative",
    width: "100%",
    height: 160,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: { paddingHorizontal: 12, paddingVertical: 12 },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default BusinessScreen;
