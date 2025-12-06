import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';
import { useTheme } from '@/theme/ThemeContext';

const HelpScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { top: insets.top + 8 }]}
      >
        <ArrowLeft size={22} weight="bold" color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>

        <Text variant="body1" color={theme.colors.text} style={{ marginBottom: 16 }}>
          Help & FAQs
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          How do I create an account?
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          You can create an account by signing up with your email or phone number. 
          Follow the on-screen instructions to complete your registration.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          I forgot my password. What should I do?
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          If you forget your password, simply use the “Forgot Password” option on 
          the login screen. You will receive a reset link or code via email.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          How can I change my account details?
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Navigate to the Settings page to edit your profile information, 
          update your password, or manage your account preferences.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Why am I not receiving notifications?
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Ensure that app notifications are enabled in your device settings 
          and that you have granted the necessary permissions.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          How do I contact support?
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Visit the “Contact Support” section in the Settings menu for help, 
          or send an email to our support team for assistance.
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  backBtn: {
    position: "absolute",
    left: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  content: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 60,
  },

  heading: {
    marginTop: 24,
    marginBottom: 8,
  },

  para: {
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default HelpScreen;
