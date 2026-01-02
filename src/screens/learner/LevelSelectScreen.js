import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { levelService } from '../../services/levelService';
import { useAuth } from '../../contexts/AuthContext';

// Global variable to track if popup was shown in current session
let hasShownPopupThisSession = false;

const levelConfigs = [
  { color: '#10B981', bgColor: '#D1FAE5', icon: '📚' },
  { color: '#3B82F6', bgColor: '#DBEAFE', icon: '🎯' },
  { color: '#8B5CF6', bgColor: '#EDE9FE', icon: '⭐' },
  { color: '#F59E0B', bgColor: '#FEF3C7', icon: '🏆' },
  { color: '#EF4444', bgColor: '#FEE2E2', icon: '🚀' },
  { color: '#6366F1', bgColor: '#E0E7FF', icon: '👑' },
  { color: '#EC4899', bgColor: '#FCE7F3', icon: '🎓' },
  { color: '#FACC15', bgColor: '#FEF9C3', icon: '🏅' },
];

const LevelSelectScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlacementPopup, setShowPlacementPopup] = useState(false);

  useEffect(() => {
    loadLevels();
  }, []);

  // Reset popup tracking when user changes (logout/login)
  useEffect(() => {
    if (user?.userId) {
      hasShownPopupThisSession = false;
    }
  }, [user?.userId]);

  const loadLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await levelService.getAllLevels();
      setLevels(data);
      
      // Show placement popup once per session
      const userId = user?.userId;
      if (userId && !hasShownPopupThisSession) {
        setShowPlacementPopup(true);
        hasShownPopupThisSession = true;
      }
    } catch (err) {
      console.error('Load levels error:', err);
      setError('Không thể tải dữ liệu cấp độ');
      Alert.alert('Lỗi', 'Không thể tải dữ liệu cấp độ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelPress = (levelId, levelName) => {
    navigation.navigate('LessonPath', { levelId, levelName });
  };

  const handleStartPlacementTest = () => {
    setShowPlacementPopup(false);
    navigation.navigate('PlacementTest');
  };

  const handleClosePopup = () => {
    setShowPlacementPopup(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải dữ liệu cấp độ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLevels}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (levels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📚</Text>
        <Text style={styles.emptyTitle}>Chưa có cấp độ nào</Text>
        <Text style={styles.emptySubtitle}>Vui lòng liên hệ quản trị viên</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" translucent={true} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Chọn Cấp Độ <Text style={styles.headerTitleHighlight}>TOPIK</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Bắt đầu hành trình học tiếng Hàn của bạn
        </Text>
        <Text style={styles.headerCount}>Có {levels.length} cấp độ để bạn lựa chọn</Text>
      </View>

      {/* Levels Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {levels.map((level, index) => {
            const config = levelConfigs[index % levelConfigs.length];

            return (
              <TouchableOpacity
                key={level.levelId}
                style={[styles.levelCard, { backgroundColor: config.bgColor }]}
                onPress={() => handleLevelPress(level.levelId, level.levelName)}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
                  <Text style={styles.icon}>{config.icon}</Text>
                </View>

                {/* Level Info */}
                <View style={styles.levelInfo}>
                  <Text style={styles.levelName}>{level.levelName}</Text>
                  <Text style={styles.levelDescription} numberOfLines={2}>
                    {level.description || `Học tiếng Hàn cấp độ ${level.levelId}`}
                  </Text>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Text style={[styles.arrow, { color: config.color }]}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Placement Test Popup */}
      <Modal
        visible={showPlacementPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClosePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClosePopup}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.popupIcon}>
              <Text style={styles.popupIconText}>⭐</Text>
            </View>

            {/* Title */}
            <Text style={styles.popupTitle}>Kiểm tra trình độ</Text>

            {/* Description */}
            <Text style={styles.popupDescription}>
              Làm bài kiểm tra nhanh để chúng tôi{' '}
              <Text style={styles.popupDescriptionBold}>đề xuất cấp độ phù hợp</Text>
              {' '}với trình độ hiện tại của bạn!
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitCheck}>
                  <Text style={styles.benefitCheckText}>✓</Text>
                </View>
                <Text style={styles.benefitText}>Chỉ mất 5 phút</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitCheck}>
                  <Text style={styles.benefitCheckText}>✓</Text>
                </View>
                <Text style={styles.benefitText}>9 câu hỏi đơn giản</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitCheck}>
                  <Text style={styles.benefitCheckText}>✓</Text>
                </View>
                <Text style={styles.benefitText}>Kết quả ngay lập tức</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.popupButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClosePopup}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.startTestButton}
                onPress={handleStartPlacementTest}
              >
                <Text style={styles.startTestButtonText}>Làm thử 🚀</Text>
              </TouchableOpacity>
            </View>

            {/* Skip text */}
            <Text style={styles.skipText}>
              Bạn có thể chọn cấp độ trực tiếp nếu đã biết trình độ của mình
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  popupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE8DC',
    borderWidth: 3,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  popupIconText: {
    fontSize: 40,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 12,
  },
  popupDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  popupDescriptionBold: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  benefitsContainer: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFE8DC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitCheckText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  startTestButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startTestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerTitleHighlight: {
    color: '#FFE4B5',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  headerCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    gap: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LevelSelectScreen;
