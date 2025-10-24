import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  ActivityIndicator,
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
import TopBar from "@/components/common/TopBar";
import StateFilterSheet from "@/components/event/StateFilterSheet";
import { getApprovedEvents } from "@/api/events";
import { useInfiniteQuery } from "@tanstack/react-query";

type DateFilter = "all" | "today" | "week" | "month";
const FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStates, setFilterStates] = useState<string[]>([]);

  const dimText = theme.colors?.text ?? "#111827";

  // ✅ React Query Infinite Pagination
  const {
  data,
  isLoading,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  refetch,
} = useInfiniteQuery({
  queryKey: ["approvedEvents", selectedFilter, filterCountry, filterStates],
  initialPageParam: 1, // ✅ required in React Query v5
  queryFn: async ({ pageParam }) => {
    const params = {
      when: selectedFilter === "all" ? "" : selectedFilter,
      page: pageParam,
      limit: 10,
      country: filterCountry,
      city: filterStates[0] || "",
    };

    const res = await getApprovedEvents(params);
    const events = res?.data?.data || [];

    // ✅ determine next page
    const nextPage = events.length === 10 ? pageParam + 1 : undefined;

    return { data: events, nextPage };
  },
  getNextPageParam: (lastPage) => lastPage?.nextPage,
});


  const events: Event[] = useMemo(
    () => data?.pages?.flatMap((page) => page.data) || [],
    [data]
  );

  // --- local search ---
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events?.filter((e) => {
      const text = `${e.title} ${e.city} ${e.country} ${e.description}`.toLowerCase();
      return !q || text.includes(q);
    });
  }, [query, events]);

  const appliedBadge = filterStates.length > 0 ? ` (${filterStates.length})` : "";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopBar onMenuPress={() => navigation.openDrawer()} />

      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
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

      {/* Filter Row */}
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

      {/* Events List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1BAD7A" />
          <Text style={{ marginTop: 8 }}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color="#1BAD7A" />
              </View>
            ) : null
          }
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
              onPress={() => navigation.navigate("EventDetail", { event: item })}
            >
              <EventCard event={item} />
            </TouchableOpacity>
          )}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      {/* Bottom CTA */}
      <View pointerEvents="box-none" style={[styles.ctaWrap]}>
        <TouchableOpacity
          activeOpacity={0.9}
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

      {/* State / Country Filter Sheet */}
      <StateFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        initialCountryName={filterCountry}
        initialCities={filterStates}
        onApply={({ countryName, cities }) => {
          setFilterCountry(countryName);
          setFilterStates(cities ? cities.split(",") : []);
          setFilterOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
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
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    backgroundColor: "#fff",
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
  filterContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  filterScroll: { alignItems: "center" },
  chipTouch: { marginRight: 8 },
  chip: { borderRadius: 999, alignSelf: "flex-start" },
  chipInactive: { opacity: 0.7 },
  chipActive: { opacity: 1 },
  chipContent: { paddingHorizontal: 24, paddingVertical: 4 },
  ctaWrap: { position: "absolute", width: "100%", bottom: 0, alignItems: "center" },
  ctaShadow: { width: "100%", elevation: 6 },
  ctaBtn: { height: 56, alignItems: "center", justifyContent: "center" },
});

export default HomeScreen;
