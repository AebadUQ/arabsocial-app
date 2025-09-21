import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomSheet from '../components/CustomBottomSheet';

import HomeScreen from '../screens/HomeScreen';
import EventScreen from '../screens/EventScreen';
import MembersScreen from '../screens/MembersScreen'
import BusinessScreen from '../screens/BusinessScreen';
import GroupScreen from '../screens/GroupScreen'
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomSheet {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventScreen} />
      <Tab.Screen name="Memebers" component={MembersScreen} />
      <Tab.Screen name="Business" component={BusinessScreen} />
      <Tab.Screen name="Group" component={GroupScreen} />


    </Tab.Navigator>
  );
};

export default MainTabNavigator;
