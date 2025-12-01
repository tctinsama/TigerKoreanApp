import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LevelSelectScreen from '../screens/learner/LevelSelectScreen';
import LessonPathScreen from '../screens/learner/LessonPathScreen';
import LessonDetailScreen from '../screens/learner/LessonDetailScreen';

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
    </Stack.Navigator>
  );
};

export default PathStackNavigator;
