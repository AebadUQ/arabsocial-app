// screens/HomeScreen.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Text } from "@/components";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import EventCard, { Event } from "@/components/event/EventCard";
// ⬇️ phosphor icons
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native"; // 👈 add this

type DateFilter = "all" | "today" | "week" | "month";
const FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const events: Event[] = [
  {
    id: "1",
    name: "Founders Meetup Karachi",
    startDate: "2025-09-20T18:30:00",
    endDate: "2025-09-20T21:30:00",
    address: "Beach Avenue",
    city: "Karachi",
    state: "Sindh",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 120,
    ticketLink: "https://tickets.example.com/founders",
    ticketPrice: 2500,
    description:
      "Join fellow founders and operators for an evening of practical talks, speed networking, and chill vibes.",
    isFeatured: true,
    promoCode: "ABC123",
  },
  {
    id: "2",
    name: "Online React Native Workshop",
    startDate: "2025-09-15T15:00:00",
    endDate: "2025-09-15T17:00:00",
    eventType: "online",
    image: require("@/assets/images/event2.png"),
    totalSpots: 50,
    ticketLink: "https://zoom.example.com/react-native-workshop",
    ticketPrice: "Free",
    description:
      "Hands-on coding workshop covering navigation, hooks, and performance tips in React Native.",
    isFeatured: false,
  },
  {
    id: "3",
    name: "Music Fest Islamabad",
    startDate: "2025-08-30T18:00:00",
    endDate: "2025-08-31T00:00:00",
    address: "F-9 Park",
    city: "Islamabad",
    state: "ICT",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 5000,
    ticketLink: "https://tickets.example.com/musicfest",
    ticketPrice: 5000,
    description:
      "Experience an unforgettable night of music, lights, and energy with top local and international artists.",
    isFeatured: true,
    promoCode: "MEGAFEST",
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation(); // 👈 get navigation

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");

  const dimText = theme.colors?.text ?? "#111827";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Search + Filter Button Row */}
      <View style={styles.searchRow}>
        {/* Search field */}
        <View style={[styles.searchBox]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[styles.searchInput, { color: dimText }]}
            returnKeyType="search"
          />
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
        </View>

        {/* Filter icon button (50 x 50) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.filterBtn]}
          onPress={() => {
            /* open filters modal later */
          }}
        >
          <SlidersHorizontalIcon size={16} color={dimText} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Filter Row (single line, scrollable, chips sized to text) */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = selectedFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setSelectedFilter(f.key)}
                activeOpacity={0.85}
                style={styles.chipTouch}
              >
                {active ? (
                  <LinearGradient
                    colors={["#1BAD7A", "#008F5C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.chip, styles.chipActive]}
                  >
                    <View style={styles.chipContent}>
                      <Text variant="caption" style={{ color: "#fff" }}>
                        {f.label}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, styles.chipInactive]}>
                    <View style={styles.chipContent}>
                      <Text variant="caption" style={{ color: theme.colors.text }}>
                        {f.label}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 140 + insets.bottom }, // space for sticky button
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            //@ts-ignore
            onPress={() => navigation.navigate("EventDetail" as never, { event: item } as never)}
          >
            <EventCard event={item} />
          </TouchableOpacity>
        )}
      />

      {/* Sticky Bottom CTA: Promote Event */}
      <View
        pointerEvents="box-none"
        style={[
          styles.ctaWrap,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          onPress={() => {
            // TODO: navigate to your Promote Event flow
          }}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={["#1BAD7A", "#1BAD7A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text
              style={{ color: "#fff", fontWeight: "700" }}
            >
              Promote Event
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingTop: 16,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
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

  // Filters
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  filterScroll: { alignItems: "center" },
  chipTouch: { marginRight: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  chipInactive: { opacity: 0.7 },
  chipActive: { opacity: 1 },
  chipContent: { paddingHorizontal: 24, paddingVertical: 4 },

  // Sticky CTA
  ctaWrap: {
    position: "absolute",
width:'100%',
    bottom: 0,
    alignItems: "center",
  },
  ctaShadow: {
    width: "100%",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    // Android elevation
    elevation: 6,
  },
  ctaBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
