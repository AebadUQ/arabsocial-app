// src/config/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    iosClientId: '647455668701-dmj1a6ag6rr4ntfgosar1p7l1r76midh.apps.googleusercontent.com',
    // androidClientId: 'YAHAN_ANDROID_CLIENT_ID',  // jab android ready ho
    webClientId: '647455668701-9nkh29jks1cvl5ekrvv7ph8kic51kdoa.apps.googleusercontent.com',            // jab web client banao ge
    scopes: ['email', 'profile'],
  });
};
