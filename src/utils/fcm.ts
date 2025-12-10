import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log("Notification Permission:", authStatus);

  if (!enabled) {
    Alert.alert("Permission Needed", "Please enable notifications for updates.");
  }

  return enabled;
}

export async function getFcmToken() {
  try {
    const token = await messaging().getToken();
    console.log("FCM TOKEN:", token);
    return token;
  } catch (error) {
    console.log("Error getting FCM token:", error);
    return null;
  }
}
