import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { Text, Button } from "@/components";
import InputField from "@/components/Input";
import AuthLogo from "@/assets/images/authlogo.svg";
import { ArrowLeft } from "phosphor-react-native";
import { resetPassword } from "@/api/auth";
import { useNavigation, useRoute } from "@react-navigation/native";

const ResetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email,otp } = route.params;

  const { theme } = useTheme();

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleReset = async () => {
    if (!newPass || !confirmPass) {
      return;
    }
    if (newPass !== confirmPass) {
      return;
    }

    try {
      await resetPassword({
        email,
        otp: route.params?.otp || "",
        newPassword: newPass,
        confirmPassword: confirmPass,
      });


      navigation.navigate("Login");
    } catch (err: any) {
    }
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
            Reset Password
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textWhite}
            textAlign="center"
            style={{ marginTop: 6, marginBottom: 30 }}
          >
            Enter your new password
          </Text>

          <InputField
            placeholder="New Password"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
            containerStyle={{ marginBottom: 15 }}
          />

          <InputField
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
            containerStyle={{ marginBottom: 15 }}
          />

          <Button title="Reset Password" onPress={handleReset} fullWidth />

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
});

export default ResetPasswordScreen;
