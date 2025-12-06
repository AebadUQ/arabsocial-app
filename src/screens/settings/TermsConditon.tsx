import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';
import { useTheme } from '@/theme/ThemeContext';

const TermsConditionsScreen = () => {
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
          Terms & Conditions
        </Text>

        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          These Terms & Conditions outline the rules and regulations for using our 
          application. By accessing or using the app, you agree to comply with these terms.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Use of the App
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          You agree to use the app responsibly and refrain from activities that may harm,
          disrupt, or misuse the platform, including unauthorized access or data extraction.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          User Accounts
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          When creating an account, you must provide accurate information. You are responsible
          for maintaining the confidentiality of your login details and any activity under your account.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Content Ownership
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          All app content, including design, graphics, and code, is owned by us or licensed
          to us. You may not copy, reproduce, or use the content for commercial purposes
          without consent.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Prohibited Activities
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          You agree not to engage in harmful actions, such as uploading malicious content,
          attempting unauthorized access, or interfering with app functionality.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Termination of Access
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We reserve the right to suspend or terminate your account at any time if you
          violate these terms or engage in harmful activities.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Limitations of Liability
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We are not liable for losses, damages, or disruptions caused by your use of the
          app, including issues related to third-party services or network failures.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Changes to These Terms
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We may update these terms periodically. Continued use of the app indicates your
          acceptance of any changes.
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

export default TermsConditionsScreen;
