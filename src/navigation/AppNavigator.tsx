// AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useTheme } from '../theme/ThemeContext';

// Auth / Intro Screens
import GetStartedScreen from '@/screens/GetStarted';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';

// Main Tab Screens
import HomeScreen from '../screens/HomeScreen';
import EventScreen from '@/screens/EventScreen';
import MembersScreen from '@/screens/MembersScreen';
import BusinessScreen from '@/screens/BusinessScreen';
import GroupsScreen from '@/screens/GroupScreen';
import SettingsScreen from '../screens/SettingsScreen';

// NEW: Event Detail
import EventDetailScreen from '@/screens/EventDetail';

// Custom Tab Bar
import CustomBottomSheet from '../components/CustomBottomsheet';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

//
// Stack Navigators for each tab
//
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    {/* 👇 allow Home -> EventDetail */}
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  </Stack.Navigator>
);

const EventsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={EventScreen} />
    {/* 👇 allow Events -> EventDetail */}
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  </Stack.Navigator>
);

const MembersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Members" component={MembersScreen} />
  </Stack.Navigator>
);

const BusinessStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Business" component={BusinessScreen} />
  </Stack.Navigator>
);

const GroupsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Groups" component={GroupsScreen} />
  </Stack.Navigator>
);

//
// Bottom Tab Navigator
//
const MainTabNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomSheet {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Events" component={EventsStack} />
      <Tab.Screen name="Members" component={MembersStack} />
      <Tab.Screen name="Business" component={BusinessStack} />
      <Tab.Screen name="Groups" component={GroupsStack} />
    </Tab.Navigator>
  );
};

//
// Root App Navigator
//
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GetStarted" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
