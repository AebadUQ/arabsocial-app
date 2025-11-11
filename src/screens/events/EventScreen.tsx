// screens/Event/EventScreen.tsx
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import EventCard, {
  Event,
} from "@/components/event/EventCard";
import MyEventsCard from "@/components/event/MyEventCard"; // 👈 ensure this path/name is correct
import {
  MagnifyingGlass as MagnifyingGlassIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  X as XIcon,
  CalendarBlank as CalendarIcon,
} from "phosphor-react-native";
import TopBar from "@/components/common/TopBar";
import StateFilterSheet from "@/components/event/StateFilterSheet";
import {
  getApprovedEvents,
  getAllMyEvents,
} from "@/api/events";
import { useInfiniteQuery } from "@tanstack/react-query";

/* ------------ Types / Filters ------------ */

type DateFilter = "all" | "today" | "week" | "month";

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

/* ------------ Pagination helper ------------ */

type MetaShape = {
  nextPage?: number | null;
  hasNextPage?: boolean;
  page?: number;
  totalPages?: number;
};

function computeNextPage(
  meta: MetaShape | undefined,
  pageParam: number,
  pageSize: number,
  itemsLength: number
): number | undefined {
  if (meta && typeof meta.nextPage === "number") return meta.nextPage;
  if (meta && meta.hasNextPage === true) return pageParam + 1;
  if (meta && meta.hasNextPage === false) return undefined;
  if (
    meta &&
    typeof meta.page === "number" &&
    typeof meta.totalPages === "number"
  ) {
    return meta.page < meta.totalPages ? pageParam + 1 : undefined;
  }
  return itemsLength === pageSize ? pageParam + 1 : undefined;
}

/* ------------ Horizontal: My Events ------------ */

const MY_EVENTS_LIMIT = 10;

const MyEventsRow: React.FC = () => {
  const { theme } = useTheme();
  const fetchingMoreRef = useRef(false);

  const {
    data,
    isPending,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["myEvents"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getAllMyEvents({
        page: pageParam as number,
        limit: MY_EVENTS_LIMIT,
      });

      // ✅ adjust based on typical backend shapes
      const raw =
        (res?.data?.data as any[]) ??
        (res?.data as any[]) ??
        res ??
        [];

      const items: Event[] = raw as Event[];

      const meta = (res?.data?.meta ?? {}) as MetaShape;
      const nextPage = computeNextPage(
        meta,
        pageParam as number,
        MY_EVENTS_LIMIT,
        items.length
      );

      return { data: items, nextPage };
    },
    getNextPageParam: (lastPage) =>
      lastPage?.nextPage ?? undefined,
  });

  const myEvents: Event[] = useMemo(
    () => data?.pages?.flatMap((p: any) => p.data) || [],
    [data]
  );

  if (isPending) {
    return (
      <View style={{ paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
            gap: 10,
          }}
        >
          <CalendarIcon
            color={theme.colors.primary}
            size={16}
            weight="bold"
          />
          <Text variant="body1">My Events</Text>
        </View>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  // ✅ If backend returns empty, nothing to show (this is why yours might be "not showing")
  if (!myEvents.length) return null;

  return (
    <View style={{ paddingBottom: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 10,
        }}
      >
        <CalendarIcon
          color={theme.colors.primary}
          size={16}
          weight="bold"
        />
        <Text variant="body1">My Events</Text>
      </View>

      <FlatList
        data={myEvents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 6 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <MyEventsCard item={item} />
        )}
        onEndReached={() => {
          if (
            !hasNextPage ||
            isFetchingNextPage ||
            fetchingMoreRef.current
          )
            return;
          fetchingMoreRef.current = true;
          fetchNextPage().finally(
            () => (fetchingMoreRef.current = false)
          );
        }}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          fetchingMoreRef.current = false;
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 6,
              }}
            >
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
};

/* ------------ Main Events Screen ------------ */

const APPROVED_LIMIT = 10;

const EventScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] =
    useState<DateFilter>("all");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCountry, setFilterCountry] =
    useState("");
  const [filterStates, setFilterStates] =
    useState<string[]>([]);

  const dimText =
    theme.colors?.text ?? "#111827";

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "approvedEvents",
      selectedFilter,
      filterCountry,
      filterStates,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = {
        when:
          selectedFilter === "all"
            ? ""
            : selectedFilter,
        page: pageParam,
        limit: APPROVED_LIMIT,
        country: filterCountry,
        city: filterStates[0] || "",
      };

      const res = await getApprovedEvents(params);

      const items: Event[] =
        (res?.data?.data as Event[]) ??
        (res?.data as Event[]) ??
        [];

      const meta = (res?.data?.meta ?? {}) as MetaShape;
      const nextPage = computeNextPage(
        meta,
        pageParam as number,
        APPROVED_LIMIT,
        items.length
      );

      return { data: items, nextPage };
    },
    getNextPageParam: (lastPage) =>
      lastPage?.nextPage ?? undefined,
  });

  const events: Event[] = useMemo(
    () => data?.pages?.flatMap((p: any) => p.data) || [],
    [data]
  );

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;

    return events.filter((e) => {
      const text = `${e.title || ""} ${e.city || ""} ${
        e.country || ""
      } ${(e.description || "").toLowerCase()}`;
      return text.includes(q);
    });
  }, [query, events]);

  const appliedBadge =
    filterStates.length > 0
      ? ` (${filterStates.length})`
      : "";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <TopBar
        onMenuPress={() =>
          navigation.openDrawer()
        }
        showCenterLogo
      />

      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events"
            placeholderTextColor="rgba(0,0,0,0.4)"
            style={[
              styles.searchInput,
              { color: dimText },
            ]}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {query ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={{ paddingRight: 6 }}
            >
              <XIcon
                size={16}
                weight="bold"
                color={dimText}
              />
            </TouchableOpacity>
          ) : null}
          <MagnifyingGlassIcon
            size={18}
            weight="bold"
            color={dimText}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.filterBtn}
          onPress={() => setFilterOpen(true)}
        >
          <SlidersHorizontalIcon
            size={16}
            color={dimText}
            weight="bold"
          />
          {appliedBadge ? (
            <View style={styles.badge}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {filterStates.length}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Filter Row */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterScroll
          }
        >
          {FILTERS.map((f) => {
            const active =
              selectedFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() =>
                  setSelectedFilter(f.key)
                }
                activeOpacity={0.85}
                style={styles.chipTouch}
              >
                {active ? (
                  <LinearGradient
                    colors={[
                      "#1BAD7A",
                      "#008F5C",
                    ]}
                    start={{
                      x: 0,
                      y: 0,
                    }}
                    end={{
                      x: 1,
                      y: 0,
                    }}
                    style={[
                      styles.chip,
                      styles.chipActive,
                    ]}
                  >
                    <View
                      style={styles.chipContent}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: "#fff",
                        }}
                      >
                        {f.label}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.chip,
                      styles.chipInactive,
                    ]}
                  >
                    <View
                      style={styles.chipContent}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors
                            .text,
                        }}
                      >
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

      {/* List with My Events header */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size="large"
            color="#1BAD7A"
          />
          <Text style={{ marginTop: 8 }}>
            Loading events...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) =>
            String(item.id)
          }
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                140 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={{ gap: 24 }}>
              <MyEventsRow />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  variant="body1"
                  color={
                    theme.colors.text
                  }
                >
                  All Events
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(
                  "EventDetail",
                  { event: item }
                )
              }
            >
              <EventCard event={item} />
            </TouchableOpacity>
          )}
          onEndReached={() => {
            if (!hasNextPage) return;
            if (isFetchingNextPage)
              return;
            fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View
                style={{
                  paddingVertical: 20,
                }}
              >
                <ActivityIndicator color="#1BAD7A" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors
                    .textLight,
                }}
              >
                No events found
                {query
                  ? ` for “${query}”`
                  : ""}
                {filterStates.length
                  ? ` in ${filterStates.join(
                      ", "
                    )}`
                  : ""}
                .
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      {/* Promote Event CTA */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={
          styles.promoteButtonContainer
        }
        onPress={() =>
          navigation.navigate(
            "AddEvent" as never
          )
        }
      >
        <LinearGradient
          colors={[
            theme.colors.primary,
            "#0f8f5f",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={
            styles.promoteButtonGradient
          }
        >
          <Text
            variant="body1"
            style={
              styles.promoteButtonText
            }
          >
            Promote Event
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* State / Country Filter Sheet */}
      <StateFilterSheet
        visible={filterOpen}
        onClose={() =>
          setFilterOpen(false)
        }
        initialCountryName={
          filterCountry
        }
        initialCities={filterStates}
        onApply={({
          countryName,
          cities,
        }) => {
          setFilterCountry(
            countryName
          );
          setFilterStates(
            cities
              ? cities.split(",")
              : []
          );
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  filterScroll: {
    alignItems: "center",
  },
  chipTouch: { marginRight: 8 },
  chip: {
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  chipInactive: { opacity: 0.7 },
  chipActive: { opacity: 1 },
  chipContent: {
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  promoteButtonContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
  },
  promoteButtonGradient: {
    height: 54,
    borderRadius: 26,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  promoteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default EventScreen;
