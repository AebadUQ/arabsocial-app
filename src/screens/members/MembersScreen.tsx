import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  XCircle as XCircleIcon,
} from "phosphor-react-native";
import Chip from "@/components/common/Chip";
import TopBar from "@/components/common/TopBar";
import {
  getAllUsersWithConnectionStatus,
  getConnectedUsers,
  getPendingConnectionRequests,
  respondToConnectionRequest,
  sendConnectionRequest,
} from "@/api/members";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import MemberCard, { Person } from "@/components/members/MemberCard";

const PAGE_SIZE = 10;

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme.colors?.text ?? "#111827";
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<
    "all" | "connections" | "requests"
  >("all");

  const [acceptedRequests, setAcceptedRequests] = useState<
    Record<string, boolean>
  >({});

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  /* ====== Actions ====== */

  const handleToggle = async (receiverId: string) => {
    try {
      await sendConnectionRequest(Number(receiverId));

      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    } catch (err) {
      console.error("Failed to send connection request", err);
    }
  };

  const handlePendingAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (status === "accepted") {
        setAcceptedRequests((prev) => ({
          ...prev,
          [requestId]: true,
        }));
      }

      await respondToConnectionRequest(Number(requestId), status);

      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    } catch (error) {
      console.error("Failed to update connection status", error);
    }
  };

  /* ====== Infinite Queries (same style as events example) ====== */

  // All Users
 const allUsersQuery = useInfiniteQuery({ queryKey: ["allUsers", debouncedQuery], initialPageParam: 1, enabled: selectedTab === "all", queryFn: async ({ pageParam }) => { const res = await getAllUsersWithConnectionStatus({ page: pageParam, limit: PAGE_SIZE, ...(debouncedQuery ? { search: debouncedQuery } : {}), }); const users: Person[] = res?.data?.data || []; const nextPage = users.length === PAGE_SIZE ? pageParam + 1 : undefined; return { data: users, nextPage }; }, getNextPageParam: (lastPage) => lastPage?.nextPage, });
  // Connected Users
  const connectedUsersQuery = useInfiniteQuery({
    queryKey: ["connectedUsers"],
    initialPageParam: 1,
    enabled: selectedTab === "connections",
    queryFn: async ({ pageParam }) => {
      const res = await getConnectedUsers({
        page: pageParam,
        limit: PAGE_SIZE,
      });

      const users: Person[] = res?.data?.data || [];
      const nextPage = users.length === PAGE_SIZE ? pageParam + 1 : undefined;

      return { data: users, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  // Pending Requests
  const pendingRequestsQuery = useInfiniteQuery({
    queryKey: ["pendingRequests"],
    initialPageParam: 1,
    enabled: selectedTab === "requests",
    queryFn: async ({ pageParam }) => {
      const res = await getPendingConnectionRequests({
        page: pageParam,
        limit: PAGE_SIZE,
      });

      const users: Person[] = res?.data?.data || [];
      const nextPage = users.length === PAGE_SIZE ? pageParam + 1 : undefined;

      return { data: users, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  /* ====== Build list based on active tab ====== */

  const data: Person[] = useMemo(() => {
    let base: Person[] = [];

    if (selectedTab === "all") {
      base =
        allUsersQuery.data?.pages.flatMap((p) => p.data) || [];
    } else if (selectedTab === "connections") {
      base =
        connectedUsersQuery.data?.pages.flatMap((p) => p.data) || [];
    } else if (selectedTab === "requests") {
      base =
        pendingRequestsQuery.data?.pages.flatMap((p) => p.data) || [];
    }

    // mark accepted requests as connected
    base = base.map((user) => ({
      ...user,
      isConnected:
        user.isConnected || !!acceptedRequests[user.requestId],
    }));

    if (!debouncedQuery) return base;

    const q = debouncedQuery;
    return base.filter((item) => {
      const hay = `${item.name} ${item.profession || ""} ${
        item.country || ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [
    selectedTab,
    allUsersQuery.data,
    connectedUsersQuery.data,
    pendingRequestsQuery.data,
    acceptedRequests,
    debouncedQuery,
  ]);

  /* ====== Load More ====== */

  const handleLoadMore = () => {
    if (selectedTab === "all") {
      if (
        allUsersQuery.hasNextPage &&
        !allUsersQuery.isFetchingNextPage
      ) {
        allUsersQuery.fetchNextPage();
      }
    } else if (selectedTab === "connections") {
      if (
        connectedUsersQuery.hasNextPage &&
        !connectedUsersQuery.isFetchingNextPage
      ) {
        connectedUsersQuery.fetchNextPage();
      }
    } else if (selectedTab === "requests") {
      if (
        pendingRequestsQuery.hasNextPage &&
        !pendingRequestsQuery.isFetchingNextPage
      ) {
        pendingRequestsQuery.fetchNextPage();
      }
    }
  };

  const isInitialLoading =
    (selectedTab === "all" && allUsersQuery.isLoading) ||
    (selectedTab === "connections" &&
      connectedUsersQuery.isLoading) ||
    (selectedTab === "requests" &&
      pendingRequestsQuery.isLoading);

  const isFetchingNextPage =
    allUsersQuery.isFetchingNextPage ||
    connectedUsersQuery.isFetchingNextPage ||
    pendingRequestsQuery.isFetchingNextPage;

  /* ====== Helpers ====== */

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.clear();
    Keyboard.dismiss();
  }, []);

  const renderFooter = () =>
    isFetchingNextPage ? (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator size="small" color={dimText} />
      </View>
    ) : null;

  /* ====== UI ====== */

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* Search */}
      <View
        style={[
          styles.searchRow,
          { paddingTop: Math.max(12, insets.top / 3) },
        ]}
      >
        <View style={styles.searchBox}>
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
          <TextInput
            ref={inputRef}
            placeholder="Search by name, profession, location"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <XCircleIcon
                size={18}
                weight="bold"
                color={"rgba(0,0,0,0.4)"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
          <SlidersHorizontalIcon size={16} weight="bold" color={dimText} />
        </TouchableOpacity> */}
      </View>

      {/* Tabs */}
      <View style={styles.chipRow}>
        <Chip
          label="All"
          active={selectedTab === "all"}
          onPress={() => setSelectedTab("all")}
        />
        <Chip
          label="Connections"
          active={selectedTab === "connections"}
          onPress={() => setSelectedTab("connections")}
        />
        <Chip
          label="Requests"
          active={selectedTab === "requests"}
          onPress={() => setSelectedTab("requests")}
        />
      </View>

      {/* Grid List */}
      {isInitialLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color={dimText} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MemberCard
              item={item}
              accepted={!!acceptedRequests[item.requestId]}
              onToggle={handleToggle}
              isPendingTab={selectedTab === "requests"}
              onPendingAction={handlePendingAction}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text>No matches found.</Text>
            </View>
          }
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
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
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default HomeScreen;
