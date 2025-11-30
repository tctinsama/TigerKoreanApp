// src/services/authService.js
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/config';

class AuthService {
  // Đăng nhập
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNIN, {
        email,
        password,
      });

      const { token, ...userData } = response.data;

      // Lưu token và thông tin user vào AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));

      return response.data; // Trả về data để AuthContext xử lý
    } catch (error) {
      throw error; // Throw error để LoginScreen bắt được
    }
  }

  // Đăng ký
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  }

  // Đăng xuất
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return { success: true };
    } catch (error) {
      // Vẫn xóa local storage dù API thất bại
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return { success: true };
    }
  }

  // Kiểm tra đã đăng nhập
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
