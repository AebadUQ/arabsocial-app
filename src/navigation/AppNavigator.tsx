// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '@/context/Authcontext';

import GetStartedScreen from '@/screens/GetStarted';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';

import HomeScreen from '@/screens/HomeScreen';
import EventScreen from '@/screens/EventScreen';
import MembersScreen from '@/screens/MembersScreen';
import BusinessScreen from '@/screens/BusinessScreen';
import BusinessDetailScreen from '@/screens/BusinessDetail';
import GroupsScreen from '@/screens/GroupScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import NotificationsScreen from '@/screens/NotificationScreen';
import EventDetailScreen from '@/screens/EventDetail';
import AddEventScreen from '@/screens/AddEvent';
import GroupDetailScreen from '@/screens/GroupDetailScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import ProfileEditScreen from '@/screens/profile/ProfileEditScreen';

import CustomBottomsheet from '@/components/CustomBottomsheet';

import { Gear, InfoIcon, SignOutIcon } from 'phosphor-react-native';
import { theme as appTheme } from '@/theme/theme';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AuthLogo = require('../assets/images/auth-logo.png');

/* -------------------------------
 * Type‑safe param lists
 * (you keep your existing types)
 * ------------------------------ */
export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { id?: string } | undefined;
};
// ... (others omitted for brevity; keep as you had) ...

/* -------------------------------
 * Navigator Instances
 * ------------------------------ */
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = createStackNavigator<HomeStackParamList>();
const EventsStack = createStackNavigator();
const MembersStack = createStackNavigator();
const BusinessStack = createStackNavigator();
const GroupsStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/* -------------------------------------------
 * Profile Stack
 * ------------------------------------------- */
const ProfileStackNav = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
  </ProfileStack.Navigator>
);

/* -------------------------------------------
 * Stacks per Tab
 * ------------------------------------------- */
const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const EventsStackNav = () => (
  <EventsStack.Navigator screenOptions={{ headerShown: false }}>
    <EventsStack.Screen name="Events" component={EventScreen} />
    <EventsStack.Screen name="AddEvent" component={AddEventScreen} />
    <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
  </EventsStack.Navigator>
);

const MembersStackNav = () => (
  <MembersStack.Navigator screenOptions={{ headerShown: false }}>
    <MembersStack.Screen name="Members" component={MembersScreen} />
  </MembersStack.Navigator>
);

const BusinessStackNav = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="Business" component={BusinessScreen} />
    <BusinessStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
  </BusinessStack.Navigator>
);

const GroupsStackNav = () => (
  <GroupsStack.Navigator screenOptions={{ headerShown: false }}>
    <GroupsStack.Screen name="Groups" component={GroupsScreen} />
    <GroupsStack.Screen name="GroupDetail" component={GroupDetailScreen} />
  </GroupsStack.Navigator>
);

const SettingsStackNav = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
  </SettingsStack.Navigator>
);

/* -------------------------------------------
 * Bottom Tabs inside Drawer
 * ------------------------------------------- */
const MainTabNavigator = () => {
  useTheme();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomsheet {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: 'Home' }} />
      <Tab.Screen name="EventsTab" component={EventsStackNav} options={{ title: 'Events' }} />
      <Tab.Screen name="MembersTab" component={MembersStackNav} options={{ title: 'Members' }} />
      <Tab.Screen name="BusinessTab" component={BusinessStackNav} options={{ title: 'Business' }} />
      <Tab.Screen name="GroupsTab" component={GroupsStackNav} options={{ title: 'Groups' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNav} options={{ title: 'Settings' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNav} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

/* -------------------------------------------
 * Custom Drawer Content
 * ------------------------------------------- */
function CustomDrawerContent(props: any) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // after logout, context will cause token = null and user = null,
    // navigator will switch to AuthStack
  };

  return (
    <LinearGradient
      colors={['#166152', '#004334']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 32,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
            <Image source={AuthLogo} style={{ width: 110, height: 52, resizeMode: 'contain' }} />
          </View>

          <TouchableOpacity
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'SettingsTab' })}
            style={{
              borderRadius: 10,
              backgroundColor: appTheme.colors.primaryDark,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Settings</Text>
            <Gear size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'GroupsTab' })}
            style={{
              borderRadius: 10,
              backgroundColor: appTheme.colors.primaryDark,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Resources</Text>
            <InfoIcon size={22} color="#fff" />
          </TouchableOpacity>
        </DrawerContentScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              borderRadius: 10,
              backgroundColor: '#156051',
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Logout</Text>
            <SignOutIcon size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

/* -------------------------------------------
 * Drawer wraps Tabs
 * ------------------------------------------- */
const RootDrawer = () => (
  <Drawer.Navigator
    initialRouteName="MainTabs"
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: 'front',
      drawerStyle: { width: 280 },
      drawerActiveTintColor: '#111',
      drawerInactiveTintColor: '#666',
    }}
  >
    <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
  </Drawer.Navigator>
);

/* -------------------------------------------
 * Auth Stack (GetStarted / Login / Register)
 * ------------------------------------------- */
const AuthStack = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="GetStarted" component={GetStartedScreen} />
    <RootStack.Screen name="Login" component={LoginScreen} />
    <RootStack.Screen name="Register" component={RegisterScreen} />
  </RootStack.Navigator>
);

/* -------------------------------------------
 * App Navigator: Switch based on auth state
 * ------------------------------------------- */
const AppNavigator: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // You might return a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      {token ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Main" component={RootDrawer} />
          <RootStack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ presentation: 'transparentModal', animation: 'none', headerShown: false }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
