// // screens/PromoteEventScreen.tsx
// import React, { useState } from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Platform,
// } from "react-native";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { Text } from "@/components";
// import InputField from "@/components/Input";
// import { useTheme } from "@/theme/ThemeContext";

// // Optional icons (comment out if you don't use phosphor)
// import {
//   CalendarBlank as CalendarIcon,
//   Clock as ClockIcon,
//   LinkSimple as LinkIcon,
//   CurrencyDollar as DollarIcon,
//   CaretDown as CaretDownIcon,
//   ArrowLeft as BackIcon,
//   ImageSquare as ImageIcon,
// } from "phosphor-react-native";

// export default function PromoteEventScreen() {
//   const { theme } = useTheme();
//   const insets = useSafeAreaInsets();

//   // Local form state (simple; replace with Formik/Zod if you like)
//   const [form, setForm] = useState({
//     name: "",
//     type: "",
//     date: "",
//     startTime: "",
//     endTime: "",
//     address: "",
//     state: "",
//     city: "",
//     spots: "",
//     link: "",
//     price: "",
//     description: "",
//     bannerUri: "", // chosen image (if any)
//   });

//   const set = (key: keyof typeof form, value: string) =>
//     setForm((f) => ({ ...f, [key]: value }));

//   const onPickBanner = () => {
//     // 👉 Hook your picker here (e.g. react-native-image-picker / custom native)
//     // For now, just a stub:
//     console.log("Pick banner tapped");
//   };

//   const onSelectType = () => {
//     // 👉 Open a sheet / menu to select "In person" / "Online"
//     console.log("Select event type");
//   };

//   const onSelectDate = () => {
//     // 👉 Open a date picker
//     console.log("Select date");
//   };

//   const onSelectStart = () => {
//     // 👉 Open a time picker
//     console.log("Select start time");
//   };

//   const onSelectEnd = () => {
//     // 👉 Open a time picker
//     console.log("Select end time");
//   };

//   const onSubmit = () => {
//     // 👉 Validate & submit
//     console.log("Submitting form:", form);
//   };

//   return (
//     <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
//       {/* Top Bar */}
//       <View style={[styles.topBar]}>
//         <TouchableOpacity style={styles.navBtn} onPress={() => console.log("Back")}>
//           <BackIcon size={22} color={theme.colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: theme.colors.text }]}>Promote Event</Text>
//         <View style={styles.navBtn} />
//       </View>

//       <ScrollView
//         contentContainerStyle={[
//           styles.content,
//           { paddingBottom: (insets.bottom || 16) + 84 }, // leave room for sticky button
//         ]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Upload box */}
//         <TouchableOpacity
//           activeOpacity={0.9}
//           style={[
//             styles.uploadBox,
//             {
//               borderColor: theme.colors.border,
//               backgroundColor: theme.colors.card,
//             },
//           ]}
//           onPress={onPickBanner}
//         >
//           {form.bannerUri ? (
//             <Image source={{ uri: form.bannerUri }} style={styles.bannerImg} />
//           ) : (
//             <View style={styles.uploadInner}>
//               <ImageIcon size={36} color={theme.colors.mutedText} />
//               <Text style={[styles.uploadText, { color: theme.colors.mutedText }]}>
//                 Upload your event banner here
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Fields */}
//         <InputField
//           placeholder="Event name"
//           value={form.name}
//           onChangeText={(t) => set("name", t)}
//           containerStyle={styles.fieldGap}
//         />

//         <InputField
//           placeholder="Event type"
//           value={form.type}
//           onChangeText={(t) => set("type", t)}
//           right={<CaretDownIcon size={18} color={theme.colors.placeholder} />}
//           onPressRight={onSelectType}
//           containerStyle={styles.fieldGap}
//         />

//         <InputField
//           placeholder="Event date"
//           value={form.date}
//           onChangeText={(t) => set("date", t)}
//           right={<CalendarIcon size={18} color={theme.colors.placeholder} />}
//           onPressRight={onSelectDate}
//           containerStyle={styles.fieldGap}
//         />

//         {/* Start / End time row */}
//         <View style={[styles.row, styles.fieldGap]}>
//           <View style={styles.col}>
//             <InputField
//               placeholder="Start Time"
//               value={form.startTime}
//               onChangeText={(t) => set("startTime", t)}
//               right={<ClockIcon size={18} color={theme.colors.placeholder} />}
//               onPressRight={onSelectStart}
//             />
//           </View>
//           <View style={styles.col}>
//             <InputField
//               placeholder="End Time"
//               value={form.endTime}
//               onChangeText={(t) => set("endTime", t)}
//               right={<ClockIcon size={18} color={theme.colors.placeholder} />}
//               onPressRight={onSelectEnd}
//             />
//           </View>
//         </View>

//         <InputField
//           placeholder="Address"
//           value={form.address}
//           onChangeText={(t) => set("address", t)}
//           containerStyle={styles.fieldGap}
//         />

//         {/* State / City */}
//         <View style={[styles.row, styles.fieldGap]}>
//           <View style={styles.col}>
//             <InputField
//               placeholder="State"
//               value={form.state}
//               onChangeText={(t) => set("state", t)}
//             />
//           </View>
//           <View style={styles.col}>
//             <InputField
//               placeholder="City"
//               value={form.city}
//               onChangeText={(t) => set("city", t)}
//             />
//           </View>
//         </View>

//         <InputField
//           placeholder="Total spots (optional)"
//           value={form.spots}
//           onChangeText={(t) => set("spots", t.replace(/[^0-9]/g, ""))}
//           keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
//           containerStyle={styles.fieldGap}
//         />

//         <InputField
//           placeholder="Ticket link (optional)"
//           value={form.link}
//           onChangeText={(t) => set("link", t)}
//           right={<LinkIcon size={18} color={theme.colors.placeholder} />}
//           containerStyle={styles.fieldGap}
//           autoCapitalize="none"
//         />

//         <InputField
//           placeholder="Ticket price (optional)"
//           value={form.price}
//           onChangeText={(t) => set("price", t.replace(/[^0-9.]/g, ""))}
//           keyboardType="decimal-pad"
//           right={<DollarIcon size={18} color={theme.colors.placeholder} />}
//           containerStyle={styles.fieldGap}
//         />

//         <InputField
//           placeholder="Description"
//           value={form.description}
//           onChangeText={(t) => set("description", t)}
//           multiline
//           textAlignVertical="top"
//           inputStyle={{ height: 120, paddingTop: 12 }}
//           containerStyle={styles.fieldGap}
//         />
//       </ScrollView>

//       {/* Sticky Submit */}
//       <View
//         style={[
//           styles.footer,
//           { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.background },
//         ]}
//       >
//         <TouchableOpacity
//           style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
//           onPress={onSubmit}
//           activeOpacity={0.9}
//         >
//           <Text style={styles.submitText}>Submit Event</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1 },
//   topBar: {
//     height: 48,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     justifyContent: "space-between",
//   },
//   navBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
//   title: { fontSize: 16, fontWeight: "600" },

//   content: { paddingHorizontal: 16, paddingTop: 8 },

//   uploadBox: {
//     height: 220,
//     borderRadius: 12,
//     borderWidth: 1,
//     overflow: "hidden",
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   uploadInner: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   uploadText: { fontSize: 14 },
//   bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },

//   fieldGap: { marginBottom: 14 },

//   row: { flexDirection: "row", gap: 12 },
//   col: { flex: 1 },

//   footer: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingTop: 8,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "rgba(0,0,0,0.06)",
//   },
//   submitBtn: {
//     height: 52,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// });
