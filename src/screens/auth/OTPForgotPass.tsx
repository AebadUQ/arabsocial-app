import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthLogo from '@/assets/images/authlogo.svg';
import { useTheme } from '@/theme/ThemeContext';
import { Button, Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';

import { verifyOtp, resendForgotPassOtp } from "@/api/auth";

const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const email = route.params?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(3); // 5 min = 300 seconds
  const [canResend, setCanResend] = useState(false);

  const inputsRef = Array.from({ length: 6 }).map(() =>
    useRef<TextInput | null>(null)
  );

  // 🔥 TIMER LOGIC
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

  // Format Countdown (mm:ss)
  const formatTime = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  // OTP Input Handler
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

  // Verify OTP Handler
  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);

      await verifyOtp({ email, otp: code });

      navigation.navigate("ResetPassword", { email, otp: code });

    } catch (err: any) {
      Alert.alert(
        "OTP Incorrect",
        err?.response?.data?.message || "Invalid OTP"
      );
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Resend OTP Handler
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendForgotPassOtp(email);


      setTimer(3); // restart timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);

    } catch (err) {
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

            <Text
              variant="body1"
              color={theme.colors.textWhite}
              textAlign="center"
              style={{ marginTop: 8 }}
            >
              A verification code was sent to:
            </Text>

            <Text
              variant="body2"
              color={theme.colors.textWhite}
              textAlign="center"
              style={{ marginBottom: 25, opacity: 0.8 }}
            >
              {email}
            </Text>

            {/* OTP Inputs */}
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

            {/* VERIFY BUTTON */}
            <Button
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              fullWidth
              disabled={loading}
              style={styles.verifyButton}
            />

            {/* RESEND OTP */}
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

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 35,
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

export default VerifyOtpScreen;
