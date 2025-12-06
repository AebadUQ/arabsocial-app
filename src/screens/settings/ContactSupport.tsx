import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components';
import { ArrowLeft } from 'phosphor-react-native';
import { useTheme } from '@/theme/ThemeContext';

const ContactSupportScreen = () => {
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
          Contact Support
        </Text>

        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          We're here to help! If you’re experiencing issues or have questions 
          about your account, app features, or settings, feel free to reach out.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          How to Reach Us
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          You can contact our support team anytime through email. We aim to respond 
          within 24–48 hours depending on the volume of requests.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Support Email
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          contact@arabsocials.com
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          What to Include in Your Message
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          To help us respond faster, include details such as your account email, 
          device type, and a brief description of the issue you’re facing.
        </Text>

        <Text variant="body1" color={theme.colors.text} style={styles.heading}>
          Additional Resources
        </Text>
        <Text variant="caption" color={theme.colors.textLight} style={styles.para}>
          Check out the Help & FAQs section for quick answers to commonly asked questions.
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

export default ContactSupportScreen;
