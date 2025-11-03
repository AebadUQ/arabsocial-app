// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  StackNavigationOptions,
} from "@react-navigation/stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/Authcontext";

import GetStartedScreen from "@/screens/GetStarted";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";

import HomeScreen from "@/screens/HomeScreen";
import EventScreen from "@/screens/EventScreen";
import MembersScreen from "@/screens/MembersScreen";
import BusinessScreen from "@/screens/business/BusinessScreen";
import BusinessDetailScreen from "@/screens/business/BusinessDetail";
import GroupsScreen from "@/screens/GroupScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import NotificationsScreen from "@/screens/NotificationScreen";
import EventDetailScreen from "@/screens/EventDetail";
import AddEventScreen from "@/screens/AddEvent";
import GroupDetailScreen from "@/screens/GroupDetailScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import ProfileEditScreen from "@/screens/profile/ProfileEditScreen";
import PublicProfileScreen from "@/screens/profile/PublicProfileScreen";
import CreateBusiness from '@/screens/business/CreateBusiness'

import CustomBottomsheet from "@/components/CustomBottomsheet";

import { Gear, InfoIcon, SignOutIcon } from "phosphor-react-native";
import { theme as appTheme } from "@/theme/theme";
import { Image, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/* ---------------------------------
 * Assets
 * --------------------------------- */
const AuthLogo = require("../assets/images/auth-logo.png");

/* ---------------------------------
 * Stack param types
 * --------------------------------- */

// Home tab stack
export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { eventId: string | number };
};

// Profile tab stack (private profile / edit self)
export type ProfileStackParamList = {
  Profile: undefined;
  ProfileEdit: undefined;
};

// Root stack (app when logged in)
// these are global routes you can jump to from anywhere in the app shell
export type RootStackParamList = {
  Main: undefined; // Drawer containing tabs etc.
  Notifications: undefined;
  PublicProfile: { userId: string };
};

// Auth stack (login/register flow BEFORE token)
export type AuthStackParamList = {
  GetStarted: undefined;
  Login: undefined;
  Register: undefined;
};

// Events tab stack
export type EventsStackParamList = {
  Events: undefined;
  AddEvent: undefined;
  EventDetail: { eventId: string | number };
};

// Members tab stack
export type MembersStackParamList = {
  Members: undefined;
};

// Business tab stack
export type BusinessStackParamList = {
  Business: undefined;
  CreateBusiness: undefined;

  BusinessDetail: { id?: string } | undefined;
  
};

// Groups tab stack
export type GroupsStackParamList = {
  Groups: undefined;
  GroupDetail: { id?: string } | undefined;
};

// Settings tab stack
export type SettingsStackParamList = {
  Settings: undefined;
};

/* ---------------------------------
 * Navigator instances
 * --------------------------------- */
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const AuthStackNavStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const EventsStack = createStackNavigator<EventsStackParamList>();
const MembersStack = createStackNavigator<MembersStackParamList>();
const BusinessStack = createStackNavigator<BusinessStackParamList>();
const GroupsStack = createStackNavigator<GroupsStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

const defaultNoHeader: StackNavigationOptions = { headerShown: false };

/* ---------------------------------
 * Profile stack (private profile/edit)
 * --------------------------------- */
const ProfileStackNav = () => (
  <ProfileStack.Navigator screenOptions={defaultNoHeader}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    {/* NOTE: PublicProfile is NOT here */}
  </ProfileStack.Navigator>
);

/* ---------------------------------
 * Home tab stack
 * --------------------------------- */
const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={defaultNoHeader}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    {/* if you ALSO want event detail from Home tab:
        <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
    */}
  </HomeStack.Navigator>
);

/* ---------------------------------
 * Events tab stack
 * --------------------------------- */
const EventsStackNav = () => (
  <EventsStack.Navigator screenOptions={defaultNoHeader}>
    <EventsStack.Screen name="Events" component={EventScreen} />
    <EventsStack.Screen name="AddEvent" component={AddEventScreen} />
    
    <EventsStack.Screen name="EventDetail" 
    

    component={EventDetailScreen} />
  </EventsStack.Navigator>
);

/* ---------------------------------
 * Members tab stack
 * --------------------------------- */
const MembersStackNav = () => (
  <MembersStack.Navigator screenOptions={defaultNoHeader}>
    <MembersStack.Screen name="Members" component={MembersScreen} />
  </MembersStack.Navigator>
);

