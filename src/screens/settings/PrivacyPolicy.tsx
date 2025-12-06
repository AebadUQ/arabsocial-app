import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';
import { useTheme } from '@/theme/ThemeContext';

const PrivacyPolicyScreen = () => {
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
          Privacy Policy
        </Text>

        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We value your privacy and are committed to protecting your personal information.
          This Privacy Policy outlines how we collect, store, use, and safeguard your data 
          while using our application.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Information We Collect
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We may collect information such as your name, email address, contact details,
          device information, and app usage data. This information helps us improve our
          services and provide a better experience.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          How We Use Your Information
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Your data is used to personalize your experience, enhance app performance, 
          deliver customer support, and communicate updates or important notifications.
          We do not sell your personal information to third parties.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Data Protection & Security
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We implement strict security measures to protect your data from unauthorized access, 
          disclosure, or misuse. However, no method of transmission over the internet or 
          electronic storage is 100% secure.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Third-Party Services
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Our app may contain links or integrations with third-party tools. These services 
          operate independently, and we are not responsible for their privacy practices.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Your Rights
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          You have the right to access, update, or request deletion of your personal data. 
          You may also choose to disable certain permissions from your device settings.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Updates to This Policy
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We may update this Privacy Policy from time to time. Any changes will be 
          communicated through the app, and continued use signifies acceptance of the updates.
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
    paddingTop: 80,
    paddingBottom: 60,
  },

  heading: {
    marginTop: 28,
    marginBottom: 10,
  },

  para: {
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen;
