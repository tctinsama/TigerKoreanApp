import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import API_CONFIG from '../../constants/config';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = authUser?.userId;
      if (!userId) return;

      const response = await apiClient.get(`/users/${userId}`);
      const userData = {
        ...response.data,
        dateOfBirth: response.data.dateOfBirth || 'Chưa cập nhật',
        gender: response.data.gender || 'Chưa cập nhật',
      };
      setUser(userData);
    } catch (error) {
      console.error('Lỗi khi fetch user:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // ==================== AVATAR UPLOAD LOGIC ====================
  
  // Upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      name: `avatar_${Date.now()}.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('upload_preset', API_CONFIG.CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', API_CONFIG.CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${API_CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload thất bại');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('❌ Lỗi upload Cloudinary:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  };

  // Cập nhật user vào database
  const updateUserInDatabase = async (updatedData) => {
    if (!user?.userId) return;

    try {
      const backendData = {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || null,
        address: user.address || null,
        dateOfBirth: user.dateOfBirth !== 'Chưa cập nhật' ? user.dateOfBirth : null,
        gender: user.gender !== 'Chưa cập nhật' ? user.gender : null,
        avatarImage: updatedData.avatarImage || user.avatarImage || null,
        joinDate: user.joinDate,
        userStatus: 1,
        userName: user.userName || null,
        password: null,
      };

      console.log('🔍 Data gửi lên backend:', JSON.stringify(backendData, null, 2));

      const response = await apiClient.put(`/users/${user.userId}`, backendData);
      
      console.log('✅ Backend response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật:', error);
      throw new Error('Lỗi khi cập nhật thông tin');
    }
  };

  // Xử lý khi click vào avatar để đổi ảnh
  const handleAvatarClick = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh để thay đổi ảnh đại diện.'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleAvatarUpload(result.assets[0].uri);
    }
  };

  // Upload avatar lên Cloudinary và update database
  const handleAvatarUpload = async (imageUri) => {
    try {
      setUploadingAvatar(true);
      Alert.alert('Đang xử lý', 'Đang tải ảnh lên...');

      // BƯỚC 1: Upload lên Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
      console.log('✅ Avatar uploaded to Cloudinary:', cloudinaryUrl);

      // BƯỚC 2: Cập nhật vào database
      await updateUserInDatabase({ avatarImage: cloudinaryUrl });

      // BƯỚC 3: Cập nhật state React (hiển thị ngay trên UI)
      const updatedUser = { ...user, avatarImage: cloudinaryUrl };
      setUser(updatedUser);

      // BƯỚC 4: Cập nhật AsyncStorage (persist khi reload app)
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const localUser = JSON.parse(userStr);
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            ...localUser,
            avatarImage: cloudinaryUrl,
          })
        );
      }

      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi upload avatar:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Lỗi khi tải ảnh lên. Vui lòng thử lại.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 1,
      icon: '👤',
      title: 'Thông tin cá nhân',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      id: 2,
      icon: '🔐',
      title: 'Đổi mật khẩu',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 3,
      icon: '📊',
      title: 'Thống kê học tập',
      onPress: () => navigation.navigate('LearningStats'),
    },
    {
      id: 4,
      icon: '⚙️',
      title: 'Cài đặt',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      id: 5,
      icon: '🎯',
      title: 'Mục tiêu',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      id: 6,
      icon: '🔔',
      title: 'Thông báo',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      id: 7,
      icon: '❓',
      title: 'Trợ giúp',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
  ];

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không có thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" translucent={true} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarClick}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : user?.avatarImage ? (
              <Image
                source={{ uri: user.avatarImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Nút Camera để upload */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleAvatarClick}
            disabled={uploadingAvatar}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarLoading: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cameraIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;
