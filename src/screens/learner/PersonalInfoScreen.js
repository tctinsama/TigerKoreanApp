import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

const PersonalInfoScreen = ({ navigation }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = authUser?.userId;
      if (!userId) return;

      const response = await apiClient.get(`/users/${userId}`);
      
      // Convert date from yyyy-MM-dd to dd/MM/yyyy for display
      let displayDate = response.data.dateOfBirth || 'Chưa cập nhật';
      if (displayDate && displayDate !== 'Chưa cập nhật' && displayDate.includes('-')) {
        const [year, month, day] = displayDate.split('-');
        displayDate = `${day}/${month}/${year}`;
      }
      
      const userData = {
        ...response.data,
        dateOfBirth: displayDate,
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

  const updateUserInDatabase = async (updatedData) => {
    try {
      if (!user?.userId) return;

      // Convert date from dd/MM/yyyy to yyyy-MM-dd for backend
      const dataToSend = { ...user, ...updatedData };
      if (dataToSend.dateOfBirth && dataToSend.dateOfBirth !== 'Chưa cập nhật' && dataToSend.dateOfBirth.includes('/')) {
        const [day, month, year] = dataToSend.dateOfBirth.split('/');
        dataToSend.dateOfBirth = `${year}-${month}-${day}`;
      }

      const response = await apiClient.put(
        `/users/${user.userId}`,
        dataToSend
      );

      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
      throw error;
    }
  };

  const handleEditField = (field) => {
    setEditingField(field);
    const currentValue = user?.[field] === 'Chưa cập nhật' ? '' : user?.[field] || '';
    setFieldValue(currentValue);
    
    // Nếu là ngày sinh, parse date
    if (field === 'dateOfBirth' && currentValue && currentValue !== '') {
      try {
        const [day, month, year] = currentValue.split('/');
        if (day && month && year) {
          setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
      } catch (error) {
        setSelectedDate(new Date());
      }
    }
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      setFieldValue(`${day}/${month}/${year}`);
    }
  };

  const handleSaveField = async (field) => {
    try {
      setLoading(true);
      const value = fieldValue.trim() || 'Chưa cập nhật';

      await updateUserInDatabase({ [field]: value });

      setUser({ ...user, [field]: value });
      setEditingField(null);
    } catch (error) {
      console.error(`Lỗi khi cập nhật trường ${field}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldWithEdit = (label, field, type = 'text') => {
    const value = user?.[field] || 'Chưa cập nhật';
    const isEditingThis = editingField === field;

    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditingThis ? (
          <View>
            {type === 'select' && field === 'gender' ? (
              <View style={styles.selectContainer}>
                {['Nam', 'Nữ', 'Khác'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.selectOption,
                      fieldValue === option && styles.selectOptionActive,
                    ]}
                    onPress={() => setFieldValue(option)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        fieldValue === option && styles.selectOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : type === 'date' && field === 'dateOfBirth' ? (
              <View>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {fieldValue || 'Chọn ngày sinh'}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>
            ) : (
              <TextInput
                style={styles.fieldInput}
                value={fieldValue}
                onChangeText={setFieldValue}
                placeholder={`Nhập ${label.toLowerCase()}`}
                keyboardType={type === 'email' ? 'email-address' : 'default'}
              />
            )}
            <View style={styles.fieldActions}>
              <TouchableOpacity
                style={[styles.fieldActionBtn, styles.saveBtn]}
                onPress={() => handleSaveField(field)}
              >
                <Text style={styles.fieldActionText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fieldActionBtn, styles.cancelBtn]}
                onPress={() => {
                  setEditingField(null);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.fieldActionText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.fieldValueRow}>
            <Text
              style={[
                styles.fieldValue,
                value === 'Chưa cập nhật' && styles.fieldValueEmpty,
              ]}
            >
              {value}
            </Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEditField(field)}
            >
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {/* Họ và tên */}
          {renderFieldWithEdit('Họ và tên', 'fullName')}

          {/* Email */}
          {renderFieldWithEdit('Email', 'email', 'email')}

          {/* Ngày sinh */}
          {renderFieldWithEdit('Ngày sinh', 'dateOfBirth', 'date')}

          {/* Giới tính */}
          {renderFieldWithEdit('Giới tính', 'gender', 'select')}
        </View>

        <View style={{ height: 30 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  fieldRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  fieldValueEmpty: {
    color: '#999',
    fontStyle: 'italic',
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    paddingVertical: 8,
    marginBottom: 12,
  },
  editBtn: {
    padding: 8,
  },
  editBtnText: {
    fontSize: 20,
    color: '#FF6B35',
  },
  fieldActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  fieldActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
  },
  cancelBtn: {
    backgroundColor: '#F44336',
  },
  fieldActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  selectOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectOptionActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  selectOptionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  selectOptionTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 20,
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

export default PersonalInfoScreen;
