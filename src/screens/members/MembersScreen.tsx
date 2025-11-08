// src/screens/HomeScreen.tsx

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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MemberCard, { Person } from "@/components/members/MemberCard";

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme?.colors?.text ?? "#111827";
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<
    "all" | "connections" | "requests"
  >("all");

  const [connectedById, setConnectedById] = useState<Record<string, boolean>>(
    {}
  );
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const [acceptedRequests, setAcceptedRequests] = useState<
    Record<string, boolean>
  >({});

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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

      if (status === "rejected") {
        setPendingById((prev) => {
          const copy = { ...prev };
          delete copy[requestId];
          return copy;
        });

        setAcceptedRequests((prev) => {
          const copy = { ...prev };
          delete copy[requestId];
          return copy;
        });
      }

      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    } catch (error) {
      console.error("Failed to update connection status", error);
    }
  };

  const allUsersQuery = useQuery({
    queryKey: ["allUsers", debouncedQuery],
    queryFn: () =>
      getAllUsersWithConnectionStatus({
        page: 1,
        limit: 10,
        search: debouncedQuery,
      }),
    enabled: selectedTab === "all",
  });

  const connectedUsersQuery = useQuery({
    queryKey: ["connectedUsers", debouncedQuery],
    queryFn: () => getConnectedUsers({ page: 1, limit: 10 }),
    enabled: selectedTab === "connections",
  });

  const pendingRequestsQuery = useQuery({
    queryKey: ["pendingRequests", debouncedQuery],
    queryFn: () => getPendingConnectionRequests({ page: 1, limit: 10 }),
    enabled: selectedTab === "requests",
  });

  const filteredData: Person[] = useMemo(() => {
    let base: Person[] = [];

    if (selectedTab === "all") {
      base = allUsersQuery.data?.data?.data || [];
    } else if (selectedTab === "connections") {
      base = connectedUsersQuery.data?.data?.data || [];
    } else if (selectedTab === "requests") {
      base = pendingRequestsQuery.data?.data?.data || [];
    }

    base = base?.map((user) => ({
      ...user,
      isConnected: user.isConnected || connectedById[user.id] || false,
      status: user.status,
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
    connectedById,
    pendingById,
    debouncedQuery,
  ]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.clear();
    Keyboard.dismiss();
  }, []);

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

        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
          <SlidersHorizontalIcon size={16} weight="bold" color={dimText} />
        </TouchableOpacity>
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

      {/* Grid List - 2 columns */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text>No matches found.</Text>
          </View>
        }
      />
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