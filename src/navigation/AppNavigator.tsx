// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import LoginScreen from "@/screens/auth/LoginScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import OTPScreen from "@/screens/auth/OTPScreen";

import HomeScreen from "@/screens/HomeScreen";
import EventScreen from "@/screens/events/EventScreen";
import MembersScreen from "@/screens/members/MembersScreen";
import BusinessScreen from "@/screens/business/BusinessScreen";
import BusinessDetailScreen from "@/screens/business/BusinessDetail";
import GroupsScreen from "@/screens/chat/ChatScreen";
import NotificationsScreen from "@/screens/NotificationScreen";
import EventDetailScreen from "@/screens/events/EventDetail";
import AddEventScreen from "@/screens/events/AddEvent";
import GroupDetailScreen from "@/screens/chat/GroupDetailScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import ProfileEditScreen from "@/screens/profile/ProfileEditScreen";
import PublicProfileScreen from "@/screens/profile/PublicProfileScreen";
import CreateBusiness from "@/screens/business/CreateBusiness";
import EditBusinessScreen from "@/screens/business/EditBusiness";
import CreateJobScreen from "@/screens/business/CreateJob";
import JobDetailScreen from "@/screens/business/JobDetails";
import EditJobScreen from "@/screens/business/EditJob";


// settings
import SettingsScreen from "@/screens/settings/SettingsScreen";
import HelpScreen from "@/screens/settings/HelpScreen";


// 👉 Add your Resources screen import
// Adjust the path/name if your file is named differently (e.g., "@/screens/Resources")
import ResourcesScreen from "@/screens/ResourcesScreen";

import CustomBottomsheet from "@/components/CustomBottomsheet";

