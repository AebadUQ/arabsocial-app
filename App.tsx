import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/Authcontext";
import { PaperProvider } from "react-native-paper";
import CustomSnackbar from "@/components/common/CustomSnackbar";
import AppContent from "@/context/AppContent";

const queryClient = new QueryClient();

export default function App() {
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
