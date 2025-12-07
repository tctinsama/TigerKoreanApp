import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Import các màn hình
import HomeScreen from '../screens/learner/HomeScreen';
import PlacementTestScreen from '../screens/PlacementTestScreen';
import PathStackNavigator from './PathStackNavigator';
import ProfileScreen from '../screens/learner/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Tab bar always visible since ConversationTopics/Practice are now in AppNavigator
  const currentRoute = state.routes[state.index];
  const nestedRoute = currentRoute.state?.routes[currentRoute.state?.index];
  
  // Hide tab bar only if nested route exists and matches specific screens
  const shouldHideTabBar = nestedRoute?.name === 'ChatBot';

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon mapping
          let iconName = 'home';
          let IconComponent = MaterialCommunityIcons;

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home-heart';
              break;
            case 'TestTab':
              iconName = 'file-document-multiple-outline';
              break;
            case 'PathTab':
              iconName = 'map-marker-path';
              break;
            case 'ProfileTab':
              iconName = 'account-circle-outline';
              break;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive
              ]}>
                <IconComponent
                  name={iconName}
                  size={isFocused ? 28 : 24}
                  color={isFocused ? COLORS.primary : COLORS.textDisabled}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const LearnerTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
      />
      
      <Tab.Screen 
        name="TestTab" 
        component={PlacementTestScreen}
      />
      
      <Tab.Screen 
        name="PathTab" 
        component={PathStackNavigator}
      />
      
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: COLORS.primaryLight,
    transform: [{ scale: 1.05 }],
  },
});

export default LearnerTabNavigator;
