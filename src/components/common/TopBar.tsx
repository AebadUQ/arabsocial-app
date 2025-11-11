// src/components/TopBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BellIcon, ListIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '@/assets/images/logo.svg';

type Props = {
  title?: string;
  avatarUri?: string;
  notificationsCount?: number;
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
  showCenterLogo?: boolean; // 👈 NEW
};

const TopBar: React.FC<Props> = ({
  avatarUri = 'https://i.pravatar.cc/100?img=12',
  notificationsCount = 10,
  onMenuPress,
  showCenterLogo = false, // 👈 default: false
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.bar}>
      {/* Left: Hamburger */}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onMenuPress}
        style={styles.leftBtn}
      >
        <ListIcon size={18} weight="bold" />
      </TouchableOpacity>

      {/* Center: Logo (only if enabled) */}
      {showCenterLogo && (
        <View style={styles.centerLogoWrap}>
          <Logo width={80} height={30} />
        </View>
      )}

      {/* Right: Bell + Avatar */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Notifications');
          }}
          style={styles.iconBtn}
        >
          <View>
            <BellIcon size={22} weight="bold" />
            {notificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          // @ts-ignore
          onPress={() => navigation.navigate('ProfileTab')}
          style={styles.avatarWrap}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.fallback]}>
              <Text style={styles.fallbackTxt}>U</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // LEFT
  leftBtn: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CENTER (absolute -> always perfectly centered)
  centerLogoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // logo non-clickable; taps pass through
  },

  // RIGHT
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  avatarWrap: {
    marginLeft: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  fallbackTxt: { fontSize: 12, fontWeight: '700', color: '#111' },
});

export default TopBar;
