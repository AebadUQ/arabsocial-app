// src/screens/NotificationsScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text } from '@/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Notif = {
  id: string;
  title: string;
  time: string;
  avatar?: string;
  read: boolean; // false => UNREAD (gray), true => READ (white)
};

const INITIAL: Notif[] = [
  {
    id: '1',
    title: 'Hasan Raheem Unfiltered is in 2 days..',
    time: 'Just now',
    avatar: 'https://i.pravatar.cc/100?img=12',
    read: false,
  },
  {
    id: '2',
    title: '4+ people mention you in Dubai Group',
    time: 'Just now',
    avatar: 'https://i.pravatar.cc/100?img=30',
    read: false,
  },
  {
    id: '3',
    title: 'Ashley smith messaged you..',
    time: '1 hour ago',
    avatar: 'https://i.pravatar.cc/100?img=23',
    read: true,
  },
  {
    id: '4',
    title: 'New event scheduled: Tech Conference 2023',
    time: '1 hour ago',
    read: true,
  },
];

const TOPBAR_HEIGHT = 50; // match your TopBar height

export default function NotificationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + TOPBAR_HEIGHT + 5;

  const screen = Dimensions.get('window');
  const sheetW = screen.width;
  const sheetH = screen.height - topOffset;

  // Right → Left slide
  const slideX = useRef(new Animated.Value(sheetW)).current;

  useEffect(() => {
    Animated.timing(slideX, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }, [slideX]);

  const close = () => {
    Animated.timing(slideX, { toValue: sheetW, duration: 180, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) navigation.goBack();
      }
    );
  };

  // ---- list state + UI
  const [data, setData] = useState<Notif[]>(INITIAL);

  const toggleRead = useCallback((id: string) => {
    setData(prev => prev.map(n => (n.id === id ? { ...n, read: !n.read } : n)));
  }, []);

  const renderItem = ({ item }: { item: Notif }) => {
    const bg = item.read ? '#FFFFFF' : '#ECECEC';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleRead(item.id)}
        style={[styles.rowWrap, { backgroundColor: bg }]}
      >
        {/* avatar */}
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}

        {/* title */}
        <View style={styles.textCol}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
        </View>

        {/* time */}
        <Text style={styles.time}>{item.time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* tap area above the sheet (transparent) to close */}
      <Pressable style={[StyleSheet.absoluteFill, { height: topOffset }]} onPress={close} />

      {/* full-width sheet below TopBar */}
      <Animated.View
        style={[
          styles.sheet,
          {
            top: topOffset,
            height: sheetH,
            width: sheetW,
            transform: [{ translateX: slideX }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text variant="body1">Notifications</Text>
          <Pressable onPress={close}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <FlatList
          data={data}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // no blur/dim
  },
  sheet: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  close: { color: '#166152', fontWeight: '600' },

  // list rows
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    // ...Platform.select({
    //   ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
    //   android: { elevation: 1 },
    // }),
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    backgroundColor: '#D1D5DB',
  },
  avatarPlaceholder: {
    backgroundColor: '#6B7280',
  },
  textCol: { flex: 1, justifyContent: 'center' },
  title: { color: '#111827', fontSize: 14.5, fontWeight: '600' },
  time: { marginLeft: 10, color: '#6B7280', fontSize: 12 },
});
