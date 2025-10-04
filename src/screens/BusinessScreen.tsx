import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from "react-native";
import { Text } from "@/components";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  XCircle as XCircleIcon,
} from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import TopBar from "@/components/common/TopBar";

type Business = {
  id: string;
  name: string;
  category: string;      // e.g. "Health"
  isFeatured?: boolean;
  image?: any;           // local require(...) or { uri: string }
  description: string;
};

const BUSINESSES: Business[] = [
  {
    id: "1",
    name: "Wellness Plus Clinic",
    category: "Health",
    isFeatured: true,
    image: require("@/assets/images/event1.png"),
    description:
      "Join fellow founders and operators for an evening of practical talks, speed networking, and chill vibes.",
  },
  {
    id: "2",
    name: "GreenLeaf Pharmacy",
    category: "Health",
    isFeatured: false,
    image: require("@/assets/images/event2.png"),
    description:
      "Your trusted neighborhood pharmacy with expert guidance.",
  },
  {
    id: "3",
    name: "City Care Diagnostics",
    category: "Health",
    isFeatured: true,
    image: require("@/assets/images/event1.png"),
    description:
      "Advanced diagnostic center for blood tests and imaging.",
  },
  {
    id: "4",
    name: "FitLife Nutrition",
    category: "Health",
    isFeatured: false,
    image: require("@/assets/images/event2.png"),
    description:
      "Certified nutritionists and organic supplements for a better you.",
  },
];

// Card
const BusinessCard = ({ item }: { item: Business }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.cardWrap}>
      <View style={styles.cardImgWrap}>
        {item.image ? (
          <Image source={item.image} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImg, { backgroundColor: theme.colors.darkGray }]} />
        )}

        {item.isFeatured && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text variant="overline" style={{ color: "#fff", fontWeight: "700" }}>
              Featured
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text variant="body1" style={{ fontWeight: "600" }}>
          {item.name}
        </Text>
        <View style={{ marginTop: 4 }}>
          <Text variant="overline" color={theme.colors.textLight}>
            Category: {item.category}
          </Text>
        </View>
        {!!item.description && (
          <Text
            variant="caption"
            color={theme.colors.textLight}
            style={{ marginTop: 6 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const BusinessScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);
  const dimText = theme.colors?.text ?? "#111827";

  // Filtered list (case-insensitive; matches name/category/description)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BUSINESSES;
    return BUSINESSES.filter((b) => {
      const hay = `${b.name} ${b.category} ${b.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery("");
    inputRef.current?.clear();
    Keyboard.dismiss();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar />

      {/* Search + Filter */}
      <View style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}>
        <View style={styles.searchBox}>
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search businesses (name, category, description)"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <XCircleIcon size={18} weight="bold" color={"rgba(0,0,0,0.4)"} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.filterBtn}
          onPress={() => {
            /* TODO: open filters modal */
          }}
        >
          <SlidersHorizontalIcon size={16} color={dimText} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            // @ts-ignore
            onPress={() => navigation.navigate("BusinessDetail" as never, { event: item } as never)}
          >
            <BusinessCard item={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text>No businesses match “{query}”.</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

const CARD_RADIUS = 12;

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
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
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
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 4,
  },

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
  cardImg: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});

export default BusinessScreen;
