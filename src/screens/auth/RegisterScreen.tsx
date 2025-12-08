import React, { useState, useRef } from "react";
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
import PhoneInput from "react-native-phone-number-input";
import { useNavigation } from "@react-navigation/native";
import AuthLogo from "@/assets/images/authlogo.svg";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/api/auth";
import { RegisterPayload } from "@/api/types";
import InputField from "@/components/Input";

const RegisterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const phoneInputRef = useRef<PhoneInput>(null);

  const mutation = useMutation({
    mutationFn: (user: RegisterPayload) => registerUser(user),
    onSuccess: () => {
      //@ts-ignore
      navigation.navigate("OTP", { email });
    },
  });

  const handleRegister = () => {
    const formattedNumber =
      phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero()
        ?.formattedNumber || "";

    const newErrors: any = {};

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email.";

    if (!formattedNumber) newErrors.phone = "Phone number required.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      name,
      email,
      password,
      phone: formattedNumber,
    });
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.inner}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <AuthLogo width={100} height={52} />
              </View>

              <Text
                variant="h1"
                color={theme.colors.textWhite}
                textAlign="center"
                style={styles.title}
              >
                Create Your Account?
              </Text>

              <Text
                variant="body1"
                color={theme.colors.textWhite}
                textAlign="center"
                style={styles.subtitle}
              >
Please enter your account details to continue.              </Text>

              {/* Inputs */}
              <View style={styles.inputContainer}>
                <InputField
                label="Full Name*"
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                />

                <InputField
                label="Email Address"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                {/* ⭐ Phone Input (safe inside ScrollView) */}
               <View>
                 <Text
                          style={[
                            
                            {marginBottom:6,  color: theme.colors.textWhite},
                          ]}
                        >
                          Phone Number
                        </Text>
             <PhoneInput
  ref={phoneInputRef}
  defaultValue={phone}
  defaultCode="US"
  layout="first"
  onChangeFormattedText={setPhone}
  containerStyle={styles.phoneContainer}

  textContainerStyle={{
    ...styles.phoneTextContainer,
    backgroundColor: "#fff",  // ⭐ Without this, Android hides your text
    paddingVertical: 0,
  }}

  codeTextStyle={{
    color: "#000",
    fontSize: 16,             // ⭐ Mandatory for text color to apply on Android
  }}

  textInputStyle={{
    color: "#000",
    fontSize: 16,             // ⭐ Mandatory
    paddingVertical: 0,
  }}
/>

                {errors.phone && (
                  <RNText style={styles.errorText}>{errors.phone}</RNText>
                )}
               </View>

                <InputField
                label="Password*"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              {/* Register Btn */}
              <Button
                title={
                  mutation.status === "pending" ? "Registering..." : "Register"
                }
                onPress={handleRegister}
                fullWidth
              />

              <View style={styles.socialContainer}>
                <View style={styles.line} />
                <Text
                  variant="body2"
                  color={theme.colors.textWhite}
                  textAlign="center"
                >
                  or continue with
                </Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => console.log("Google")}
              >
                <Image
                  source={require("@/assets/icons/google-logo.png")}
                  style={styles.googleLogo}
                />
              </TouchableOpacity>

              <View style={styles.loginRedirect}>
                <RNText style={{ color: theme.colors.textWhite }}>
                  Already have an account?{" "}
                  <RNText
                    style={styles.loginText}
                    onPress={() =>{
                      //@ts-ignore
                      navigation.navigate('Login')
                    }}
                  >
                    Login
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
  inner: { paddingHorizontal: 24, paddingTop: 16 },
  logoContainer: { alignItems: "center", marginVertical: 0 },
  title: { marginTop: 0 },
  subtitle: { marginVertical: 12 },
  inputContainer: { gap: 16,marginBottom:30,marginTop:10 },
  phoneContainer: {
    width: "100%",
    overflow:'hidden',

    height: 56,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor:'white',
    borderRadius:999
  },
  phoneTextContainer: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
        borderRadius:999,
            backgroundColor:'transparent',
            overflow:'hidden'


  },
  errorText: {
    color: "red",
    marginTop: -8,
    fontSize: 12,
    marginLeft: 4,
  },
  googleButton: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  googleLogo: { width: 24, height: 24 },
  socialContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#ccc" },
  loginRedirect: { alignItems: "center", marginTop: 10, marginBottom: 40 },
  loginText: { textDecorationLine: "underline", fontWeight: "600" },
});

export default RegisterScreen;
