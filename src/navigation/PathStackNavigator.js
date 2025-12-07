import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LevelSelectScreen from '../screens/learner/LevelSelectScreen';
import LessonPathScreen from '../screens/learner/LessonPathScreen';
import LessonDetailScreen from '../screens/learner/LessonDetailScreen';
import LeaderboardScreen from '../screens/learner/LeaderboardScreen';
import PersonalInfoScreen from '../screens/learner/PersonalInfoScreen';

const Stack = createNativeStackNavigator();

const PathStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="LevelSelect" 
        component={LevelSelectScreen}
      />
      <Stack.Screen 
        name="LessonPath" 
        component={LessonPathScreen}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen}
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="PersonalInfo" 
        component={PersonalInfoScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default PathStackNavigator;
