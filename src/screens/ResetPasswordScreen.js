import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Lấy token từ route params (deep link)
    const resetToken = route?.params?.token;
    if (resetToken) {
      setToken(resetToken);
    } else {
      Alert.alert(
        'Lỗi',
        'Liên kết không hợp lệ hoặc đã hết hạn.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  }, [route]);

  const handleSubmit = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token) {
      Alert.alert('Lỗi', 'Token không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      Alert.alert(
        'Thành công',
        'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập lại.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message ||
          'Có lỗi xảy ra, hãy thử lại hoặc gửi lại yêu cầu mới.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>🐯 TigerKorean</Text>
              <Text style={styles.subtitle}>Đặt lại mật khẩu</Text>
              <Text style={styles.description}>
                Nhập mật khẩu mới cho tài khoản của bạn
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Mật khẩu mới */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Mật khẩu mới <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Xác nhận mật khẩu */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>

              <View style={styles.backContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.backLink}>← Quay lại đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B35',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  eyeIconText: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#FFB399',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  backLink: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
