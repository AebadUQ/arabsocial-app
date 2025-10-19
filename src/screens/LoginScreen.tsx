import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components';
import InputField from '../components/Input';
import { useNavigation } from '@react-navigation/native';

import AuthLogo from '../assets/images/authlogo.svg';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // @ts-ignore
    navigation.replace('Main');
    console.log('Login pressed', { email, password });
  };

  const handleSignUp = () => {
    // @ts-ignore
    navigation.navigate && navigation.navigate('Register'); // Make sure 'Register' matches your route name
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
      
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.primaryDark }]}>
        {/* Background Vector Image */}
        <Image
          source={require('../assets/images/vector-2.png')}
          style={styles.vectorBackground}
          resizeMode="cover"
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.inner}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <AuthLogo width={100} height={52} />
            </View>

            {/* Title */}
            <Text variant="h1" color={theme.colors.textWhite} textAlign="center" style={styles.title}>
              Login
            </Text>

            <Text variant="body1" color={theme.colors.textWhite} textAlign="center" style={styles.subtitle}>
              Please enter your account details to continue.
            </Text>

            {/* Input Fields */}
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
              />

              <InputField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                secureToggle={true}
                containerStyle={styles.inputWrapper}
                inputStyle={styles.input}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text variant="body2" color={theme.colors.textWhite} textAlign="right" style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button title="Login" onPress={handleLogin} fullWidth style={styles.loginButton} />

            {/* OR Separator */}
            <View style={styles.socialContainer}>
              <View style={styles.line} />
              <Text variant="body2" color={theme.colors.textWhite} textAlign="center">
                or continue with
              </Text>
              <View style={styles.line} />
            </View>

            {/* Google Button */}
            <TouchableOpacity style={styles.googleButton} onPress={() => console.log('Continue with Google')}>
              <Image
                source={require('@/assets/icons/google-logo.png')}
                style={styles.googleLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Signup */}
            <View style={styles.signUpWrapper}>
              <RNText style={{ color: theme.colors.textWhite, textAlign: 'center' }}>
                New to Arab Socials?{' '}
                <RNText onPress={handleSignUp} style={styles.signUpText}>
                  Sign Up
                </RNText>
              </RNText>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Make sure no light background here
    zIndex: 1,
  },
  vectorBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // behind everything
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  input: {
    fontFamily: 'Manrope-Regular',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 5,
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  googleButton: {
    width: 54,
    height: 54,
    backgroundColor: 'white',
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleLogo: {
    width: 24,
    height: 24,
  },
  signUpWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default LoginScreen;
