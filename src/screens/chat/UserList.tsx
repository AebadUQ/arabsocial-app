import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  MagnifyingGlass as SearchIcon,
  X as XIcon,
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getAllChatUsers, initialChat } from "@/api/chat";
import { useSocket } from "@/context/SocketContext";

const PAGE_SIZE = 10;
const AVATAR_SIZE = 42;

/* ---------------- Pagination Helper ---------------- */

type MetaShape = {
  page?: number;
  lastPage?: number;
  nextPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};

function computeNextPage(
  meta: MetaShape | undefined,
  pageParam: number,
  pageSize: number,
  itemsLength: number
): number | undefined {
  if (!meta) return itemsLength === pageSize ? pageParam + 1 : undefined;
  if (typeof meta.nextPage === "number") return meta.nextPage;
  if (meta.hasNextPage === true) return pageParam + 1;
  if (meta.hasNextPage === false) return undefined;
  if (meta.page && meta.totalPages)
    return meta.page < meta.totalPages ? pageParam + 1 : undefined;
  return itemsLength === pageSize ? pageParam + 1 : undefined;
}

/* ---------------- Screen ---------------- */

export default function UserListScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { onlineUsers } = useSocket();

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const queryClient = useQueryClient();
  const fetchingMoreRef = useRef(false);

  const usersQuery = useInfiniteQuery({
    queryKey: ["chatUsers", search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllChatUsers({
        page: pageParam,
        limit: PAGE_SIZE,
        search,
      });

      const items = res.data || [];
      const meta = res.meta || {};
      const nextPage = computeNextPage(meta, pageParam, PAGE_SIZE, items.length);

      return { data: items, nextPage };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
  });

  const users = usersQuery.data?.pages.flatMap((p) => p.data) || [];

  const loadMore = () => {
    if (
      !usersQuery.hasNextPage ||
      usersQuery.isFetchingNextPage ||
      fetchingMoreRef.current
    )
      return;

    fetchingMoreRef.current = true;
    usersQuery.fetchNextPage().finally(() => (fetchingMoreRef.current = false));
  };

  /* ---------------- Select User ---------------- */

  const handleSelectUser = (userObj: any) => {
    setSelectedUser(
      selectedUser?.chatUser?.id === userObj.chatUser.id ? null : userObj
    );
  };

  /* ---------------- Start Chat ---------------- */

  const handleStartChat = async () => {
    if (!selectedUser) return;

    const user = selectedUser.chatUser;

    if (selectedUser.roomId) {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      navigation.navigate("ChatDetail", {
        roomId: selectedUser.roomId,
        targetUser: user,
      });
      return;
    }

    try {
      const res = await initialChat({ user2Id: user.id });
      const newRoomId = res.data.id;

      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      navigation.navigate("ChatDetail", {
        roomId: newRoomId,
        targetUser: user,
      });
    } catch (err) {
      console.log("Room create error:", err);
    }
  };

  /* ---------------- RENDER ITEM ---------------- */

  const renderItem = ({ item }: any) => {
    const user = item.chatUser;
    const name = user?.name || "Unknown";

    const isOnline = onlineUsers?.[user.id] === true;
    const isSelected = selectedUser?.chatUser?.id === user.id;

    const initials = name
      .split(" ")
      .map((x: any) => x.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleSelectUser(item)}
        style={[
          styles.cardContainer,
          isSelected && { backgroundColor: theme.colors.primaryLight },
        ]}
      >
        {/* Avatar + ONLINE DOT */}
        <View style={{ position: "relative" }}>
          {user.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.initialsCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text
                style={[styles.initialsText, { color: theme.colors.primary }]}
              >
                {initials}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        {/* Name */}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} variant="body1" color={theme.colors.text}>
            {name}
          </Text>
        </View>

        {/* RIGHT SIDE ICON */}
        {!isSelected ? (
          <View style={styles.emptyCircle} />
        ) : (
          <View style={styles.checkCircle}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Contact</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search users"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={styles.searchInput}
          />

          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <XIcon size={16} weight="bold" color="#333" />
            </TouchableOpacity>
          ) : null}

          <SearchIcon size={18} weight="bold" color="#333" />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.chatUser.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.25}
        onMomentumScrollBegin={() => (fetchingMoreRef.current = false)}
        ListFooterComponent={
          usersQuery.isFetchingNextPage ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : null
        }
      />

      {selectedUser && (
        <TouchableOpacity style={styles.fab} onPress={handleStartChat}>
          <View style={styles.fabInner}>
            <Text style={styles.fabText}>Message</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 18, fontWeight: "700", marginLeft: 12, color: "#fff" },

  searchRow: { paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    backgroundColor: "#fff",
    elevation: 4,
  },

  searchInput: { flex: 1, fontSize: 15 },

  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderRadius: 10,
    gap: 12,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  initialsCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: 16,
    fontWeight: "700",
  },

  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },

  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#9CA3AF",
  },

  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1BAD7A",
    alignItems: "center",
    justifyContent: "center",
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
  },

  fabInner: {
    backgroundColor: "#1BAD7A",
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
