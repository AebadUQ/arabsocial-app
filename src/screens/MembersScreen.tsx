// screens/HomeScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CheckIcon,
  XIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  XCircle as XCircleIcon,
} from "phosphor-react-native";
import Avatar from "@/components/common/Avatar";
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

type Person = {
  id: string;
  name: string;
  profession?: string;
  country?: string;
  isConnected: boolean;
  requestId: any;
  status: any;
};

// ---------- Member Card ----------
const MemberCard = ({
  item,
  onToggle,
  isPendingTab,
  onPendingAction,
}: {
  item: Person;
  onToggle: (id: string) => void;
  isPendingTab?: boolean;
  onPendingAction?: (id: string, status: "accepted" | "rejected") => void;
}) => {
  const { theme } = useTheme();

  // Determine button label & color'
  const btnLabel =  item.isConnected ? "Connected" :item.status === "pending" ? "Pending"  :  "Connect";

console.log(",,,,,",item)
  const btnBg =
    item.status === "pending"
      ? "#9CA3AF"
      : item.isConnected
      ? "#1E644C"
      : theme.colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.leftWrap}>
          <Avatar />
          <View style={styles.texts}>
            <Text variant="body1" style={{ fontWeight: "500" }}>
              {item.name}
            </Text>
            <Text variant="overline" color={theme.colors.textLight}>
              Profession: {item.profession || "N/A"}
            </Text>
            <Text variant="overline" color={theme.colors.textLight}>
              Location: {item.country || "N/A"}
            </Text>
          </View>
        </View>

        {isPendingTab && onPendingAction ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#1E644C",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => onPendingAction(item.id, "accepted")}
            >
              <CheckIcon size={12} color={theme.colors.textWhite} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#C53030",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => onPendingAction(item.requestId, "rejected")}
            >
              <XIcon size={12} color={theme.colors.textWhite} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onToggle(item.id)}
            style={[styles.btn, { backgroundColor: btnBg }]}
          >
            <Text variant="caption" color="#fff">
              {btnLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ---------- Home Screen ----------
const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme.colors?.text ?? "#111827";

  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<"all" | "connections" | "requests">("all");
  const [connectedById, setConnectedById] = useState<Record<string, boolean>>({});
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // ---------- Handle Send Connection ----------
  const handleToggle = async (receiverId: string) => {
    try {
      await sendConnectionRequest(Number(receiverId));

      // Update local UI state: Pending is removed, button shows Connect
     

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    } catch (err) {
      console.error("Failed to send connection request", err);
    }
  };

  // ---------- Handle Pending Requests ----------
  const handlePendingAction = async (id: string, status: "accepted" | "rejected") => {
    try {
      await respondToConnectionRequest(Number(id), status);

      // Remove from pending locally
      setPendingById((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
    } catch (error) {
      console.error("Failed to update connection status", error);
    }
  };

  // ---------------- React Query ----------------
  const allUsersQuery = useQuery({
    queryKey: ["allUsers", debouncedQuery],
    queryFn: () =>
      getAllUsersWithConnectionStatus({ page: 1, limit: 10, search: debouncedQuery }),
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

  // ---------------- Decide which data to show ----------------
  const filteredData: Person[] = useMemo(() => {
    let base: Person[] = [];

    if (selectedTab === "all") base = allUsersQuery.data?.data?.data || [];
    else if (selectedTab === "connections") base = connectedUsersQuery.data?.data?.data || [];
    else if (selectedTab === "requests") base = pendingRequestsQuery.data?.data?.data || [];

    // Apply local isConnected & pending toggle
    base = base?.map((user) => ({
      ...user,
      isConnected:  user.isConnected,
      status: user.status,
    }));

    if (!debouncedQuery) return base;

    return base.filter((item) => {
      const hay = `${item.name} ${item.profession || ""} ${item.country || ""}`.toLowerCase();
      return hay.includes(debouncedQuery);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* Search */}
      <View style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}>
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
              <XCircleIcon size={18} weight="bold" color={"rgba(0,0,0,0.4)"} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
          <SlidersHorizontalIcon size={16} weight="bold" color={dimText} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.chipRow}>
        <Chip label="All" active={selectedTab === "all"} onPress={() => setSelectedTab("all")} />
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

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MemberCard
            item={item}
            onToggle={() => handleToggle(item.id)}
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

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, marginBottom: 32 },
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
  chipRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 32, alignItems: "center" },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(0,0,0,0.1)", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  leftWrap: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  texts: { gap: 4, flexShrink: 1 },
  btn: { width: 120, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});

export default HomeScreen;
