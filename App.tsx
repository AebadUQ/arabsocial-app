import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/Authcontext";
import { PaperProvider } from "react-native-paper";
import CustomSnackbar from "@/components/common/CustomSnackbar";
import AppContent from "@/context/AppContent";
import { getFcmToken, requestUserPermission } from "@/utils/fcm";
import messaging from "@react-native-firebase/messaging"; // Ensure correct import
import { Alert } from "react-native"; // Add Alert import for showing notifications

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // STEP 1: Ask permission + get token
    async function initFCM() {
      const permission = await requestUserPermission();
      if (permission) {
        const token = await getFcmToken();
        console.log("FCM Token:", token);
        // TODO: Save token to backend
      }
    }

    initFCM();

    // STEP 2: Foreground notification listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("📩 Foreground Notification:", remoteMessage);

      // Show the notification in alert form
      Alert.alert(
        remoteMessage.notification?.title || "New Notification",
        remoteMessage.notification?.body || ""
      );
    });

    // Cleanup on unmount
    return unsubscribe;
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
