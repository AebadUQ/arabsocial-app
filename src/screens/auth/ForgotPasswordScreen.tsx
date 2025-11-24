import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { Text, Button } from "@/components";
import InputField from "@/components/Input";
import { useNavigation } from "@react-navigation/native";
import AuthLogo from "@/assets/images/authlogo.svg";
import { ArrowLeft } from "phosphor-react-native";
import { forgotPassword } from "@/api/auth";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");

    try {
      await forgotPassword(email);
      navigation.navigate("VerifyOtp", { email });
    } catch (e: any) {}
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}
      >
        {/* background */}
        <Image
          source={require("@/assets/images/vector-2.png")}
          style={styles.bg}
          resizeMode="cover"
        />

        {/* 🔙 Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={26} color={theme.colors.textWhite} />
        </TouchableOpacity>

        <View style={styles.inner}>
          {/* Logo */}
          <View style={styles.logo}>
            <AuthLogo width={100} height={52} />
          </View>

          <Text variant="h1" color={theme.colors.textWhite} textAlign="center">
            Forgot Password
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textWhite}
            textAlign="center"
            style={{ marginTop: 6, marginBottom: 30 }}
          >
            Enter your email to reset your password
          </Text>

          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            containerStyle={{ marginBottom: 10 }}
            error={error}
          />

          <Button title="Send Code" onPress={handleSend} fullWidth />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },

  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  logo: { alignItems: "center", marginTop: 20, marginBottom: 20 },
});

export default ForgotPasswordScreen;
