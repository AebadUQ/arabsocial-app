// screens/HomeScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Alert,
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

/* ================= Types ================= */
export type Person = {
  id: string;
  name: string;
  profession?: string;
  country?: string;
  isConnected: boolean;
  requestId: string;
  status: "pending" | "accepted" | "rejected" | string;
  reqOwner?: boolean; // false means THEY sent me the request
};

/* ============== MemberCard ============== */
const MemberCard = ({
  item,
  accepted,
  onToggle,
  isPendingTab,
  onPendingAction,
}: {
  item: Person;
  accepted: boolean; // forced to boolean by parent
  onToggle: (id: string) => void;
  isPendingTab?: boolean;
  onPendingAction?: (
    id: string,
    status: "accepted" | "rejected"
  ) => void;
}) => {
  const { theme } = useTheme();

  // safe colors from theme
  const textLight = theme?.colors?.textLight || "rgba(0,0,0,0.6)";
  const whiteText = theme?.colors?.textWhite || "#fff";
  const primary = theme?.colors?.primary || "#2563EB";

  const isPending = item?.status === "pending";

  // if user already tapped ✅ (optimistic)
  const forceConnected = accepted === true;

  // show ✅/❌ row?
  const shouldShowRowIfPendingTab =
    !!isPendingTab && !!onPendingAction;

  const shouldShowRowIfIncomingPending =
    isPending && item.reqOwner === false && !!onPendingAction;

  const showAcceptRejectRow =
    !forceConnected && (shouldShowRowIfPendingTab || shouldShowRowIfIncomingPending);

  // button label for single button mode
  let btnLabel: string;
  if (forceConnected || item.isConnected) {
    btnLabel = "Connected";
  } else if (isPending) {
    btnLabel = item.reqOwner === false ? "Accept" : "Pending";
  } else {
    btnLabel = "Connect";
  }

  // pick button color
  let btnBg: string = primary;
  if (btnLabel === "Connected") {
    btnBg = "#1E644C";
  } else if (btnLabel === "Pending") {
    btnBg = "#9CA3AF";
  } else if (btnLabel === "Accept") {
    btnBg = primary;
  }

  // tap logic for the single button
  const handleMainPress = () => {
    // If we can Accept
    if (btnLabel === "Accept" && onPendingAction) {
      onPendingAction(item.requestId, "accepted");
      return;
    }

    // If it's Connected and user taps -> treat as reject/remove
    if (btnLabel === "Connected" && onPendingAction) {
      console.log(item)
// Alert.alert("Title", item.requestId);
      onPendingAction(item.requestId , "rejected");
      return;
    }

    // Otherwise do normal connect/send request
    onToggle(item.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.leftWrap}>
          <Avatar />
          <View style={styles.texts}>
            <Text variant="body1" style={{ fontWeight: "500" }}>
              {item.name}
            </Text>
            <Text variant="overline" color={textLight}>
              Profession: {item.profession || "N/A"}
            </Text>
            <Text variant="overline" color={textLight}>
              Location: {item.country || "N/A"}
            </Text>
          </View>
        </View>

        {showAcceptRejectRow ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* ACCEPT ✅ */}
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#1E644C",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() =>
                onPendingAction?.(item.requestId, "accepted")
              }
            >
              <CheckIcon size={12} color={whiteText} />
            </TouchableOpacity>

            {/* REJECT ❌ */}
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#C53030",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() =>
                onPendingAction?.(item.requestId, "rejected")
              }
            >
              <XIcon size={12} color={whiteText} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleMainPress}
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

/* ============== HomeScreen ============== */
const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme?.colors?.text ?? "#111827";

  const queryClient = useQueryClient();

  // tabs
  const [selectedTab, setSelectedTab] = useState<
    "all" | "connections" | "requests"
  >("all");

  // optimistic UI state maps
  const [connectedById, setConnectedById] = useState<Record<string, boolean>>(
    {}
  );
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const [acceptedRequests, setAcceptedRequests] = useState<
    Record<string, boolean>
  >({});

  // search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // send connection request ("Connect")
  const handleToggle = async (receiverId: string) => {
    try {
      await sendConnectionRequest(Number(receiverId));

      // you could also do:
      // setPendingById(prev => ({ ...prev, [receiverId]: true }))

      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["connectedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    } catch (err) {
      console.error("Failed to send connection request", err);
    }
  };

  // accept / reject connection request
  const handlePendingAction = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (status === "accepted") {
        // optimistic: mark request as accepted so card instantly becomes Connected
        setAcceptedRequests((prev) => ({
          ...prev,
          [requestId]: true,
        }));
      }

      await respondToConnectionRequest(Number(requestId), status);

      if (status === "rejected") {
        // optimistic cleanup from pending if rejected/removed
        setPendingById((prev) => {
          const copy = { ...prev };
          delete copy[requestId];
          return copy;
        });

        // also if they tapped Connected and we treated that as reject,
        // we should un-mark it so UI doesn't still show Connected.
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

  /* -------- React Query calls -------- */
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

  /* -------- which list to render -------- */
  const filteredData: Person[] = useMemo(() => {
    let base: Person[] = [];

    if (selectedTab === "all") {
      base = allUsersQuery.data?.data?.data || [];
    } else if (selectedTab === "connections") {
      base = connectedUsersQuery.data?.data?.data || [];
    } else if (selectedTab === "requests") {
      base = pendingRequestsQuery.data?.data?.data || [];
    }

    // apply local overrides if you eventually want:
    base = base?.map((user) => ({
      ...user,
      isConnected: user.isConnected || connectedById[user.id] || false,
      status: user.status,
    }));

    if (!debouncedQuery) return base;

    const q = debouncedQuery;
    return base.filter((item) => {
      const hay = `${item.name} ${item.profession || ""} ${item.country || ""}`.toLowerCase();
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

  /* -------- clear search -------- */
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

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MemberCard
            item={item}
            accepted={!!acceptedRequests[item.requestId]} // force boolean
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

/* ============== Styles ============== */
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
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  texts: { gap: 4, flexShrink: 1 },
  btn: {
    width: 120,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
