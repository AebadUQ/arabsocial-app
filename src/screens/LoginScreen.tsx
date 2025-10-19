// src/screens/LoginScreen.tsx  
import React, { useState } from 'react';  
import { View, StyleSheet, TouchableOpacity, StatusBar, Image, Text as RNText, Alert } from 'react-native';  
import { SafeAreaView } from 'react-native-safe-area-context';  
import { useTheme } from '../theme/ThemeContext';  // adjust path  
import { Text, Button } from '../components';  
import InputField from '@/components/Input';  
import { useNavigation } from '@react-navigation/native';  
import AuthLogo from '../assets/images/authlogo.svg';  // adjust path  
import { useAuth } from '@/context/Authcontext';  // adjust path  
import { LoginPayload } from '../api/types';  // adjust path  

const LoginScreen: React.FC = () => {  
  const navigation = useNavigation<any>();  
  const { theme } = useTheme();  
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {  
    const newErrors: typeof errors = {};  
    let valid = true;

    if (!email) {  
      newErrors.email = 'Email is required'; valid = false;  
    } else if (!/\S+@\S+\.\S+/.test(email)) {  
      newErrors.email = 'Invalid email format'; valid = false;  
    }

    if (!password) {  
      newErrors.password = 'Password is required'; valid = false;  
    } else if (password.length < 6) {  
      newErrors.password = 'Password must be at least 6 characters'; valid = false;  
    }

    setErrors(newErrors);  
    if (!valid) return;

    try {  
      await login({ email, password } as LoginPayload);  
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
    } catch (error: any) {  
      Alert.alert('Login Failed', error?.response?.data?.message || error.message || 'Something went wrong');  
    }  
  };

  const handleSignUp = () => {  
    navigation.navigate('Register');  
  };

  return (  
    <>  
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />  
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.primaryDark }]}>  
        <Image source={require('../assets/images/vector-2.png')} style={styles.vectorBackground} resizeMode="cover" />  
        <SafeAreaView style={styles.safeArea}>  
          <View style={styles.inner}>  
            <View style={styles.logoContainer}>  
              <AuthLogo width={100} height={52} />  
            </View>  
            <Text variant="h1" color={theme.colors.textWhite} textAlign="center" style={styles.title}>Login</Text>  
            <Text variant="body1" color={theme.colors.textWhite} textAlign="center" style={styles.subtitle}>Please enter your account details to continue.</Text>  

            <View style={styles.inputContainer}>  
              <InputField  
                placeholder="Email"  
                value={email}  
                onChangeText={setEmail}  
                keyboardType="email-address"  
                autoCapitalize="none"  
                autoComplete="email"  
                containerStyle={styles.inputWrapper}  
                inputStyle={styles.input}  
                error={errors.email}  
              />  
              <InputField  
                placeholder="Password"  
                value={password}  
                onChangeText={setPassword}  
                secureTextEntry  
                secureToggle  
                autoComplete="password"  
                containerStyle={styles.inputWrapper}  
                inputStyle={styles.input}  
                error={errors.password}  
              />  
            </View>  

            <TouchableOpacity style={styles.forgotPasswordContainer}>  
              <Text variant="body2" color={theme.colors.textWhite} textAlign="right" style={styles.forgotPasswordText}>Forgot password?</Text>  
            </TouchableOpacity>  

            <Button  
              title={loading ? 'Logging in...' : 'Login'}  
              onPress={handleLogin}  
              fullWidth  
              disabled={loading}  
              style={styles.loginButton}  
            />  

            <View style={styles.socialContainer}>  
              <View style={styles.line} />  
              <Text variant="body2" color={theme.colors.textWhite} textAlign="center">or continue with</Text>  
              <View style={styles.line} />  
            </View>  

            <TouchableOpacity style={styles.googleButton} onPress={() => console.log('Continue with Google')}>  
              <Image source={require('../assets/icons/google-logo.png')} style={styles.googleLogo} resizeMode="contain" />  
            </TouchableOpacity>  

            <View style={styles.signUpWrapper}>  
              <RNText style={{ color: theme.colors.textWhite, textAlign: 'center' }}>  
                New to Arab Socials?{' '}  
                <RNText onPress={handleSignUp} style={styles.signUpText}>Sign Up</RNText>  
              </RNText>  
            </View>  
          </View>  
        </SafeAreaView>  
      </View>  
    </>  
  );  
};

const styles = StyleSheet.create({  
  outerContainer: { flex: 1, position: 'relative' },  
  safeArea: { flex: 1, backgroundColor: 'transparent', zIndex: 1 },  
  vectorBackground: { ...StyleSheet.absoluteFillObject, zIndex: 0 },  
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 20, justifyContent: 'space-between', zIndex: 1 },  
  logoContainer: { alignItems: 'center', marginTop: 20 },  
  title: { marginTop: 16 },  
  subtitle: { marginTop: 8, marginBottom: 24 },  
  inputContainer: { gap: 16 },  
  inputWrapper: { marginBottom: 0 },  
  input: { fontFamily: 'Manrope-Regular', fontSize: 16 },  
  forgotPasswordContainer: { alignSelf: 'flex-end' },  
  forgotPasswordText: { textDecorationLine: 'underline' },  
  loginButton: { marginTop: 5 },  
  socialContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16, gap: 12 },  
  line: { flex: 1, height: 1, backgroundColor: '#ccc' },  
  googleButton: { width: 54, height: 54, backgroundColor: 'white', borderRadius: 10, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },  
  googleLogo: { width: 24, height: 24 },  
  signUpWrapper: { alignItems: 'center', marginBottom: 24 },  
  signUpText: { textDecorationLine: 'underline', fontWeight: '600' },  
});

export default LoginScreen;
