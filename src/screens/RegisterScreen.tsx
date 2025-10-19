import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Text as RNText,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components';
import InputField from '../components/Input';
import PhoneInput from 'react-native-phone-number-input';
import { useNavigation } from '@react-navigation/native';
import AuthLogo from '../assets/images/authlogo.svg';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api/auth';
import { RegisterPayload } from '@/api/types';
import { theme } from '@/theme/theme';

const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const phoneInputRef = useRef<PhoneInput>(null);

  const mutation = useMutation({
    mutationFn: (user: RegisterPayload) => registerUser(user),
    onSuccess: (data) => {
      console.log('✅ Registration successful:', data);
      // Alert.alert('Success', 'Account created successfully!');
      // @ts-ignore
      navigation.navigate('Login');
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error);
      // Alert.alert('Error', `${error}`);
    },
  });

  const handleRegister = () => {
    const formattedNumber =
      phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero()?.formattedNumber || '';

    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!formattedNumber) {
      newErrors.phone = 'Phone number is required.';
    } else if (formattedNumber.length < 8 || formattedNumber.length > 15) {
      newErrors.phone = 'Phone must be 8–15 digits.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const userData: RegisterPayload = {
      name,
      email,
      password,
      phone: formattedNumber,
    };

    console.log('userData', userData);
    mutation.mutate(userData);
  };

  const handleLogin = () => {
    // @ts-ignore
    navigation.navigate('Login');
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
          source={require('../assets/images/vector-2.png')}
          style={styles.vectorBackground}
          resizeMode="cover"
        />

        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <AuthLogo width={100} height={52} />
          </View>

          <Text
            variant="h1"
            color={theme.colors.textWhite}
            textAlign="center"
            style={styles.title}
          >
            Register
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textWhite}
            textAlign="center"
            style={styles.subtitle}
          >
            Create your account to continue.
          </Text>

          <View style={styles.inputContainer}>
            <InputField
              placeholder="Name"
              value={name}
              onChangeText={setName}
              containerStyle={styles.inputWrapper}
              inputStyle={styles.input}
              error={errors.name}
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
              error={errors.email}
            />

            <PhoneInput
              ref={phoneInputRef}
              defaultValue={phone}
              defaultCode="US"
              layout="first"
              onChangeFormattedText={setPhone}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.input}
              codeTextStyle={styles.codeTextStyle}
              countryPickerButtonStyle={styles.countryPickerButtonStyle}
              flagButtonStyle={styles.flagButtonStyle}
              withShadow={true}
              placeholder="Phone Number"
            />
            {errors.phone ? (
              <RNText style={styles.errorText}>{errors.phone}</RNText>
            ) : null}

            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              secureToggle={true}
              containerStyle={styles.inputWrapper}
              inputStyle={styles.input}
              error={errors.password}
            />
          </View>

          <Button
            title={mutation.status === 'pending' ? 'Registering...' : 'Register'}
            onPress={handleRegister}
            fullWidth
            disabled={mutation.status === 'pending'}
            style={styles.registerButton}
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
            onPress={() => console.log('Continue with Google')}
          >
            <Image
              source={require('@/assets/icons/google-logo.png')}
              style={styles.googleLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.loginRedirect}>
            <RNText style={{ color: theme.colors.textWhite, textAlign: 'center' }}>
              Already have an account?{' '}
              <RNText onPress={handleLogin} style={styles.loginText}>
                Login
              </RNText>
            </RNText>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  vectorBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
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
  errorText: {
    color: theme.colors.error,
    marginTop: -8,
    fontSize: 12,
    marginLeft: 4,
  },
});

export default RegisterScreen;
