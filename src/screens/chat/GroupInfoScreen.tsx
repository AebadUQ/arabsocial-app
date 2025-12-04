import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeft,
  CheckIcon,
  XIcon,
  MapPinIcon,
  UsersIcon,
  GearSix,
  GearSixIcon,
  CrownIcon,
} from "phosphor-react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/Authcontext";
import {
  getGroupDetail,
  getGroupMembers,
  requestToJoin,
  acceptRequest,
  rejectRequest,
  getGroupMembersPendingRequest,
  leaveGroup,
} from "@/api/group";
import { formatTheDate } from "@/utils";
import Card from "@/components/Card";
import { theme } from "@/theme/theme";
import { useQueryClient } from "@tanstack/react-query";

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
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showAllPending, setShowAllPending] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchGroupDetail = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getGroupDetail(groupId);
      setGroup(res);
      fetchGroupMembers();
        console.log("oid",owner?.id)
        console.log("s",user?.id)
      if(res?.owner?.id == user?.id){
        console.log("heeee")
      fetchPendingRequests();
      }

    } catch (e) {
      console.error("Failed to fetch group detail:", e);
    } finally {
      setLoading(false);
    }
  }, [groupId,user?.id]);

  const fetchGroupMembers = async () => {
    try {
      const response = await getGroupMembers(groupId, { page, limit: 10 });
      const fetchedMembers = response?.data || [];
      const total = response?.meta?.total || 0;

      setMembers((prevMembers) =>
        page === 1 ? fetchedMembers : [...prevMembers, ...fetchedMembers]
      );
      setTotalMembers(total);
    } catch (e) {
      console.error("Failed to fetch group members:", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await getGroupMembersPendingRequest(groupId, {
        page: 1,
        limit: 10,
      });
      setPendingRequests(response?.data || []);
    } catch (e) {
      console.error("Failed to fetch pending requests:", e);
    }
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [fetchGroupDetail]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setRefreshing(true);
    fetchGroupMembers();
  }, [fetchGroupMembers]);

  const loadMoreMembers = () => {
    if (members.length < totalMembers && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
      fetchGroupMembers();
    }
  };
const handleLeaveGroup = async () => {
  try {
    await leaveGroup(groupId);

    // ❌ Local status update
    setGroup((prev: any) => ({
      ...prev,
      status: null, // now user is not a member
    }));

    // ♻️ Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["exploreGroups"] });
    queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
    queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });

    // 🚀 Navigate back to Chat Screen
    navigation.navigate("Chat");
  } catch (error) {
    console.log("Error leaving group:", error);
  }
};

//   const handleJoin = async () => {
//     try {
//       const res = await requestToJoin(groupId);
//       const newStatus = res?.data?.status;

//       if (newStatus) {
//         setGroup((prevGroup: any) => ({
//           ...prevGroup,
//           status: newStatus,
//         }));
//       }
//     } catch (error) {
//       console.error("Error joining group:", error);
//     }
//   };
const handleJoin = async () => {
  try {
    const res = await requestToJoin(groupId);
    const newStatus = res?.data?.status;

    if (newStatus) {
      setGroup((prevGroup: any) => ({
        ...prevGroup,
        status: newStatus,

      }));
    }

    // 🚀 If user is instantly auto-approved
    if (newStatus === "joined") {
      await fetchGroupMembers();   // 🔥 list refresh
    }
          queryClient.invalidateQueries({ queryKey: ["exploreGroups"] });


  } catch (error) {
    console.error("Error joining group:", error);
  }
};


  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      const updatedRequests = pendingRequests.filter(
        (request) => request.id !== requestId
      );
      setPendingRequests(updatedRequests);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      const updatedRequests = pendingRequests.filter(
        (request) => request.id !== requestId
      );
      setPendingRequests(updatedRequests);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (loading) {
    return renderLoadingState();
  }

  if (!group) {
    return renderErrorState();
  }

  const { name, description, image, state, isPublic, createdAt, owner, status } =
    group;
