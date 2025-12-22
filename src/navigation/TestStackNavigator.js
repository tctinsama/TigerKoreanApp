import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import TopikExamListScreen from '../screens/learner/TopikExamListScreen';
import ExamDetailScreen from '../screens/learner/ExamDetailScreen';
import ExamAttemptScreen from '../screens/learner/ExamAttemptScreen';
import ExamResultScreen from '../screens/learner/ExamResultScreen';

const Stack = createNativeStackNavigator();

const TestStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="TopikExamList" 
        component={TopikExamListScreen}
      />
      <Stack.Screen 
        name="ExamDetail" 
        component={ExamDetailScreen}
      />
      <Stack.Screen 
        name="ExamAttempt" 
        component={ExamAttemptScreen}
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />
      <Stack.Screen 
        name="ExamResult" 
        component={ExamResultScreen}
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />
    </Stack.Navigator>
  );
};

export default TestStackNavigator;
