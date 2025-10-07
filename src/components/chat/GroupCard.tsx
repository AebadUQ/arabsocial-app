import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import { theme } from '@/theme/theme';

type GroupCardProps = {
  group: {
    id: number;
    name: string;
    desc: string;
    image: string;
    joined?: boolean;
    showButton?: boolean;
  };
  onToggle?: (id: number, joined: boolean) => void;
};

const GroupCard = ({ group, onToggle }: GroupCardProps) => {
  const { theme } = useTheme();
  const { id, name, desc, image, joined, showButton } = group;

  const btnBg = joined ? '#1BAD7A' : '#008F5C';
  const btnLabel = joined ? 'Joined' : 'Join';

  return (
    <TouchableOpacity activeOpacity={0.85}>
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: image }} style={styles.avatar} />
        </View>

        {/* Text content */}
        <View style={styles.middle}>
          <Text numberOfLines={1} variant="body1" color={theme.colors.text}>
            {name}
          </Text>
          <Text numberOfLines={1} variant="caption" color={theme.colors.textLight}>
            {desc}
          </Text>
        </View>

        {/* Right side button */}
        {showButton && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onToggle?.(id, !joined)}
            style={[styles.btn, { backgroundColor: btnBg }]}
          >
            <Text variant="caption" color="#fff">
              {btnLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const AVATAR = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    marginRight: 12,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  middle: {
    flex: 1,
  },
  btn: {
    width: 100,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GroupCard;
