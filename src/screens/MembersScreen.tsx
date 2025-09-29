// screens/HomeScreen.tsx
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from "phosphor-react-native";
import Avatar from "@/components/common/Avatar";
import Chip from "@/components/common/Chip"; // ✅ import your Chip

type Person = {
  id: string;
  title: string;
  profession: string;
  location: string;
};

const SAMPLE_DATA: Person[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  title: `John Doe ${i + 1}`,
  profession: "Software Engineer",
  location: "UAE",
}));

// MemberCard inline
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
        {/* Left */}
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

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dimText = theme.colors?.text ?? "#111827";

  // state
  const [selectedTab, setSelectedTab] = useState<"all" | "connections">("all");
  const [connectedById, setConnectedById] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (id: string, next: boolean) => {
    setConnectedById((prev) => ({ ...prev, [id]: next }));
  };

  // filter list based on tab
  const filteredData = useMemo(() => {
    if (selectedTab === "connections") {
      return SAMPLE_DATA.filter((x) => connectedById[x.id]);
    }
    return SAMPLE_DATA;
  }, [selectedTab, connectedById]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Search + Filter */}
      <View
        style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}
      >
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search"
            editable={false}
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
          />
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
          <SlidersHorizontalIcon size={16} weight="bold" color={dimText} />
        </TouchableOpacity>
      </View>

      {/* Chips Row */}
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
        showsVerticalScrollIndicator={false}
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
  searchInput: { flex: 1 },
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
