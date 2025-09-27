import React from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components';

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          Settings
        </Text>

        {/* <Card variant="elevated" style={styles.section}>
          <Text variant="h5" style={styles.sectionTitle}>
            Appearance
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body1">Dark Mode</Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[300],
              }}
              thumbColor={isDark ? theme.colors.primary[500] : theme.colors.neutral[50]}
            />
          </View>
        </Card>

        <Card variant="elevated" style={styles.section}>
          <Text variant="h5" style={styles.sectionTitle}>
            Notifications
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body1">Push Notifications</Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[300],
              }}
              thumbColor={theme.colors.primary[500]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body1">Email Notifications</Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={false}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[300],
              }}
              thumbColor={theme.colors.neutral[50]}
            />
          </View>
        </Card>

        <Card variant="elevated" style={styles.section}>
          <Text variant="h5" style={styles.sectionTitle}>
            Privacy
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body1">Profile Visibility</Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Control who can see your profile
              </Text>
            </View>
            <Text variant="body2" color={theme.colors.primary[600]}>
              Public
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body1">Data Usage</Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Manage your data preferences
              </Text>
            </View>
            <Text variant="body2" color={theme.colors.primary[600]}>
              Manage
            </Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            variant="primary"
            fullWidth
            style={styles.saveButton}
          />
          <Button
            title="Sign Out"
            variant="danger"
            fullWidth
            style={styles.signOutButton}
          />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  signOutButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
