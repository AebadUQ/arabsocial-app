// src/components/TopBar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  BellIcon, ListIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
type Props = {
  title?: string;
  avatarUri?: string;
  notificationsCount?: number;
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
};

const TopBar: React.FC<Props> = ({
  title = 'Dashboard',
  avatarUri = 'https://i.pravatar.cc/100?img=12',
  notificationsCount = 10,
  onMenuPress,
  onBellPress,
  onAvatarPress,
}) => {
    const navigation = useNavigation()
  return (
      <View style={styles.bar}>
        {/* Left: Hamburger */}
        <TouchableOpacity accessibilityRole="button" onPress={onMenuPress} style={styles.leftBtn}>
          <ListIcon size={16} weight="bold" />
        </TouchableOpacity>


        {/* Right: Bell + Avatar */}
        <View style={styles.rightGroup}>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{
            //@ts-ignore
            navigation.navigate('Notifications')
          }} style={styles.iconBtn}>
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


 style={styles.avatarWrap}>
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

const BAR_HEIGHT = 50;

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: 'transparent',
  },
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom:32,
    marginTop:18
  },
  leftBtn: {
    height:40,
    width:40,
    borderWidth:1,
    borderColor:'black',
    borderRadius:20,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
  },
 
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
height:50,
    width:50,
    borderRadius:25,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white'
  },
  badge: {
    position: 'absolute',
    top: -16,
    left: -16,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatarWrap: { marginLeft: 2 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackTxt: { fontSize: 12, fontWeight: '700', color: '#111' },
});

export default TopBar;
