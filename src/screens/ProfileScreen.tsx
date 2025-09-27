import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary[100] }]}>
            <Text variant="h2" color={theme.colors.primary[600]}>
              JD
            </Text>
          </View>
          <Text variant="h3" style={styles.name}>
            John Doe
          </Text>
          <Text variant="body2" color={theme.colors.text.secondary} style={styles.username}>
            @johndoe
          </Text>
        </View>

        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h4" color={theme.colors.primary[600]}>
                1,234
              </Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Posts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h4" color={theme.colors.primary[600]}>
                5,678
              </Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h4" color={theme.colors.primary[600]}>
                901
              </Text>
              <Text variant="caption" color={theme.colors.text.secondary}>
                Following
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined" style={styles.bioCard}>
          <Text variant="h5" style={styles.bioTitle}>
            About
          </Text>
          <Text variant="body2" color={theme.colors.text.secondary} style={styles.bioText}>
            Digital creator, coffee enthusiast, and tech lover. Sharing moments and stories from around the world.
          </Text>
        </Card>

        <View style={styles.buttonRow}>
          <Button
            title="Edit Profile"
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Share Profile"
            variant="outline"
            style={styles.button}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  username: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  bioCard: {
    marginBottom: 24,
  },
  bioTitle: {
    marginBottom: 8,
  },
  bioText: {
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ProfileScreen;