/* ---------------------------------
 * Business tab stack
 * --------------------------------- */
const BusinessStackNav = () => (
  <BusinessStack.Navigator screenOptions={defaultNoHeader}>
    <BusinessStack.Screen name="Business" component={BusinessScreen} />
    <BusinessStack.Screen name="CreateBusiness" component={CreateBusiness} />

    <BusinessStack.Screen
      name="BusinessDetail"
      component={BusinessDetailScreen}
    />
  </BusinessStack.Navigator>
);

/* ---------------------------------
 * Groups tab stack
 * --------------------------------- */
const GroupsStackNav = () => (
  <GroupsStack.Navigator screenOptions={defaultNoHeader}>
    <GroupsStack.Screen name="Groups" component={GroupsScreen} />
    <GroupsStack.Screen name="GroupDetail" component={GroupDetailScreen} />
  </GroupsStack.Navigator>
);

/* ---------------------------------
 * Settings tab stack
 * --------------------------------- */
const SettingsStackNav = () => (
  <SettingsStack.Navigator screenOptions={defaultNoHeader}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
  </SettingsStack.Navigator>
);

/* ---------------------------------
 * Bottom Tabs (inside Drawer)
 * --------------------------------- */
const MainTabNavigator = () => {
  useTheme(); // keeps theme reactive in tab bar, even if we're not using value directly

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomsheet {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNav}
        options={{ title: "Events" }}
      />
      <Tab.Screen
        name="MembersTab"
        component={MembersStackNav}
        options={{ title: "Members" }}
      />
      <Tab.Screen
        name="BusinessTab"
        component={BusinessStackNav}
        options={{ title: "Business" }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsStackNav}
        options={{ title: "Groups" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNav}
        options={{ title: "Settings" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNav}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

/* ---------------------------------
 * Custom Drawer Content
 * --------------------------------- */
function CustomDrawerContent(props: any) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <LinearGradient
      colors={["#166152", "#004334"]}
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <Image
              source={AuthLogo}
              style={{ width: 110, height: 52, resizeMode: "contain" }}
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("MainTabs", { screen: "SettingsTab" })
            }
            style={{
              borderRadius: 10,
              backgroundColor: appTheme.colors.primaryDark,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Settings
            </Text>
            <Gear size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("MainTabs", { screen: "GroupsTab" })
            }
            style={{
              borderRadius: 10,
              backgroundColor: appTheme.colors.primaryDark,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Resources
            </Text>
            <InfoIcon size={22} color="#fff" />
          </TouchableOpacity>
        </DrawerContentScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              borderRadius: 10,
              backgroundColor: "#156051",
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Logout
            </Text>
            <SignOutIcon size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------------------------------
 * Drawer wraps Tabs
 * --------------------------------- */
const RootDrawer = () => (
  <Drawer.Navigator
    initialRouteName="MainTabs"
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: "front",
      drawerStyle: { width: 280 },
      drawerActiveTintColor: "#111",
      drawerInactiveTintColor: "#666",
    }}
  >
    <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
  </Drawer.Navigator>
);

/* ---------------------------------
 * Auth stack (unauthenticated flow)
 * --------------------------------- */
const AuthStackNav = () => (
  <AuthStackNavStack.Navigator screenOptions={defaultNoHeader}>
    <AuthStackNavStack.Screen name="GetStarted" component={GetStartedScreen} />
    <AuthStackNavStack.Screen name="Login" component={LoginScreen} />
    <AuthStackNavStack.Screen name="Register" component={RegisterScreen} />
  </AuthStackNavStack.Navigator>
);

/* ---------------------------------
 * App Navigator: Switch based on auth state
 * --------------------------------- */
const AppNavigator: React.FC = () => {
  const { token, loading } = useAuth();

  // you can render a splash/loader here if you have one
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {token ? (
        <RootStack.Navigator screenOptions={defaultNoHeader}>
          {/* whole app shell (drawer + tabs) */}
          <RootStack.Screen name="Main" component={RootDrawer} />

          {/* notifications modal-like */}
          <RootStack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              presentation: "transparentModal",
              animation: "none",
              headerShown: false,
            }}
          />

          {/* global public profile */}
          <RootStack.Screen
            name="PublicProfile"
            component={PublicProfileScreen}
            options={{
              headerShown: false,
            }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthStackNav />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