import { Gear, InfoIcon, SignOutIcon } from "phosphor-react-native";
import { theme as appTheme } from "@/theme/theme";
import { Image, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import EditEventScreen from "@/screens/events/EditEvent";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import VerifyOtpScreen from "@/screens/auth/OTPForgotPass";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";


import ChatScreen from "@/screens/chat/ChatScreen";
import ChatDetailScreen from "@/screens/chat/ChatDetail";
import UserList from "@/screens/chat/UserList";
import CreateGroupScreen from "@/screens/chat/CreateGroupScreen";
import GroupChatScreen from "@/screens/chat/GroupDetailScreen";
import GroupInfoScreen from "@/screens/chat/GroupInfoScreen";
import EditGroupScreen from "@/screens/chat/EditGroup";
import PrivacyPolicyScreen from "@/screens/settings/PrivacyPolicy";
import TermsConditonScreen from "@/screens/settings/TermsConditon";
import ContactSupportScreen from "@/screens/settings/ContactSupport";
import ChangePasswordScreen from "@/screens/auth/ChangePasswordScreen";

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
export type RootStackParamList = {
  Main: undefined; // Drawer containing tabs etc.
  Notifications: undefined;
  PublicProfile: { userId: string };
ChangePassword: undefined;

};

// Auth stack (login/register flow BEFORE token)
export type AuthStackParamList = {
  GetStarted: undefined;
  Login: undefined;
  Register: undefined;
OTP: { email: string };
ForgotPassword: undefined;

  VerifyOtp: { email: string };
  ResetPassword: { email: string };

};

// Events tab stack
export type EventsStackParamList = {
  Events: undefined;
  AddEvent: undefined;
  EventDetail: { eventId: string | number };
  EditEvent: { id?: string } | undefined;

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
  EditBusiness: { id?: string } | undefined;
  PostJob: { id?: string } | undefined;
  JobDetail: { id?: string } | undefined;
  EditJob: { id?: string } | undefined;
};

// Groups tab stack
export type GroupsStackParamList = {
  Groups: undefined;
  GroupDetail: { group?: any } | undefined;
  GroupInfo: { groupId?: any } | undefined;
  EditGroup: { groupId?: any } | undefined;

  CreateGroupScreen:undefined;

  Chat: undefined;
  UserListScreen: undefined;

  ChatDetail: { roomId?: string } | undefined;

};

// Settings tab stack
export type SettingsStackParamList = {
  Settings: undefined;
  Help:undefined;
  ContactSupport:undefined;
  PrivacyPolicy:undefined;

  TermsConditions:undefined;
  ChangePassword:undefined




};

// ✅ Resources stack
export type ResourceStackParamList = {
  Resource: undefined;
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

// ✅ Resources stack instance
const ResourceStack = createStackNavigator<ResourceStackParamList>();

const ProfileStack = createStackNavigator<ProfileStackParamList>();

const defaultNoHeader: StackNavigationOptions = { headerShown: false };

/* ---------------------------------
 * Profile stack (private profile/edit)
 * --------------------------------- */
const ProfileStackNav = () => (
  <ProfileStack.Navigator screenOptions={defaultNoHeader}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
  </ProfileStack.Navigator>
);

/* ---------------------------------
 * Home tab stack
 * --------------------------------- */
const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={defaultNoHeader}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

/* ---------------------------------
 * Events tab stack
 * --------------------------------- */
const EventsStackNav = () => (
  <EventsStack.Navigator screenOptions={defaultNoHeader}>
    <EventsStack.Screen name="Events" component={EventScreen} />
    <EventsStack.Screen name="AddEvent" component={AddEventScreen} />
    <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
        <EventsStack.Screen name="EditEvent" component={EditEventScreen} />

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
    <BusinessStack.Screen name="EditBusiness" component={EditBusinessScreen} />
    <BusinessStack.Screen name="PostJob" component={CreateJobScreen} />
    <BusinessStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
    <BusinessStack.Screen name="JobDetail" component={JobDetailScreen} />
    <BusinessStack.Screen name="EditJob" component={EditJobScreen} />
  </BusinessStack.Navigator>
);

/* ---------------------------------
 * Groups tab stack
 * --------------------------------- */
const GroupsStackNav = () => (
  <GroupsStack.Navigator screenOptions={defaultNoHeader}>
    <GroupsStack.Screen name="Chat" component={ChatScreen} />
    <GroupsStack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <GroupsStack.Screen name="EditGroup" component={EditGroupScreen} />

<GroupsStack.Screen
      name="UserListScreen"
      component={UserList}
      options={{ title: "Select User" }}
    />
        <GroupsStack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />

    {/* <GroupsStack.Screen name="Groups" component={GroupsScreen} /> */}
    <GroupsStack.Screen name="GroupDetail" component={GroupChatScreen} />
        <GroupsStack.Screen name="GroupInfo" component={GroupInfoScreen} />

  </GroupsStack.Navigator>
);

/* ---------------------------------
 * Settings tab stack
 * --------------------------------- */
const SettingsStackNav = () => (
  <SettingsStack.Navigator screenOptions={defaultNoHeader}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    <SettingsStack.Screen name="Help" component={HelpScreen} />
    <SettingsStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <SettingsStack.Screen name="TermsConditions" component={TermsConditonScreen} />
    <SettingsStack.Screen name="ContactSupport" component={ContactSupportScreen} />


  </SettingsStack.Navigator>
);

/* ---------------------------------
 * ✅ Resources stack nav
 * --------------------------------- */
const ResourceStackNav = () => (
  <ResourceStack.Navigator screenOptions={defaultNoHeader}>
    <ResourceStack.Screen name="Resource" component={ResourcesScreen} />
  </ResourceStack.Navigator>
);

/* ---------------------------------
 * Bottom Tabs (inside Drawer)
 * --------------------------------- */
const MainTabNavigator = () => {
  useTheme(); // keeps theme reactive in tab bar

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomsheet {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: "Home" }} />
      <Tab.Screen name="EventsTab" component={EventsStackNav} options={{ title: "Events" }} />
      <Tab.Screen name="MembersTab" component={MembersStackNav} options={{ title: "Members" }} />
      <Tab.Screen name="BusinessTab" component={BusinessStackNav} options={{ title: "Business" }} />
      <Tab.Screen name="GroupsTab" component={GroupsStackNav} options={{ title: "Groups" }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNav} options={{ title: "Settings" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNav} options={{ title: "Profile" }} />
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

          {/* ✅ Navigate directly to the Resources drawer route */}
          <TouchableOpacity
            onPress={() => props.navigation.navigate("Resources")}
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
    {/* ✅ Register Resources as a drawer route */}
    <Drawer.Screen name="Resources" component={ResourceStackNav} />
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
    <AuthStackNavStack.Screen name="OTP" component={OTPScreen} />
<AuthStackNavStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStackNavStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <AuthStackNavStack.Screen name="ResetPassword" component={ResetPasswordScreen} />

  </AuthStackNavStack.Navigator>
);

/* ---------------------------------
 * App Navigator: Switch based on auth state
 * --------------------------------- */
const AppNavigator: React.FC = () => {
  const { token, loading } = useAuth();

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
            options={{ headerShown: false }}
          />
            <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        </RootStack.Navigator>
      ) : (
        <AuthStackNav />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
