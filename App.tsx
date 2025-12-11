import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/Authcontext";
import { PaperProvider } from "react-native-paper";
import CustomSnackbar from "@/components/common/CustomSnackbar";
import AppContent from "@/context/AppContent";
  import {Alert, PermissionsAndroid} from 'react-native';
  import messaging from '@react-native-firebase/messaging';


  
const queryClient = new QueryClient();

export default function App() {
  useEffect(()=>{
  requestPermissionAndroid()
},[])

const requestPermissionAndroid = async()=>{
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if(granted === PermissionsAndroid.RESULTS.GRANTED){
    // Alert.alert('Permission Granted')
    getToken()
  }
  else{
        // Alert.alert('Permission Denied')

  }

}
useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
  const getToken = async()=>{
    console.log("sss")
    const token= await messaging().getToken()
      console.log("token",token);

  }
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
