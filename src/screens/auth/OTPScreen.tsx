import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthLogo from '@/assets/images/authlogo.svg';
import { useTheme } from '@/theme/ThemeContext';
import { Button, Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';

import { useAuth } from "@/context/Authcontext";
import { resendVerificationOtp, verifyOtp } from "@/api/auth";

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const { verifyOtpLogin } = useAuth();

  const email = route.params?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(300); // 5 min = 300 seconds
  const [canResend, setCanResend] = useState(false);

  const inputsRef = Array.from({ length: 6 }).map(() =>
    useRef<TextInput | null>(null)
  );

  // 🔥 TIMER START
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  // Input handler
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length > 0) {
      inputsRef[index + 1]?.current?.focus();
    } else {
      inputsRef[index - 1]?.current?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) return;
    if (!email) return;

    try {
      setLoading(true);
      await verifyOtp({email,otp:code} );
      navigation.navigate('Login')
    } catch (err) {
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESEND OTP FUNCTION
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendVerificationOtp(email);

      setTimer(300);      // reset to 5 minutes
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);

    } catch (err) {
      console.log("Resend OTP failed:", err);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      <View style={[styles.outerContainer, { backgroundColor: theme.colors.primaryDark }]}>
        <Image
          source={require('../../assets/images/vector-2.png')}
          style={styles.vectorBackground}
          resizeMode="cover"
        />

        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={26} color={theme.colors.textWhite} />
          </TouchableOpacity>

          <View style={styles.inner}>

            <View style={styles.logoContainer}>
              <AuthLogo width={100} height={52} />
            </View>

            <Text variant="h1" color={theme.colors.textWhite} textAlign="center" style={styles.title}>
              Enter 6-Digit Code
            </Text>

            <Text variant="body1" color={theme.colors.textWhite} textAlign="center" style={styles.subtitle}>
              Verification code sent to:
            </Text>

            <Text
              variant="body2"
              color={theme.colors.textWhite}
              textAlign="center"
              style={{ marginBottom: 20, opacity: 0.8 }}
            >
              {email}
            </Text>

            {/* OTP ROW */}
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={inputsRef[i]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  placeholder="•"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  onChangeText={(t) => handleChange(t, i)}
                  style={[
                    styles.otpBox,
                    {
                      borderColor: theme.colors.textWhite,
                      color: theme.colors.textWhite,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  ]}
                />
              ))}
            </View>

            <Button
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              fullWidth
              disabled={loading}
              style={styles.verifyButton}
            />

            {/* RESEND Section */}
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              activeOpacity={canResend ? 0.8 : 1}
            >
              <Text
                variant="body2"
                color={canResend ? theme.colors.textWhite : "gray"}
                textAlign="center"
                style={styles.resendText}
              >
                {canResend ? "Resend Code" : `Resend in ${formatTime()}`}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  safeArea: { flex: 1 },
  vectorBackground: { ...StyleSheet.absoluteFillObject },

  backBtn: { paddingHorizontal: 20, paddingVertical: 10 },

  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

  logoContainer: { alignItems: 'center', marginTop: 20 },
  title: { marginTop: 20 },
  subtitle: { marginTop: 8 },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
  },

  otpBox: {
    width: 52,
    height: 62,
    borderWidth: 1.8,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
  },

  verifyButton: { marginTop: 10 },

  resendText: {
    marginTop: 16,
    fontWeight: '600',
  },
});

export default OTPScreen;
