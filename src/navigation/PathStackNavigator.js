import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LevelSelectScreen from '../screens/learner/LevelSelectScreen';
import LessonPathScreen from '../screens/learner/LessonPathScreen';
import ChatBotScreen from '../screens/learner/ChatBotScreen';
import ConversationTopicsScreen from '../screens/learner/ConversationTopicsScreen';
import ConversationPracticeScreen from '../screens/learner/ConversationPracticeScreen';

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
        name="ChatBot" 
        component={ChatBotScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="ConversationTopics" 
        component={ConversationTopicsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ConversationPractice" 
        component={ConversationPracticeScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

export default PathStackNavigator;
