import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { ArrowLeft, MapPinIcon } from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/Authcontext";
import { useQueryClient } from "@tanstack/react-query";
import { getGroupDetail, getGroupMembers } from "@/api/group";
import { formatTheDate } from "@/utils";
import Card from "@/components/Card";

const CTA_HEIGHT = 56;

const GroupInfoScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const groupId = route?.params?.groupId;
  const [group, setGroup] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1); // For pagination
  const [totalMembers, setTotalMembers] = useState(0); // Total number of members

  const fetchGroupDetail = useCallback(
    async (isRefresh = false) => {
      if (!groupId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        isRefresh ? setRefreshing(true) : setLoading(true);
        const res = await getGroupDetail(groupId);
        setGroup(res);
        fetchGroupMembers();
      } catch (e) {
        console.error("Failed to fetch group detail:", e);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [groupId]
  );

  const fetchGroupMembers = async () => {
    try {
      const response = await getGroupMembers(groupId, { page, limit: 10 });
      
      // Extract members data and pagination info
      const fetchedMembers = response?.data || [];
      const total = response?.meta?.total || 0;
      setMembers((prevMembers) => (page === 1 ? fetchedMembers : [...prevMembers, ...fetchedMembers]));
      setTotalMembers(total); // Total members from response meta
    } catch (e) {
      console.error("Failed to fetch group members:", e);
    }
  };

  useEffect(() => {
    fetchGroupDetail(false);
  }, [fetchGroupDetail]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setRefreshing(true);
    fetchGroupMembers();
  }, [fetchGroupMembers]);

  const loadMoreMembers = () => {
    if (members.length < totalMembers) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const openLink = (url?: string | null) => {
    if (!url) return;
    let final = url.trim();
    if (!/^https?:\/\//i.test(final)) final = "https://" + final;
    Linking.openURL(final).catch(() => {});
  };

  const joinGroup = () => {
    console.log("Joining the group...");
  };

  if (loading) {
    return renderLoadingState();
  }

  if (!group) {
    return renderErrorState();
  }

  const { name, description, image, state, isPublic, createdAt, owner } = group;
  const bannerSource = { uri: image };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: CTA_HEIGHT + (insets.bottom || 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
            <ArrowLeft size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image source={bannerSource} style={styles.banner} resizeMode="cover" />
        </View>

        <View style={styles.groupInfoContainer}>
          <View>
            <Text variant="body1" color={theme.colors.text}>{name}</Text>
            <View style={styles.groupMeta}>
              <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text variant="caption" color={theme.colors.primary}>{isPublic ? 'Public' : 'Private'}</Text>
              </View>
              <View style={styles.location}>
                <MapPinIcon size={16} color={theme.colors.text} />
                <Text variant="caption" color={theme.colors.textLight}>{state}</Text>
              </View>
            </View>

            {/* Join Group Button */}
            <TouchableOpacity style={styles.joinBtn} activeOpacity={0.8} onPress={joinGroup}>
              <LinearGradient colors={[theme.colors.primary, "#0f8f5f"]} style={styles.joinBtnInner}>
                <Text style={styles.joinBtnText}>Join Group</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Created by Info */}
            <Text variant="caption" color={theme.colors.textLight} style={styles.createdByText}>
              Created by {owner?.name} on {formatTheDate(createdAt)}
            </Text>
          </View>

          {/* Group Description */}
          <Card>
            <Text variant="body1" color={theme.colors.text}>About</Text>
            {description && (
              <View style={styles.descriptionContainer}>
                <Text variant="body2" color={theme.colors.textLight}>{description}</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Member List */}
        <View style={styles.memberList}>
          <Text variant="body1" color={theme.colors.text}>Members</Text>
          {members.map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <Text variant="body1" color={theme.colors.text}>{member.user.name}</Text>
              <Text variant="caption" color={theme.colors.primary}>Member</Text>
            </View>
          ))}

          {members.length < totalMembers && (
            <TouchableOpacity onPress={loadMoreMembers} style={styles.loadMoreButton}>
              <Text variant="caption" color={theme.colors.primary}>View All {totalMembers} Members</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function renderLoadingState() {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  function renderErrorState() {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text variant="body1" color={theme.colors.text}>No group found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryBtn}>
          <Text variant="caption" color="#fff">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 0 },
  topBar: {
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerWrap: { marginBottom: 12 },
  banner: { width: "100%", height: 224, borderRadius: 16 },
  groupInfoContainer: { display: "flex", gap: 20 },
  groupMeta: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, marginRight: 8 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 8 },
  joinBtn: { marginTop: 16, height: CTA_HEIGHT, borderRadius: 999, justifyContent: "center", alignItems: "center" },
  joinBtnInner: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", borderRadius: 999 },
  joinBtnText: { color: "#fff", fontWeight: "700" },
  createdByText: { marginTop: 10 },
  descriptionContainer: { marginTop: 4 },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0f8f5f",
  },
  memberList: { marginTop: 20 },
  memberItem: { marginBottom: 10 },
  loadMoreButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    alignItems: "center",
  },
});

export default GroupInfoScreen;
