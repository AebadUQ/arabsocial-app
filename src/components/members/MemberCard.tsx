// src/components/members/MemberCard.tsx

import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@/components";
import { CheckIcon, XIcon } from "phosphor-react-native";
import LinearGradient from "react-native-linear-gradient";
import { theme } from "@/theme/theme";

export type Person = {
  id: string;
  name: string;
  profession?: string;
  country?: string;
  isConnected: boolean;
  requestId: string;
  status: "pending" | "accepted" | "rejected" | string;
  reqOwner?: boolean;
};

type MemberCardProps = {
  item: Person;
  accepted: boolean;
  onToggle: (id: string) => void;
  isPendingTab?: boolean;
  onPendingAction?: (id: string, status: "accepted" | "rejected") => void;
};

const MemberCard: React.FC<MemberCardProps> = ({
  item,
  accepted,
  onToggle,
  isPendingTab,
  onPendingAction,
}) => {
  const navigation = useNavigation<any>();

  const textLight = theme?.colors?.textLight || "rgba(0,0,0,0.6)";
  const whiteText = "#fff";
  const primary = theme?.colors?.primary || "#2563EB";

  const isPending = item?.status === "pending";
  const forceConnected = accepted === true;

  const shouldShowRowIfPendingTab = !!isPendingTab && !!onPendingAction;
  const shouldShowRowIfIncomingPending =
    isPending && item.reqOwner === false && !!onPendingAction;

  const showAcceptRejectRow =
    !forceConnected &&
    (shouldShowRowIfPendingTab || shouldShowRowIfIncomingPending);

  // Button label
  let btnLabel: string;
  if (forceConnected || item.isConnected) {
    btnLabel = "Connected";
  } else if (isPending) {
    btnLabel = item.reqOwner === false ? "Accept" : "Pending";
  } else {
    btnLabel = "Connect";
  }

  // Solid colors for non-gradient states
  let btnBg: string = primary;
  if (btnLabel === "Connected") {
    btnBg = "#1E644C";
  } else if (btnLabel === "Pending") {
    btnBg = "#9CA3AF";
  } else if (btnLabel === "Accept") {
    btnBg = primary;
  }

  const handleMainPress = () => {
    if (btnLabel === "Accept" && onPendingAction) {
      onPendingAction(item.requestId, "accepted");
      return;
    }

    // if (btnLabel === "Connected" && onPendingAction) {

    //   onPendingAction(item.requestId, "rejected");
    //   return;
    // }
     if (btnLabel === "Connected" && onToggle) {
            onToggle(item.id);

      return;
    }
    onToggle(item.id);

  };

  const handleCardPress = () => {
    navigation.navigate("PublicProfile", { userId: item.id });
  };

  const isGradient = btnLabel === "Connect" || btnLabel === "Accept";

  return (
    <TouchableOpacity
      style={[styles.card]}
      activeOpacity={0.9}
      onPress={handleCardPress}
    >
      {/* Top image */}
      <Image
        source={require("@/assets/images/user.jpg")}
        style={styles.userImage}
        resizeMode="cover"
      />

      {/* Bottom content */}
      <View style={styles.content}>
        <Text
          variant="body1"
          color={theme.colors.text}
          style={styles.name}
        >
          {item.name}
        </Text>

        <Text
          variant="body1"
          color={textLight}
          style={styles.sub}
        >
          {item.country || "N/A"}
        </Text>

        {showAcceptRejectRow ? (
          <View style={styles.actionsRow}>
            {/* Accept */}
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor:theme.colors.primaryShade }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onPendingAction?.(item.requestId, "accepted");
              }}
            >
              <CheckIcon size={12} color={theme.colors.primaryDark} />
            </TouchableOpacity>

            {/* Reject */}
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor: theme.colors.errorLight }]}
              onPress={(e) => {
                e.stopPropagation?.();
                onPendingAction?.(item.requestId, "rejected");
              }}
            >
              <XIcon size={12} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ) : isGradient ? (
          // Gradient pill button for "Connect" / "Accept"
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={(e) => {
              e.stopPropagation?.();
              handleMainPress();
            }}
            style={styles.mainBtnWrapper}
          >
            <LinearGradient
              colors={["#38B770", "#176B4A"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.mainBtnGradient}
            >
              <View style={{paddingVertical:12}}>
                <Text
                variant="caption"
                color="#fff"
                style={styles.btnText}
              >
                {btnLabel}
              </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          // Solid button for Connected / Pending
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={(e) => {
              e.stopPropagation?.();
              handleMainPress();
            }}
            style={styles.mainBtnWrapper}
          >
            <View style={[styles.mainBtnSolid, { backgroundColor: theme.colors.primaryLight }]}>
              <Text
                variant="caption"
                color={theme.colors.primary}
                style={styles.btnText}
              >
                {btnLabel}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderWidth: 0.25,
    borderColor:theme.colors.primary
  },
  userImage: {
    width: "100%",
    height: 110,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    alignItems: "center",
  },
  name: {
    marginBottom: 4,
    textAlign: "center",
    textTransform:'capitalize'
  },
  sub: {
    marginBottom: 4,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  roundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnWrapper: {
    marginTop: 8,
    width: "100%", // full width of card
  },
  mainBtnGradient: {
    width: "100%",
       borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    
  },
  mainBtnSolid: {
    width: "100%",
    borderRadius: 999,
    paddingVertical:12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

export default MemberCard;
