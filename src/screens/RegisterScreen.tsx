import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components';
import InputField from '../components/Input';
import PhoneInput from 'react-native-phone-number-input';
import { useNavigation } from '@react-navigation/native';
const AuthLogo = require('../assets/images/auth-logo.png');

const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const phoneInputRef = useRef<PhoneInput>(null);

  const handleRegister = () => {
    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!isValid) {
      console.log('Invalid phone number');
      return;
    }
    console.log('Register pressed', {
      fullName,
      email,
      password,
      //@ts-ignore
      phoneNumber: phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero()?.formatted,
    });
  };

  const handleLogin = () => {
    // @ts-ignore
    navigation.navigate && navigation.navigate('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
        <View style={styles.inner}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={AuthLogo} style={styles.logoImage} resizeMode="contain" />
          </View>

          {/* Title */}
          <Text variant="h1" color={theme.colors.textWhite} textAlign="center" style={styles.title}>
            Register
          </Text>

          <Text variant="body1" color={theme.colors.textWhite} textAlign="center" style={styles.subtitle}>
            Create your account to continue.
          </Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <InputField
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              containerStyle={styles.inputWrapper}
              inputStyle={styles.input}
            />

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
<PhoneInput
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeFormattedText={setPhoneNumber}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.input}
              codeTextStyle={styles.codeTextStyle}
              countryPickerButtonStyle={styles.countryPickerButtonStyle}
              flagButtonStyle={styles.flagButtonStyle}
              withShadow={true}
              placeholder="Phone Number"
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

          {/* Register Button */}
          <Button title="Register" onPress={handleRegister} fullWidth style={styles.registerButton} />

          {/* OR Separator */}
          <View style={styles.socialContainer}>
            <View style={styles.line} />
            <Text variant="body2" color={theme.colors.textWhite} textAlign="center">or continue with</Text>
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

          {/* Login Link */}
          <View style={styles.loginRedirect}>
            <Text variant="body2" color={theme.colors.textWhite} textAlign="center">
              Already have an account?{' '}
              <Text
                variant="body2"
                color={theme.colors.textWhite}
                onPress={handleLogin}
                style={styles.loginText}
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 100,
    height: 48,
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
    color: '#000',
  },
  phoneContainer: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneTextContainer: {
    backgroundColor: '#fff',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 0,
  },
  countryPickerButtonStyle: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagButtonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  codeTextStyle: {
    color: '#000',
    fontSize: 16,
  },
  registerButton: {
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
  loginRedirect: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default RegisterScreen;
