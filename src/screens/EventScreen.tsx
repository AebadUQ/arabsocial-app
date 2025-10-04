// screens/HomeScreen.tsx
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { Text } from "@/components";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import EventCard, { Event } from "@/components/event/EventCard";
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  X as XIcon,
} from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import TopBar from "@/components/common/TopBar";
import StateFilterSheet from "@/components/event/StateFilterSheet"; // 👈 NEW

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
    name: "Founders Meetup Dubai",
    startDate: "2025-09-20T18:30:00",
    endDate: "2025-09-20T21:30:00",
    address: "Media City",
    city: "Dubai",
    state: "Dubai",
    country: "United Arab Emirates",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 120,
    ticketLink: "https://tickets.example.com/founders-dubai",
    ticketPrice: 2500,
    description:
      "Join UAE’s top founders and VCs for an evening of insights, networking, and collaboration.",
    isFeatured: true,
    promoCode: "UAE123",
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
    country: "Pakistan",
    state: "Sindh",
    city: "Karachi",
  },
  {
    id: "3",
    name: "Music Fest Islamabad",
    startDate: "2025-08-30T18:00:00",
    endDate: "2025-08-31T00:00:00",
    address: "F-9 Park",
    city: "Islamabad",
    state: "ICT",
    country: "Pakistan",
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
  {
    id: "4",
    name: "Startup Summit Riyadh",
    startDate: "2025-10-10T10:00:00",
    endDate: "2025-10-10T18:00:00",
    address: "Riyadh Exhibition Center",
    city: "Riyadh",
    state: "Riyadh",
    country: "Saudi Arabia",
    image: require("@/assets/images/event2.png"),
    eventType: "in_person",
    totalSpots: 300,
    ticketLink: "https://tickets.example.com/riyadh-startup",
    ticketPrice: 200,
    description:
      "The largest startup gathering in KSA bringing innovators, investors, and creators together.",
    isFeatured: true,
  },
  {
    id: "5",
    name: "AI & Future Tech Conference",
    startDate: "2025-11-22T09:00:00",
    endDate: "2025-11-22T17:00:00",
    address: "Qatar National Convention Centre",
    city: "Doha",
    state: "Doha",
    country: "Qatar",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 400,
    ticketLink: "https://tickets.example.com/ai-future",
    ticketPrice: 1000,
    description:
      "Explore how AI is transforming industries. Keynotes from global leaders in tech and innovation.",
    isFeatured: false,
  },
  {
    id: "6",
    name: "Oman Business Leaders Meetup",
    startDate: "2025-10-05T19:00:00",
    endDate: "2025-10-05T22:00:00",
    address: "Al Mouj, Muscat",
    city: "Muscat",
    state: "Muscat",
    country: "Oman",
    image: require("@/assets/images/event2.png"),
    eventType: "in_person",
    totalSpots: 150,
    ticketLink: "https://tickets.example.com/oman-business-meetup",
    ticketPrice: 300,
    description:
      "Exclusive gathering of Oman’s top business leaders and entrepreneurs sharing success stories.",
    isFeatured: true,
  },
  {
    id: "7",
    name: "Sharjah Innovation Hackathon",
    startDate: "2025-09-28T09:00:00",
    endDate: "2025-09-29T21:00:00",
    address: "Sharjah Research Park",
    city: "Sharjah",
    state: "Sharjah",
    country: "United Arab Emirates",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 200,
    ticketLink: "https://tickets.example.com/sharjah-hackathon",
    ticketPrice: "Free",
    description:
      "A 2-day innovation challenge for developers, designers, and entrepreneurs across the UAE.",
    isFeatured: false,
  },
  {
    id: "8",
    name: "Salalah Tech Talks",
    startDate: "2025-08-25T14:00:00",
    endDate: "2025-08-25T19:00:00",
    address: "Salalah Innovation Hub",
    city: "Salalah",
    state: "Salalah",
    country: "Oman",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 80,
    ticketLink: "https://tickets.example.com/salalah-tech",
    ticketPrice: 100,
    description:
      "Learn from top software architects about cloud systems, DevOps, and scaling apps efficiently.",
    isFeatured: false,
  },
  {
    id: "9",
    name: "Jeddah Startup Expo",
    startDate: "2025-12-05T09:00:00",
    endDate: "2025-12-05T17:00:00",
    address: "Jeddah Center",
    city: "Jeddah",
    state: "Jeddah",
    country: "Saudi Arabia",
    image: require("@/assets/images/event1.png"),
    eventType: "in_person",
    totalSpots: 250,
    ticketLink: "https://tickets.example.com/jeddah-startup",
    ticketPrice: 500,
    description:
      "Connecting young Saudi entrepreneurs with top accelerators and investors.",
    isFeatured: true,
  },
  {
    id: "10",
    name: "Remote Design Sprint",
    startDate: "2025-11-15T10:00:00",
    endDate: "2025-11-15T16:00:00",
    eventType: "online",
    image: require("@/assets/images/event1.png"),
    totalSpots: 100,
    ticketLink: "https://zoom.example.com/design-sprint",
    ticketPrice: "Free",
    description:
      "Join a live remote sprint with global designers to solve real-world UX challenges.",
    isFeatured: false,
    country: "United Arab Emirates",
    state: "Abu Dhabi",
    city: "Abu Dhabi",
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");

  // NEW: bottom sheet filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState("AE");
  const [filterStates, setFilterStates] = useState<string[]>([]); // e.g., ["Dubai","Sharjah","Abu Dhabi"]

  const dimText = theme.colors?.text ?? "#111827";

  // --- date helpers ---
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const endOfWeek = new Date(startOfToday); endOfWeek.setDate(endOfWeek.getDate() + 7);
  const endOfMonth = new Date(startOfToday); endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const inSelectedRange = (d: Date) => {
    switch (selectedFilter) {
      case "today": return d >= startOfToday && d <= endOfToday;
      case "week":  return d >= startOfToday && d <= endOfWeek;
      case "month": return d >= startOfToday && d <= endOfMonth;
      case "all":
      default: return true;
    }
  };

  // --- filtering logic (query + date + states) ---
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasStateFilter = filterStates.length > 0;

    return events
      .filter((e) => {
        // date
        const start = e.startDate ? new Date(e.startDate) : null;
        const passesDate = start ? inSelectedRange(start) : true;

        // text query
        const hay = [
          e.name,
          e.city,
          e.state,
          e.address,
          e.description,
          typeof e.ticketPrice === "string" ? e.ticketPrice : String(e.ticketPrice ?? ""),
          e.eventType,
        ].filter(Boolean).join(" ").toLowerCase();
        const passesQuery = q.length === 0 ? true : hay.includes(q);

        // states filter (match against event.state OR event.city)
        const passesStates = !hasStateFilter
          ? true
          : filterStates.some(
              (s) =>
                (e.state && e.state.toLowerCase() === s.toLowerCase()) ||
                (e.city && e.city.toLowerCase() === s.toLowerCase())
            );

        return passesDate && passesQuery && passesStates;
      })
      .sort((a, b) => {
        const fa = a.isFeatured ? 1 : 0;
        const fb = b.isFeatured ? 1 : 0;
        if (fa !== fb) return fb - fa;
        const ad = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bd = b.startDate ? new Date(b.startDate).getTime() : 0;
        return ad - bd;
      });
  }, [query, selectedFilter, filterStates]);

  const appliedBadge =
    filterStates.length > 0 ? ` (${filterStates.length})` : "";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar />

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
            onSubmitEditing={Keyboard.dismiss}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} style={{ paddingRight: 6 }}>
              <XIcon size={16} weight="bold" color={dimText} />
            </TouchableOpacity>
          ) : null}
          <MagnifyingGlassIcon size={18} weight="bold" color={dimText} />
        </View>

        {/* Filter icon button (50 x 50) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.filterBtn]}
          onPress={() => setFilterOpen(true)}
        >
          <SlidersHorizontalIcon size={16} color={dimText} weight="bold" />
          {appliedBadge ? (
            <View style={styles.badge}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                {filterStates.length}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Filter Row (chips) */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
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
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: theme.colors.textLight }}>
              No events found
              {query ? ` for “${query}”` : ""}
              {filterStates.length ? ` in ${filterStates.join(", ")}` : ""}.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
            //@ts-ignore

              navigation.navigate("EventDetail" as never, { event: item } as never)
            }
          >
            <EventCard event={item} />
          </TouchableOpacity>
        )}
      />

      {/* Sticky Bottom CTA */}
      <View pointerEvents="box-none" style={[styles.ctaWrap]}>
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          //@ts-ignore
          onPress={() => navigation.navigate("AddEvent")}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={["#1BAD7A", "#1BAD7A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Promote Event</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ⬇️ The Bottom Sheet */}
      <StateFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        initialCountryCode={filterCountry}
        initialStates={filterStates}
        onApply={({ countryCode, states }) => {
          setFilterCountry(countryCode);
          setFilterStates(states);
          setFilterOpen(false);
        }}
      />
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
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1BAD7A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  // Filters
  filterContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
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
    width: "100%",
    bottom: 0,
    alignItems: "center",
  },
  ctaShadow: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
