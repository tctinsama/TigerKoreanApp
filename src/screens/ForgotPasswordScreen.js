import React, { useState } from 'react';
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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email.trim(),
        platform: 'mobile', // Backend dùng để tạo deep link cho mobile
      });
      
      setSuccess(true);
      Alert.alert(
        'Thành công',
        'Nếu email hợp lệ, hệ thống đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      setEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Gửi yêu cầu thất bại, vui lòng thử lại.'
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
              <Text style={styles.subtitle}>Quên mật khẩu</Text>
              <Text style={styles.description}>
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
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

export default ForgotPasswordScreen;
