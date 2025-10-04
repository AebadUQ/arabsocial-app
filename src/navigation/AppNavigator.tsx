// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

// Theme
import { useTheme } from '../theme/ThemeContext';

// Auth / Intro Screens
import GetStartedScreen from '@/screens/GetStarted';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';

// Main Tab Screens
import HomeScreen from '@/screens/HomeScreen';
import EventScreen from '@/screens/EventScreen';
import MembersScreen from '@/screens/MembersScreen';
import BusinessScreen from '@/screens/BusinessScreen';
import BusinessDetailScreen from '@/screens/BusinessDetail';
import GroupsScreen from '@/screens/GroupScreen';
import SettingsScreen from '@/screens/SettingsScreen';

// Details
import EventDetailScreen from '@/screens/EventDetail';
import AddEventScreen from '@/screens/AddEvent';

// Custom Tab Bar
import CustomBottomsheet from '@/components/CustomBottomsheet';

// Icons (optional)
import { House, Gear, GearIcon, InfoIcon, SignOutIcon } from 'phosphor-react-native';
import { theme } from '@/theme/theme';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import NotificationsScreen from '@/screens/NotificationScreen';

const AuthLogo = require('../assets/images/auth-logo.png');
/* -------------------------------------------
 *  Type-safe param lists
 * ------------------------------------------*/
export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { id?: string } | undefined;
};

export type EventsStackParamList = {
  Events: undefined;
  AddEvent: undefined;
  EventDetail: { id?: string } | undefined;
};

export type MembersStackParamList = { Members: undefined };
export type BusinessStackParamList = {
  Business: undefined;
  BusinessDetail: { id?: string } | undefined;
};
export type GroupsStackParamList = { Groups: undefined };
export type SettingsStackParamList = { Settings: undefined };

export type TabsParamList = {
  HomeTab: undefined;
  EventsTab: undefined;
  MembersTab: undefined;
  BusinessTab: undefined;
  GroupsTab: undefined;
  SettingsTab: undefined; // 👈 added
};

export type DrawerParamList = {
  MainTabs:
    | {
        screen?: keyof TabsParamList;
        params?: any; // nested stack params
      }
    | undefined;
  // ❌ Removed standalone Settings from Drawer
};

export type RootStackParamList = {
  GetStarted: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined; // Drawer root
   Notifications: undefined; 
};

/* -------------------------------------------
 *  Navigator instances
 * ------------------------------------------*/
const Tab = createBottomTabNavigator<TabsParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const HomeStack = createStackNavigator<HomeStackParamList>();
const EventsStack = createStackNavigator<EventsStackParamList>();
const MembersStack = createStackNavigator<MembersStackParamList>();
const BusinessStack = createStackNavigator<BusinessStackParamList>();
const GroupsStack = createStackNavigator<GroupsStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

/* -------------------------------------------
 *  Stacks per Tab
 * ------------------------------------------*/
const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
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
  </GroupsStack.Navigator>
);

const SettingsStackNav = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
  </SettingsStack.Navigator>
);

/* -------------------------------------------
 *  Bottom Tabs (inside Drawer)
 * ------------------------------------------*/
const MainTabNavigator = () => {
  useTheme(); // keep for styling if needed
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomsheet {...props} />}
    >
      {/* ⚠️ Use these exact names in navigate({ screen: ... }) */}
      <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: 'Home' }} />
      <Tab.Screen name="EventsTab" component={EventsStackNav} options={{ title: 'Events' }} />
      <Tab.Screen name="MembersTab" component={MembersStackNav} options={{ title: 'Members' }} />
      <Tab.Screen name="BusinessTab" component={BusinessStackNav} options={{ title: 'Business' }} />
      <Tab.Screen name="GroupsTab" component={GroupsStackNav} options={{ title: 'Groups' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNav} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

/* -------------------------------------------
 *  Custom Drawer Content
 * ------------------------------------------*/
// Custom Drawer Content
function CustomDrawerContent(props: any) {
  const { navigation } = props;

  const handleLogout = () => {
    // 🔒 handle logout logic here (clear tokens, etc.)
    navigation.replace('Login');
  };

  return (
    <LinearGradient
      colors={['#166152', '#004334']} // ✅ gradient top → bottom
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        {/* Scrollable content */}
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 32,
            paddingHorizontal: 16,
          }}
        >
          {/* Logo */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <Image
              source={AuthLogo}
              style={{ width: 110, height: 52, resizeMode: 'contain' }}
            />
          </View>

          {/* Drawer menu buttons */}
          <View style={{ gap: 20 }}>
            {/* Settings */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'SettingsTab' })
              }
              activeOpacity={0.7}
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.primaryDark,
                paddingVertical: 14,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Settings
              </Text>
              <Gear size={22} color="#fff" />
            </TouchableOpacity>

            {/* Resources */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'GroupsTab' })}
              activeOpacity={0.7}
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.primaryDark,
                paddingVertical: 14,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Resources
              </Text>
              <InfoIcon size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </DrawerContentScrollView>

        {/* Fixed Logout at Bottom */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={{
              borderRadius: 10,
              backgroundColor: '#156051', // red tint
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Logout
            </Text>
            <SignOutIcon size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}



/* -------------------------------------------
 *  Drawer wraps Tabs (no standalone Settings now)
 * ------------------------------------------*/
const RootDrawer = () => {
  return (
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
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ title: 'Main' }}
      />
      {/* ❌ Removed: <Drawer.Screen name="Settings" .../> */}
    </Drawer.Navigator>
  );
};

/* -------------------------------------------
 *  Root: Auth → Drawer(Main)
 * ------------------------------------------*/
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="GetStarted" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="GetStarted" component={GetStartedScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
        {/* Drawer that contains Tabs (including SettingsTab) */}
        <RootStack.Screen name="Main" component={RootDrawer} />
<RootStack.Screen
    name="Notifications"
    component={NotificationsScreen}
  options={{ presentation: 'transparentModal', animation: 'none', headerShown: false }} // no fade/blur
  />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
