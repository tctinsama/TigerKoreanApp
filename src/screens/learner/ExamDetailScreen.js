import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import examService from '../../services/examService';

const ExamDetailScreen = ({ navigation, route }) => {
  const { examId } = route.params;
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const [examData, sectionsData] = await Promise.all([
        examService.getExamById(examId),
        examService.getSectionsByExam(examId),
      ]);

      setExam(examData);
      setSections(sectionsData.sort((a, b) => a.sectionOrder - b.sectionOrder));
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin đề thi');
      console.error('Error fetching exam details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    const userId = user?.userId;
    if (!userId) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để làm bài thi');
      return;
    }

    Alert.alert(
      'Bắt đầu làm bài',
      'Bạn đã sẵn sàng làm bài thi? Hãy đảm bảo bạn có đủ thời gian và kết nối internet ổn định.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Bắt đầu',
          onPress: async () => {
            try {
              setStarting(true);
              const attempt = await examService.startExam(examId, userId);

              // Save to AsyncStorage for in-progress tracking
              const inProgressData = {
                attemptId: attempt.attemptId,
                examTitle: exam.title,
                startedAt: new Date().toISOString(),
              };
              await AsyncStorage.setItem(
                'topik_in_progress',
                JSON.stringify(inProgressData)
              );

              // Navigate to exam attempt screen
              navigation.navigate('ExamAttempt', { attemptId: attempt.attemptId });
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không thể bắt đầu bài thi');
              console.error('Error starting exam:', err);
            } finally {
              setStarting(false);
            }
          },
        },
      ]
    );
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'LISTENING':
        return '🎧';
      case 'READING':
        return '📖';
      case 'WRITING':
        return '✍️';
      default:
        return '📝';
    }
  };

  const getSectionName = (type) => {
    switch (type) {
      case 'LISTENING':
        return 'Nghe hiểu';
      case 'READING':
        return 'Đọc hiểu';
      case 'WRITING':
        return 'Viết';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải thông tin đề thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exam) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại danh sách</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header với Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackIcon}>←</Text>
          <Text style={styles.headerBackText}>Quay lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Exam Info Card */}
        <View style={styles.examCard}>
          <View style={styles.examCardHeader}>
            <View
              style={[
                styles.examTypeBadge,
                exam.examType === 'TOPIK_I'
                  ? styles.topikIBadge
                  : styles.topikIIBadge,
              ]}
            >
              <Text
                style={[
                  styles.examTypeBadgeText,
                  exam.examType === 'TOPIK_I'
                    ? styles.topikIText
                    : styles.topikIIText,
                ]}
              >
                {exam.examType === 'TOPIK_I' ? 'TOPIK I' : 'TOPIK II'}
              </Text>
            </View>
            {exam.isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Đang mở</Text>
              </View>
            )}
          </View>

          <Text style={styles.examTitle}>{exam.title}</Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statLabel}>Tổng số câu</Text>
              <Text style={styles.statValue}>{exam.totalQuestion}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statValue}>{exam.durationMinutes} phút</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📄</Text>
              <Text style={styles.statLabel}>Số phần thi</Text>
              <Text style={styles.statValue}>
                {sections.length > 0
                  ? sections.length
                  : exam.examType === 'TOPIK_I'
                  ? 2
                  : 3}
              </Text>
            </View>
          </View>
        </View>

        {/* Sections List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cấu trúc đề thi</Text>
            <Text style={styles.sectionCount}>
              {exam.examType === 'TOPIK_I' ? '2 phần thi' : '3 phần thi'}
            </Text>
          </View>

          {sections.map((section, index) => (
            <View key={section.sectionId} style={styles.sectionCard}>
              <View style={styles.sectionCardContent}>
                <Text style={styles.sectionIcon}>
                  {getSectionIcon(section.sectionType)}
                </Text>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionName}>
                    Phần {index + 1}: {getSectionName(section.sectionType)}
                  </Text>
                  <View style={styles.sectionDetails}>
                    <View style={styles.sectionDetailItem}>
                      <Text style={styles.sectionDetailIcon}>📚</Text>
                      <Text style={styles.sectionDetailText}>
                        {section.totalQuestions} câu
                      </Text>
                    </View>
                    <View style={styles.sectionDetailItem}>
                      <Text style={styles.sectionDetailIcon}>⏱️</Text>
                      <Text style={styles.sectionDetailText}>
                        {section.durationMinutes} phút
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionOrderBadge}>
                  <Text style={styles.sectionOrderText}>{section.sectionOrder}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Text style={styles.instructionIcon}>💡</Text>
            <Text style={styles.instructionTitle}>Lưu ý quan trọng</Text>
          </View>
          <View style={styles.instructionList}>
            <Text style={styles.instructionItem}>
              • {exam.examType === 'TOPIK_I'
                ? 'TOPIK I gồm 2 phần: Nghe hiểu (듣기) và Đọc hiểu (읽기)'
                : 'TOPIK II gồm 3 phần: Nghe hiểu (듣기), Viết (쓰기) và Đọc hiểu (읽기)'}
            </Text>
            <Text style={styles.instructionItem}>
              • Bạn sẽ làm lần lượt từng phần thi theo thứ tự
            </Text>
            <Text style={styles.instructionItem}>
              • Mỗi phần có thời gian riêng, hết giờ sẽ tự động chuyển phần
            </Text>
            <Text style={styles.instructionItem}>
              • Không thể quay lại phần đã hoàn thành
            </Text>
            <Text style={styles.instructionItem}>
              • Đảm bảo kết nối internet ổn định trong suốt bài thi
            </Text>
          </View>
        </View>

        {/* Bottom Spacing để tránh bị che bởi button và tab bar */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (starting || !exam.isActive) && styles.startButtonDisabled,
          ]}
          onPress={handleStartExam}
          disabled={starting || !exam.isActive}
        >
          {starting ? (
            <>
              <ActivityIndicator size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startButtonText}>Đang khởi tạo...</Text>
            </>
          ) : (
            <>
              <Text style={styles.startButtonIcon}>▶️</Text>
              <Text style={styles.startButtonText}>Bắt đầu làm bài</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackIcon: {
    fontSize: 24,
    color: '#666',
    marginRight: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  examCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  examTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topikIBadge: {
    backgroundColor: '#FFE8DC',
  },
  topikIIBadge: {
    backgroundColor: '#F3E8FF',
  },
  examTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  topikIText: {
    color: '#FF6B35',
  },
  topikIIText: {
    color: '#9333EA',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  examTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 13,
    color: '#666',
  },
  sectionCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE8DC',
  },
  sectionCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  sectionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDetailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  sectionDetailText: {
    fontSize: 13,
    color: '#666',
  },
  sectionOrderBadge: {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionOrderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  instructionList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
     // Thêm padding để tránh tab bar (tabbar ~70px + spacing)
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  startButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExamDetailScreen;