console.log("saasdsa",JSON.stringify(group))
  const bannerSource = { uri: image };

  const renderInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: CTA_HEIGHT + (insets.bottom || 16) + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Back Button */}
       <View style={styles.topBar}>
  {/* BACK BUTTON */}
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={styles.iconCircle}
  >
    <ArrowLeft size={20} color={theme.colors.text} weight="bold" />
  </TouchableOpacity>

  {/* SETTINGS ICON — only owner can see */}
  {owner?.id === user?.id && (
    <TouchableOpacity
      onPress={() => navigation.navigate("EditGroup", { groupId })}
      style={styles.iconCircle}
    >
      <GearSixIcon size={20} color={theme.colors.textLight} weight="bold" />
    </TouchableOpacity>
  )}
</View>


        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image source={bannerSource} style={styles.banner} />
        </View>

        <View style={styles.groupInfoContainer}>
          <View>
            <Text variant="body1" color={theme.colors.text}>
              {name}
            </Text>

            <View style={styles.groupMeta}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Text variant="caption" color={theme.colors.primary}>
                  {isPublic ? "Public" : "Private"}
                </Text>
              </View>

              <View style={styles.location}>
                <MapPinIcon size={16} color={theme.colors.text} />
                <Text variant="caption" color={theme.colors.textLight}>
                  {state}
                </Text>
              </View>
            </View>

            {/* Join Button */}
            { owner?.id !== user?.id &&
            <TouchableOpacity
              style={styles.joinBtn}
              activeOpacity={0.8}
              onPress={handleJoin}
            >
              <LinearGradient
                colors={[theme.colors.primary, "#0f8f5f"]}
                style={styles.joinBtnInner}
              >
                <Text style={styles.joinBtnText}>
                  {status === "joined"
                    ? "Joined"
                    : status === "pending"
                    ? "Requested"
                    : "Join Group"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>}

            <Text
              variant="caption"
              color={theme.colors.textLight}
              style={styles.createdByText}
            >
              Created by {owner?.name} on {formatTheDate(createdAt)}
            </Text>
          </View>

          {/* PENDING REQUESTS */}
          {owner?.id === user?.id && 
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text variant="body1" color={theme.colors.text}>
                Pending Requests
              </Text>

              <View
                style={{
                  padding: 4,
                  borderRadius: 999,
                  backgroundColor: theme.colors.primaryLight,
                }}
              >
                <Text variant="caption" color={theme.colors.primary}>
                  {pendingRequests.length}
                </Text>
              </View>
            </View>

            {/* SHOW ONLY 4 INITIALLY */}
            <View style={{ gap: 10 }}>
              {(showAllPending
                ? pendingRequests
                : pendingRequests.slice(0, 4)
              ).map((request: any, index: number) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* USER BLOCK */}
                  <TouchableOpacity>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={styles.memberAvatar}>
                        {request?.user?.image ? (
                          <Image
                            source={{ uri: request.user.image }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Text style={styles.memberInitials}>
                            {renderInitials(request?.user?.name)}
                          </Text>
                        )}
                      </View>

                      <View>
                        <Text variant="body1" color={theme.colors.primary}>
                          {request?.user?.name}
                        </Text>
                        <Text
                          variant="caption"
                          color={theme.colors.textLight}
                        >
                          {formatTheDate(request?.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* ACTIONS */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleReject(request.id)}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.borderColor,
                        borderRadius: 8,
                        padding: 4,
                      }}
                    >
                      <XIcon size={14} color={theme.colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleAccept(request.id)}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primary,
                        borderRadius: 8,
                        padding: 4,
                      }}
                    >
                      <CheckIcon size={14} color={theme.colors.textWhite} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* VIEW ALL BUTTON */}
              {!showAllPending && pendingRequests.length > 4 && (
                <TouchableOpacity
                  onPress={() => setShowAllPending(true)}
                  style={{
                    marginTop: 10,
                    paddingVertical: 8,
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 6,
                    alignItems: "center",
                  }}
                >
                  <Text variant="caption" color={theme.colors.primary}>
                    View All
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
}
          {/* ABOUT */}
          <Card>
            <Text variant="body1" color={theme.colors.text}>
              About
            </Text>
            {description && (
              <View style={styles.descriptionContainer}>
                <Text variant="body2" color={theme.colors.textLight}>
                  {description}
                </Text>
              </View>
            )}
          </Card>
         <Card>
  <Text variant="body1" color={theme.colors.text}>
    Group Restrictions
  </Text>

  <View style={{ marginTop: 10, gap: 6 }}>
    {/* Country Restriction */}
    {group?.restrictCountry ? (
      <Text variant="body2" color={theme.colors.textLight}>
        • Country restricted to: <Text style={{ fontWeight: "600", color: theme.colors.text }}>
          {group?.country}
        </Text>
      </Text>
    ) : (
      <Text variant="body2" color={theme.colors.textLight}>
        • No country restriction
      </Text>
    )}

    {/* State Restriction */}
    {group?.restrictState ? (
      <Text variant="body2" color={theme.colors.textLight}>
        • State restricted to: <Text style={{ fontWeight: "600", color: theme.colors.text }}>
          {group?.state}
        </Text>
      </Text>
    ) : (
      <Text variant="body2" color={theme.colors.textLight}>
        • No state restriction
      </Text>
    )}

    {/* Nationality Restriction */}
    {group?.restrictNationality ? (
      <Text variant="body2" color={theme.colors.textLight}>
        • Nationality restricted to: <Text style={{ fontWeight: "600", color: theme.colors.text }}>
          {group?.nationality}
        </Text>
      </Text>
    ) : (
      <Text variant="body2" color={theme.colors.textLight}>
        • No nationality restriction
      </Text>
    )}
  </View>
</Card>

        </View>

        {/* MEMBERS */}
        {status === "joined" && (
          <>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <UsersIcon size={22} />
              <Text variant="body1" color={theme.colors.text}>
                {group?.membersCount} Members
              </Text>
            </View>

            <View style={styles.memberList}>
              <Card>
                <Text variant="body1" color={theme.colors.text}>
                  Members
                </Text>
 <TouchableOpacity
                    style={styles.memberCard}
                    onPress={() =>
                      navigation.navigate("PublicProfile", {
                        userId: owner?.id,
                      })
                    }
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitials}>
                        {renderInitials(owner?.name)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text variant="body1" color={theme.colors.text}>
                        {owner?.name}
                      </Text>

                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: theme.colors.primary,
                            alignSelf: "flex-start",
                            marginTop: 2,
                          },
                        ]}
                      >
                      <View style={{display:'flex',flexDirection:'row',gap:6,alignItems:'center'}}>
                        <CrownIcon size={14} color={theme.colors.textWhite}/>
                          <Text variant="caption" color={theme.colors.textWhite}>
                          Admin
                        </Text>
                      </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                {members.map((member, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.memberCard}
                    onPress={() =>
                      navigation.navigate("PublicProfile", {
                        userId: member?.user?.id,
                      })
                    }
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitials}>
                        {renderInitials(member.user.name)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text variant="body1" color={theme.colors.text}>
                        {member.user.name}
                      </Text>

                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: theme.colors.primaryLight,
                            alignSelf: "flex-start",
                            marginTop: 2,
                          },
                        ]}
                      >
                        <Text variant="caption" color={theme.colors.primary}>
                          Member
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {members.length < totalMembers && (
                  <TouchableOpacity
                    onPress={loadMoreMembers}
                    style={[
                      styles.loadMoreButton,
                      { backgroundColor: theme.colors.primaryLight },
                    ]}
                  >
                    <Text variant="caption" color={theme.colors.primary}>
                      View More
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            </View>
                {owner?.id != user?.id && 
            <TouchableOpacity
              style={styles.joinBtn}
              activeOpacity={0.8}
              onPress={handleLeaveGroup}
            >
              <LinearGradient
                colors={[theme.colors.errorLight,theme.colors.errorLight]}
                style={styles.joinBtnInner}
              >
                <Text style={[styles.joinBtnText,{color:theme.colors.error}]}>
                 Leave Group
                </Text>
              </LinearGradient>
            </TouchableOpacity>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function renderLoadingState() {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  function renderErrorState() {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text variant="body1" color={theme.colors.text}>
          No group found.
        </Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text variant="caption" color={theme.colors.primary}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
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
  groupInfoContainer: { gap: 20 },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginRight: 8,
  },
  location: { flexDirection: "row", alignItems: "center", gap: 4 },
  joinBtn: {
    marginTop: 16,
    height: CTA_HEIGHT,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  joinBtnInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  joinBtnText: { color: "#fff", fontWeight: "700" },
  createdByText: { marginTop: 10 },
  descriptionContainer: { marginTop: 4 },
  memberList: { marginTop: 20 },
  memberCard: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.25,
    borderBottomColor: theme.colors.borderColor,
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  memberInfo: { flex: 1 },
  loadMoreButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
});

export default GroupInfoScreen;
