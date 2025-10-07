// screens/GroupScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import Chip from '@/components/common/Chip';
import ChatCard from '@/components/chat/ChatCard';
import GroupCard from '@/components/chat/GroupCard';
import { Text } from '@/components';
import TopBar from '@/components/common/TopBar';
import { useNavigation } from '@react-navigation/native';
const filters = [
  { key: 'chats', label: 'Chats' },
  { key: 'explore', label: 'Explore Groups' },
  { key: 'myGroups', label: 'My Groups' },
];

const dummyGroups = [
  {
    id: 1,
    name: 'Fitness Freaks',
    desc: 'Chat with fellow Fitness Freaks',
    image: 'https://i.pravatar.cc/100?img=22',
    joined: false,
    online: true,
  },
  {
    id: 2,
    name: 'Food Lovers',
    desc: 'Chat with fellow Food Lovers',
    image: 'https://i.pravatar.cc/100?img=31',
    joined: true,
    online: false,
  },
  {
    id: 3,
    name: 'Travel Tribe',
    desc: 'Chat with fellow Travel Tribe',
    image: 'https://i.pravatar.cc/100?img=40',
    joined: false,
    online: true,
  },
];

const GroupScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>()
  const [selectedFilter, setSelectedFilter] = useState('chats');
  const [groups, setGroups] = useState(dummyGroups);

  const handleToggle = (id: number, joined: boolean) => {
    setGroups(prev => prev.map(g => (g.id === id ? { ...g, joined } : g)));
  };

  // --- render user avatar (horizontal frequent list) ---
  const renderUser = ({ item }: any) => (
    <TouchableOpacity style={styles.userItem} activeOpacity={0.8}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.image }} style={styles.userAvatar} />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <Text numberOfLines={1} style={[styles.userName, { color: theme.colors.text }]}>
        {item.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  // --- render chat list item ---
  const renderChat = ({ item }: any) => (
    <ChatCard
      chat={{
        id: item.id,
        name: item.name,
        message: item.desc,
        time: 'Now',
        avatar: item.image,
        online: item.online,
      }}
        onPress={() => navigation.navigate('GroupDetail', { group: item })}

      
    />
  );

  // --- render group card item ---
  const renderGroup = ({ item }: any) => (
    <GroupCard group={{ ...item, showButton: true }} onToggle={handleToggle} />
  );

  // --- render my group card item (no button) ---
  const renderMyGroup = ({ item }: any) => (
    <GroupCard group={{ ...item, showButton: false }} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
     <TopBar/>
      {/* Chip Filter Bar */}
      <View style={styles.chipContainer}>
        {filters.map(f => (
          <Chip
            key={f.key}
            label={f.label}
            active={selectedFilter === f.key}
            onPress={() => setSelectedFilter(f.key)}
          />
        ))}
      </View>

      {/* Chats Section */}
      {selectedFilter === 'chats' && (
        <View style={styles.chatSection}>
          <View style={styles.headerSection}>
            <Text variant="h5" style={[styles.headerTitle, { color: theme.colors.text }]}>
              Frequent Conversations
            </Text>

            <FlatList
              data={groups}
              horizontal
              keyExtractor={item => item.id.toString()}
              renderItem={renderUser}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>

          <FlatList
            data={groups}
            keyExtractor={item => item.id.toString()}
            renderItem={renderChat}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.verticalListContent}
          />
        </View>
      )}

      {/* Explore Groups */}
      {selectedFilter === 'explore' && (
        <FlatList
          data={groups}
          keyExtractor={item => item.id.toString()}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalListContent}
        />
      )}

      {/* My Groups */}
      {selectedFilter === 'myGroups' && (
        <FlatList
          data={groups.filter(g => g.joined)}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMyGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 10,
  },

  // --- Frequent Chats Section ---
  headerSection: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalListContent: {
  },

  // --- Horizontal Avatars ---
  userItem: {
    alignItems: 'center',
    marginRight: 14,
    width: 64,
  },
  avatarContainer: {
    marginBottom: 4,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#26A65B',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 12,
    textAlign: 'center',
  },

  // --- Vertical Chat / Group List ---
  verticalListContent: {
    paddingBottom: 24,
  },
  itemSeparator: {
    height: 10,
  },
  chatSection: {
    flex: 1,
  },
});

export default GroupScreen;
