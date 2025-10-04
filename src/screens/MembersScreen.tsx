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
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  XCircle as XCircleIcon,
} from "phosphor-react-native";
import Avatar from "@/components/common/Avatar";
import Chip from "@/components/common/Chip";
import TopBar from "@/components/common/TopBar";

type Person = {
  id: string;
  title: string;
  profession: string;
  location: string;
};

// ✅ 10 users with different professions & locations
const SAMPLE_DATA: Person[] = [
  {
    id: "1",
    title: "Ali Khan",
    profession: "Software Engineer",
    location: "Karachi, Pakistan",
  },
  {
    id: "2",
    title: "Sarah Ahmed",
    profession: "Product Designer",
    location: "Dubai, UAE",
  },
  {
    id: "3",
    title: "John Williams",
    profession: "Marketing Manager",
    location: "London, UK",
  },
  {
    id: "4",
    title: "Ayesha Noor",
    profession: "Data Analyst",
    location: "Lahore, Pakistan",
  },
  {
    id: "5",
    title: "David Smith",
    profession: "Financial Advisor",
    location: "New York, USA",
  },
  {
    id: "6",
    title: "Fatima Al-Mansouri",
    profession: "UI/UX Designer",
    location: "Abu Dhabi, UAE",
  },
  {
    id: "7",
    title: "Mohammed Hassan",
    profession: "Project Manager",
    location: "Riyadh, Saudi Arabia",
  },
  {
    id: "8",
    title: "Emma Brown",
    profession: "HR Specialist",
    location: "Toronto, Canada",
  },
  {
    id: "9",
    title: "Omar Siddiqui",
    profession: "Mobile Developer",
    location: "Doha, Qatar",
  },
  {
    id: "10",
    title: "Laura Chen",
    profession: "Business Analyst",
    location: "Singapore",
  },
];

// ---------- Member Card ----------
const MemberCard = ({
  item,
  connected,
  onToggle,
}: {
  item: Person;
  connected: boolean;
  onToggle: (id: string, next: boolean) => void;
}) => {
  const { theme } = useTheme();
  const btnBg = connected ? "#1E644C" : theme.colors.primary;
  const btnLabel = connected ? "Connected" : "Connect";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Left side */}
        <View style={styles.leftWrap}>
          <Avatar />
          <View style={styles.texts}>
            <Text variant="body1" style={{ fontWeight: "500" }}>
              {item.title}
            </Text>
            <Text variant="overline" color={theme.colors.textLight}>
              Profession: {item.profession}
            </Text>
            <Text variant="overline" color={theme.colors.textLight}>
              Location: {item.location}
            </Text>
          </View>
        </View>

        {/* Right button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onToggle(item.id, !connected)}
          style={[styles.btn, { backgroundColor: btnBg }]}
        >
          <Text variant="caption" color="#fff">
            {btnLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------- Home Screen ----------
const HomeScreen: React.FC = ({navigation}:any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme.colors?.text ?? "#111827";

  const [selectedTab, setSelectedTab] = useState<"all" | "connections">("all");
  const [connectedById, setConnectedById] = useState<Record<string, boolean>>(
    {}
  );

  // Search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // debounce search input (250ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const handleToggle = (id: string, next: boolean) => {
    setConnectedById((prev) => ({ ...prev, [id]: next }));
  };

  // filter list based on tab + search
  const filteredData = useMemo(() => {
    let base =
      selectedTab === "connections"
        ? SAMPLE_DATA.filter((x) => connectedById[x.id])
        : SAMPLE_DATA;

    if (!debouncedQuery) return base;

    return base.filter((item) => {
      const hay = `${item.title} ${item.profession} ${item.location}`.toLowerCase();
      return hay.includes(debouncedQuery);
    });
  }, [selectedTab, connectedById, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.clear();
    Keyboard.dismiss();
  }, []);

  const onSubmitEditing = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TopBar   onMenuPress={() => navigation.openDrawer()} />

      {/* Search + Filter */}
      <View
        style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}
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
            onSubmitEditing={onSubmitEditing}
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
        {/* <View style={{ marginLeft: "auto" }}>
          <Text variant="overline" color={theme.colors.textLight}>
            {filteredData.length} results
          </Text>
        </View> */}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MemberCard
            item={item}
            connected={!!connectedById[item.id]}
            onToggle={handleToggle}
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
