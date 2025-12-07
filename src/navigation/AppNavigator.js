import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import LearnerTabNavigator from './LearnerTabNavigator';
import PersonalInfoScreen from '../screens/learner/PersonalInfoScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Deep linking configuration
  const linking = {
    prefixes: ['tigerkorean://', 'https://tigerkorean.app', 'http://localhost:5173'],
    config: {
      screens: {
        Login: 'login',
        SignUp: 'signup',
        ForgotPassword: 'forgot-password',
        ResetPassword: {
          path: 'reset-password',
          parse: {
            token: (token) => token,
          },
        },
        MainTabs: {
          screens: {
            HomeTab: 'home',
            TestTab: 'test',
            PathTab: 'path',
            ProfileTab: 'profile',
          },
        },
        PersonalInfo: 'personal-info',
      },
    },
  };

  // Hiển thị loading khi đang kiểm tra auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // Màn hình cho người dùng đã đăng nhập
          <>
            <Stack.Screen name="MainTabs" component={LearnerTabNavigator} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          </>
        ) : (
          // Màn hình cho người dùng chưa đăng nhập
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AppNavigator;
