import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Import các màn hình
import HomeScreen from '../screens/learner/HomeScreen';
import PlacementTestScreen from '../screens/PlacementTestScreen';
import PathStackNavigator from './PathStackNavigator';
import ProfileScreen from '../screens/learner/ProfileScreen';

const Tab = createBottomTabNavigator();

const LearnerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      
      <Tab.Screen 
        name="TestTab" 
        component={PlacementTestScreen}
        options={{
          tabBarLabel: 'Thi',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📝</Text>,
        }}
      />
      
      <Tab.Screen 
        name="PathTab" 
        component={PathStackNavigator}
        options={{
          tabBarLabel: 'Lộ trình',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🗺️</Text>,
        }}
      />
      
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default LearnerTabNavigator;
