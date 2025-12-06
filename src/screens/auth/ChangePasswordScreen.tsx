import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Text as RNText,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { Text, Button } from "@/components";
import { useNavigation } from "@react-navigation/native";
import AuthLogo from "@/assets/images/authlogo.svg";
import InputField from "@/components/Input";
import { changePassword } from "@/api/auth";
import { ArrowLeft } from "phosphor-react-native";

const ChangePasswordScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const e: any = {};
    if (!oldPass) e.oldPass = "Enter your current password.";
    if (!newPass) e.newPass = "Enter a new password.";
    if (newPass.length < 6) e.newPass = "Password must be 6+ characters.";
    if (confirmPass !== newPass) e.confirmPass = "Passwords do not match.";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await changePassword({
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });

      navigation.goBack();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primaryDark}
      />

      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}
      >
        <Image
          source={require("../../assets/images/vector-2.png")}
          style={styles.vectorBackground}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inner}>

              {/* 🔙 BACK BUTTON */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={26} weight="bold" color="#fff" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <AuthLogo width={100} height={52} />
              </View>

              <Text
                variant="h1"
                color={theme.colors.textWhite}
                textAlign="center"
                style={styles.title}
              >
                Change Password
              </Text>

              <Text
                variant="body1"
                color={theme.colors.textWhite}
                textAlign="center"
                style={styles.subtitle}
              >
                Update your password to keep your account secure.
              </Text>

              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Old Password"
                  value={oldPass}
                  onChangeText={setOldPass}
                  secureTextEntry
                  error={errors.oldPass}
                />

                <InputField
                  placeholder="New Password"
                  value={newPass}
                  onChangeText={setNewPass}
                  secureTextEntry
                  error={errors.newPass}
                />

                <InputField
                  placeholder="Confirm Password"
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry
                  error={errors.confirmPass}
                />
              </View>

              <Button
                title={loading ? "Updating..." : "Update Password"}
                onPress={handleSubmit}
                fullWidth
              />

              <View style={styles.loginRedirect}>
                <RNText style={{ color: theme.colors.textWhite }}>
                  Want to go back?{" "}
                  <RNText
                    style={styles.loginText}
                    onPress={() => navigation.goBack()}
                  >
                    Return
                  </RNText>
                </RNText>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  vectorBackground: { ...StyleSheet.absoluteFillObject },
  inner: { paddingHorizontal: 24, paddingTop: 20, minHeight: "100%" },

  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 30,
  },

  logoContainer: { alignItems: "center", marginBottom: 20, marginTop: 40 },
  title: { marginTop: 10 },
  subtitle: { marginVertical: 12 },
  inputContainer: { gap: 16, marginTop: 10, marginBottom: 20 },
  loginRedirect: { alignItems: "center", marginTop: 30, marginBottom: 40 },
  loginText: { textDecorationLine: "underline", fontWeight: "600" },
});

export default ChangePasswordScreen;
