import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/Authcontext";
import { PaperProvider } from "react-native-paper";
import CustomSnackbar from "@/components/common/CustomSnackbar";
import AppContent from "@/context/AppContent";

import { Alert, PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

// ❌ remove these to avoid conflict / confusion
// import { getMessaging, onMessage, getToken, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    initPush();
  }, []);

  const initPush = async () => {
    try {
      if (Platform.OS === "android") {
        await requestPermissionAndroid();
      } else {
        await requestIOSPermission();
      }

      // ✅ iOS: MUST register before getToken (also okay on Android)
      await messaging().registerDeviceForRemoteMessages();

      // ✅ fetch token after registration + permission
      await fetchFcmToken();

      // Optional: iOS debug (APNs token)
      if (Platform.OS === "ios") {
        const apnsToken = await messaging().getAPNSToken();
        console.log("APNS TOKEN:", apnsToken);
      }
    } catch (e) {
      console.log("initPush error:", e);
    }
  };

  const requestPermissionAndroid = async () => {
    // Android 13+ only needs POST_NOTIFICATIONS
    try {
      //@ts-ignore
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Android notification permission denied");
          return;
        }
      }
    } catch (e) {
      console.log("requestPermissionAndroid error:", e);
    }
  };

  const requestIOSPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log("iOS Authorization status:", authStatus);

      if (!enabled) {
        console.log("iOS notification permission not granted");
      }
    } catch (e) {
      console.log("requestIOSPermission error:", e);
    }
  };

  const fetchFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("FCM TOKEN:", token);
      return token;
    } catch (e) {
      console.log("fetchFcmToken error:", e);
      return null;
    }
  };

  // ✅ Foreground messages
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("FCM Foreground", JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // ✅ Notification opened from background
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Opened from background:", remoteMessage);
    });

    return unsubscribe;
  }, []);

  // ✅ Notification opened from quit state
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("Opened from quit:", remoteMessage);
        }
      });
  }, []);

  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <ThemeProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
      <CustomSnackbar />
    </PaperProvider>
  );
}


// import React, { useEffect } from "react";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// import { ThemeProvider } from "@/theme/ThemeContext";
// import { AuthProvider } from "@/context/Authcontext";
// import { PaperProvider } from "react-native-paper";
// import CustomSnackbar from "@/components/common/CustomSnackbar";
// import AppContent from "@/context/AppContent";
// import { Alert, PermissionsAndroid, Platform } from "react-native";

// // 🔹 MODULAR RN FIREBASE MESSAGING IMPORTS
// import {
//   getMessaging,
//   requestPermission,
//   AuthorizationStatus,
//   getToken as getFcmToken,
//   registerDeviceForRemoteMessages,
//   onMessage,
// } from "@react-native-firebase/messaging";

// const queryClient = new QueryClient();

// // 🔹 messaging instance (modular)
// const messagingInstance = getMessaging();

// export default function App() {
//   // 🔹 FCM token common function
//   const fetchFcmToken = async () => {
//     try {
//       console.log("Fetching FCM token...");
//       const token = await getFcmToken(messagingInstance);
//       console.log("FCM token:", token);
//     } catch (error) {
//       console.log("Error getting FCM token:", error);
//     }
//   };

//   // 🔹 Android permission
//   const requestPermissionAndroid = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//       );

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log("Android notification permission granted");
//         await fetchFcmToken();
//       } else {
//         console.log("Android notification permission denied");
//       }
//     } catch (error) {
//       console.log("Error requesting Android permission:", error);
//     }
//   };

//   // 🔹 iOS permission (NO `messaging.AuthorizationStatus` here)
//   const requestIOSPermission = async () => {
//     try {
//       console.log("Requesting iOS notification permission...");

//       const authStatus = await requestPermission(messagingInstance);

//       const enabled =
//         authStatus === AuthorizationStatus.AUTHORIZED ||
//         authStatus === AuthorizationStatus.PROVISIONAL;

//       if (!enabled) {
//         console.log("iOS notification permission NOT enabled:", authStatus);
//         return;
//       }

//       console.log("Authorization status:", authStatus);

//       await registerDeviceForRemoteMessages(messagingInstance);

//       await fetchFcmToken();
//     } catch (error) {
//       console.log("Error in iOS permission / token flow:", error);
//     }
//   };

//   // 🔹 On mount
//   useEffect(() => {
//     if (Platform.OS === "android") {
//       requestPermissionAndroid();
//     } else {
//       requestIOSPermission();
//     }
//   }, []);

//   // 🔹 Foreground listener (modular `onMessage`)
//   useEffect(() => {
//     const unsubscribe = onMessage(messagingInstance, async remoteMessage => {
//       Alert.alert(
//         "A new FCM message arrived!",
//         JSON.stringify(remoteMessage)
//       );
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <PaperProvider>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <QueryClientProvider client={queryClient}>
//           <BottomSheetModalProvider>
//             <ThemeProvider>
//               <AuthProvider>
//                 <AppContent />
//               </AuthProvider>
//             </ThemeProvider>
//           </BottomSheetModalProvider>
//         </QueryClientProvider>
//       </GestureHandlerRootView>
//       <CustomSnackbar />
//     </PaperProvider>
//   );
// }
