import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";

interface Props {
  group: any;
  user: any;          // 👈 ADD THIS
  onPress?: () => void;
  onJoin?: () => void;
}

export default function GroupCard({ group, user, onPress, onJoin }: Props) {
  const { theme } = useTheme();

  const name = group?.name || "Unknown Group";
  const image = group?.image;
  const members = group?.membersCount || 0;
  const status = group?.status;

  // ----------- 🔥 RESTRICTION CHECK -------------
  const normalize = (val: any) =>
  typeof val === "string" ? val.trim().toLowerCase() : val;
const isRestricted =
  (group?.restrictCountry &&
    normalize(group?.country) !== normalize(user?.country)) ||
  (group?.restrictState &&
    normalize(group?.state) !== normalize(user?.state)) ||
  (group?.restrictNationality &&
    normalize(group?.nationality) !== normalize(user?.nationality));
console.log("gr na",group?.nationality)
console.log("us na",user?.nationality)

  // Disable join if restricted
  const joinDisabled = isRestricted && status !== "joined" && status !== "pending";

  // Button Renderer
  const renderButton = () => {
    // User already joined
    if (status === "joined")
      return (
        <TouchableOpacity style={styles.joinedBtn} onPress={onJoin}>
          <Text style={styles.joinedText}>Joined</Text>
        </TouchableOpacity>
      );

    // Pending request
    if (status === "pending")
      return (
        <TouchableOpacity style={styles.pendingBtn} onPress={onJoin}>
          <Text style={styles.pendingText}>Requested</Text>
        </TouchableOpacity>
      );

    // ❌ Restricted → Disable Join
    if (joinDisabled)
      return (
        <View style={[styles.disabledBtn]}>
          <Text style={styles.disabledText}>Not Eligible</Text>
        </View>
      );

    // Normal join
    return (
      <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
        <Text style={styles.joinText}>Join Now</Text>
      </TouchableOpacity>
    );
  };

  const initials = name
    .split(" ")
    .map((x: any) => x.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
console.log("==== GROUP RESTRICTION CHECK ====");
console.log("User:", {
  country: user?.country,
  state: user?.state,
  nationality: user?.nationality,
});
console.log(JSON.stringify(user))
console.log(JSON.stringify(group))
console.log("Group:", {
  restrictCountry: group?.restrictCountry,
  groupCountry: group?.country,
  restrictState: group?.restrictState,
  groupState: group?.state,
  restrictNationality: group?.restrictNationality,
  groupNationality: group?.nationality,
});
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.container}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.initialsCircle,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Text style={[styles.initialsText, { color: theme.colors.primary }]}>
              {initials}
            </Text>
          </View>
        )}

        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1">
            {name}
          </Text>
          <Text numberOfLines={1} variant="caption" color="#777">
            {members} members
          </Text>
        </View>

        {renderButton()}
      </View>
    </TouchableOpacity>
  );
}

const AVATAR = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    gap: 12,
  },
  avatar: { width: AVATAR, height: AVATAR, borderRadius: 999 },
  initialsCircle: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { fontSize: 16, fontWeight: "700" },
  middle: { flex: 1 },

  joinBtn: {
    // backgroundColor: "#1a8f63",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  joinText: { color: theme.colors.primary, fontWeight: "500" },

  joinedBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  joinedText: { color:theme.colors.textWhite, fontWeight: "500" },

  pendingBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pendingText: { color:theme.colors.primary, fontWeight: "500" },

  // ❌ Restricted button
  disabledBtn: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledText: {
    color: "#999",
    fontWeight: "600",
  },
});

// import React from "react";
// import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
// import { Text } from "@/components";
// import { useTheme } from "@/theme/ThemeContext";

// interface Props {
//   group: any;
//   onPress?: () => void;
//   onJoin?: () => void;
// }

// export default function GroupCard({ group, onPress, onJoin }: Props) {
//   const { theme } = useTheme();

//   const name = group?.name || "Unknown Group";
//   const image = group?.image;
//   const members = group?.membersCount || 0;

//   // Status:
//   // accepted | pending | none
//   const status = group?.status;

//   const initials = name
//     .split(" ")
//     .map((x: any) => x.charAt(0).toUpperCase())
//     .slice(0, 2)
//     .join("");

//   const renderButton = () => {
//     if (status === "joined")
//       return (
//                     <TouchableOpacity style={styles.joinedBtn} onPress={onJoin}>

//           <Text style={styles.joinedText}>Joined </Text>
//         </TouchableOpacity>
//       );

//     if (status === "pending")
//       return (
//           <TouchableOpacity style={styles.pendingBtn} onPress={onJoin}>

//           <Text style={styles.pendingText}>Requested</Text>
//         </TouchableOpacity>
//       );

//     return (
//       <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
//         <Text style={styles.joinText}>Join Now</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
//       <View style={styles.container}>
//         {/* Group Image */}
//         {image ? (
//           <Image source={{ uri: image }} style={styles.avatar} />
//         ) : (
//           <View
//             style={[
//               styles.initialsCircle,
//               { backgroundColor: theme.colors.primaryLight },
//             ]}
//           >
//             <Text style={[styles.initialsText, { color: theme.colors.primary }]}>
//               {initials}
//             </Text>
//           </View>
//         )}

//         {/* Name + Members */}
//         <View style={styles.middle}>
//           <Text numberOfLines={1} variant="body1">
//             {name}
//           </Text>

//           <Text numberOfLines={1} variant="caption" color="#777">
//             {members} members
//           </Text>
//         </View>

//         {/* Status Button */}
//         {renderButton()}
//       </View>
//     </TouchableOpacity>
//   );
// }

// const AVATAR = 42;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(0,0,0,0.06)",
//     gap: 12,
//   },

//   avatar: {
//     width: AVATAR,
//     height: AVATAR,
//     borderRadius: 8,
//   },

//   initialsCircle: {
//     width: AVATAR,
//     height: AVATAR,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   initialsText: {
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   middle: { flex: 1 },

//   joinBtn: {
//     backgroundColor: "#1a8f63",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },

//   joinText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   joinedBtn: {
//     backgroundColor: "#d4ffd4",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },

//   joinedText: {
//     color: "#16a34a",
//     fontWeight: "700",
//   },

//   pendingBtn: {
//     backgroundColor: "#fff4cc",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },

//   pendingText: {
//     color: "#b08200",
//     fontWeight: "700",
//   },
// });
