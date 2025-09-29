// screens/BusinessScreen.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Text } from "@/components";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from "phosphor-react-native";
import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native"; // 👈 add this

type Business = {
  id: string;
  name: string;
  category: string;      // e.g. "Health"
  isFeatured?: boolean;
  image?: any;   
  description:string        // local require(...) or { uri: string }
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
    image: require("@/assets/images/event2.png"), description:
    "Join fellow founders and operators for an evening of practical talks, speed networking, and chill vibes.",
 
  },
  {
    id: "3",
    name: "City Care Diagnostics",
    category: "Health",
    isFeatured: true,
    image: require("@/assets/images/event1.png"), description:
    "Join fellow founders and operators for an evening of practical talks, speed networking, and chill vibes.",
 
  },
  {
    id: "4",
    name: "FitLife Nutrition",
    category: "Health",
    isFeatured: false,
    image: require("@/assets/images/event2.png"), description:
    "Join fellow founders and operators for an evening of practical talks, speed networking, and chill vibes.",
 
  },
];

// Inline Business Card (shows Category, optional Featured)
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
          <View style={styles.badge}>
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
      </View>
    </View>
  );
};

const BusinessScreen: React.FC = () => {
  const navigation = useNavigation(); 

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const dimText = theme.colors?.text ?? "#111827";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search + Filter Button Row (same UI as before) */}
      <View style={[styles.searchRow, { paddingTop: Math.max(12, insets.top / 3) }]}>
        {/* Search field */}
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search businesses"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
            returnKeyType="search"
          />
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
        </View>

        {/* Filter icon button (kept for UI parity; no chips below) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.filterBtn}
          onPress={() => {
            /* open filters modal later (optional) */
          }}
        >
          <SlidersHorizontalIcon size={16} color={dimText} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* List of Business Cards (no chips row here) */}
      <FlatList
        data={BUSINESSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.85}    
          //@ts-ignore       
            onPress={() => navigation.navigate("BusinessDetail" as never, { event: item } as never)}
>
            <BusinessCard item={item} />
          </TouchableOpacity>
        )}
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
  searchInput: { flex: 1 },
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
    // subtle border to match your style
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
    backgroundColor: theme.colors.primary,
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
