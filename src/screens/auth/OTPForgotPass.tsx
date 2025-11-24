import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { Text, Button } from "@/components";
import AuthLogo from "@/assets/images/authlogo.svg";
import { ArrowLeft } from "phosphor-react-native";
import { verifyOtp } from "@/api/auth";
import { useNavigation, useRoute } from "@react-navigation/native";

const VerifyOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;

  const { theme } = useTheme();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = Array.from({ length: 6 }).map(() => useRef<TextInput>(null));

 const handleChange = (text: string, index: number) => {
  const newOtp = [...otp];
  newOtp[index] = text;
  setOtp(newOtp);

  // SAFE focus handling
  if (text && index < 5) {
    inputsRef[index + 1]?.current?.focus();
  }

  if (!text && index > 0) {
    inputsRef[index - 1]?.current?.focus();
  }
};

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Enter all 6 digits.");
      return;
    }

    try {
      await verifyOtp({ email, otp: code });
      navigation.navigate("ResetPassword", { email,otp:code });
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = () => {
    Alert.alert("Resent", "A new OTP has been sent.");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
        <Image
          source={require("@/assets/images/vector-2.png")}
          style={styles.bg}
          resizeMode="cover"
        />

        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ArrowLeft size={26} color={theme.colors.textWhite} />
        </TouchableOpacity>

        <View style={styles.inner}>
          <View style={styles.logo}>
            <AuthLogo width={100} height={52} />
          </View>

          <Text variant="h1" color={theme.colors.textWhite} textAlign="center">
            Enter 6-Digit Code
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textWhite}
            textAlign="center"
            style={{ marginTop: 6, marginBottom: 40 }}
          >
            A verification code was sent to {email}
          </Text>

          {/* OTP */}
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
                  },
                ]}
              />
            ))}
          </View>

          <Button title="Verify" onPress={handleVerify} fullWidth />

          {/* Resend */}
          <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
            <Text
              variant="body2"
              color={theme.colors.textWhite}
              textAlign="center"
              style={{ marginTop: 16, fontWeight: "600" }}
            >
              Resend Code
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  back: { paddingHorizontal: 20, paddingVertical: 10 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  logo: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  otpBox: {
    width: 52,
    height: 62,
    borderWidth: 1.8,
    borderRadius: 12,
    fontSize: 24,
    textAlign: "center",
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default VerifyOtpScreen;
