import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LevelSelectScreen from '../screens/learner/LevelSelectScreen';
import LessonPathScreen from '../screens/learner/LessonPathScreen';

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
    </Stack.Navigator>
  );
};

export default PathStackNavigator;
