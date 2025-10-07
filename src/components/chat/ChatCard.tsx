// components/chat/ChatCard.tsx
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import { theme } from '@/theme/theme';

export default function ChatCard({ chat, onPress }:any) {
  const { theme } = useTheme();
  const { name, message, time, avatar, online } = chat;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.container]}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {online && <View style={styles.dot} />}
        </View>

        <View style={styles.middle}>
          <Text  numberOfLines={1} variant='body1' color={theme.colors.text}>{name}</Text>
          <Text numberOfLines={1} variant='caption' color={theme.colors.textLight}>
            {message}
          </Text>
        </View>

        <Text variant='overline' color={theme.colors.textLight}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const AVATAR = 42;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderBottomWidth:1,
    borderBottomColor:theme.colors.borderColor
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
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#26A65B',
    borderWidth: 1,
    borderColor: '#fff',
  },
  middle: { flex: 1 },
  name: { fontWeight: '600', marginBottom: 2 },
});
