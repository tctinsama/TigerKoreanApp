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

const TopikExamListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [inProgressExam, setInProgressExam] = useState(null);
  const [completedExamIds, setCompletedExamIds] = useState(new Set());

  useEffect(() => {
    fetchExams();
    checkInProgressExam();
    fetchUserExamAttempts();
  }, []);

  const checkInProgressExam = async () => {
    try {
      const saved = await AsyncStorage.getItem('topik_in_progress');
      if (saved) {
        const data = JSON.parse(saved);
        setInProgressExam(data);
      }
    } catch (err) {
      console.error('Error parsing saved exam:', err);
      await AsyncStorage.removeItem('topik_in_progress');
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getActiveExams();
      setExams(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đề thi');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExamAttempts = async () => {
    try {
      const userId = user?.userId;
      if (!userId) {
        return;
      }

      const attempts = await examService.getAttemptsByUser(userId);
      const completedIds = new Set(
        attempts
          .filter((attempt) => attempt.status === 'COMPLETED')
          .map((attempt) => attempt.examId)
          .filter((id) => id !== undefined)
      );
      setCompletedExamIds(completedIds);
    } catch (err) {
      console.error('Error fetching user exam attempts:', err);
    }
  };

  const getExamTypeLabel = (type) => {
    switch (type) {
      case 'TOPIK_I':
        return 'TOPIK I';
      case 'TOPIK_II':
        return 'TOPIK II';
      default:
        return type;
    }
  };

  const filteredExams =
    activeTab === 'ALL'
      ? exams
      : exams.filter((exam) => exam.examType === activeTab);

  const topikICount = exams.filter((e) => e.examType === 'TOPIK_I').length;
  const topikIICount = exams.filter((e) => e.examType === 'TOPIK_II').length;

  const handleRemoveInProgress = async () => {
    await AsyncStorage.removeItem('topik_in_progress');
    setInProgressExam(null);
  };

  const handleContinueExam = () => {
    if (inProgressExam) {
      navigation.navigate('ExamAttempt', { attemptId: inProgressExam.attemptId });
    }
  };

  const handleStartExam = (exam) => {
    navigation.navigate('ExamDetail', { examId: exam.examId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải đề thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>📄</Text>
          </View>
          <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchExams}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (exams.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📄</Text>
          </View>
          <Text style={styles.emptyTitle}>Chưa có đề thi</Text>
          <Text style={styles.emptyMessage}>
            Hiện tại chưa có đề thi TOPIK nào được mở. Vui lòng quay lại sau.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đề thi TOPIK</Text>
          <Text style={styles.headerSubtitle}>Chọn đề thi để bắt đầu luyện tập</Text>
        </View>

        {/* In-Progress Exam Banner */}
        {inProgressExam && (
          <View style={styles.inProgressBanner}>
            <View style={styles.inProgressContent}>
              <View style={styles.inProgressIcon}>
                <Text style={styles.inProgressIconText}>▶️</Text>
              </View>
              <View style={styles.inProgressInfo}>
                <Text style={styles.inProgressTitle}>Bài thi đang làm dở</Text>
                <Text style={styles.inProgressExamTitle}>
                  {inProgressExam.examTitle}
                </Text>
              </View>
            </View>
            <View style={styles.inProgressActions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleRemoveInProgress}
              >
                <Text style={styles.skipButtonText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinueExam}
              >
                <Text style={styles.continueButtonText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ALL' && styles.activeTab]}
            onPress={() => setActiveTab('ALL')}
          >
            <Text
              style={[styles.tabText, activeTab === 'ALL' && styles.activeTabText]}
            >
              Tất cả ({exams.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'TOPIK_I' && styles.activeTab]}
            onPress={() => setActiveTab('TOPIK_I')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'TOPIK_I' && styles.activeTabText,
              ]}
            >
              TOPIK I ({topikICount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'TOPIK_II' && styles.activeTab]}
            onPress={() => setActiveTab('TOPIK_II')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'TOPIK_II' && styles.activeTabText,
              ]}
            >
              TOPIK II ({topikIICount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exam List */}
        <View style={styles.examList}>
          {filteredExams.map((exam) => (
            <View key={exam.examId} style={styles.examCard}>
              {/* Header */}
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
                    {getExamTypeLabel(exam.examType)}
                  </Text>
                </View>
                {exam.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Đang mở</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={styles.examTitle}>{exam.title}</Text>

              {/* Info */}
              <View style={styles.examInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📚</Text>
                  <Text style={styles.infoText}>{exam.totalQuestion} câu hỏi</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>⏱️</Text>
                  <Text style={styles.infoText}>{exam.durationMinutes} phút</Text>
                </View>
                {exam.sections && exam.sections.length > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📄</Text>
                    <Text style={styles.infoText}>
                      {exam.sections.length} phần thi
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.startButton,
                  completedExamIds.has(exam.examId) && styles.retakeButton,
                ]}
                onPress={() => handleStartExam(exam)}
              >
                <Text style={styles.startButtonText}>
                  {completedExamIds.has(exam.examId) ? 'Làm lại' : 'Bắt đầu thi'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Text style={styles.infoSectionIcon}>🏆</Text>
            <View style={styles.infoSectionContent}>
              <Text style={styles.infoSectionTitle}>Về kỳ thi TOPIK</Text>
              <Text style={styles.infoSectionText}>
                TOPIK (Test of Proficiency in Korean) là kỳ thi đánh giá năng lực
                tiếng Hàn của người nước ngoài. TOPIK I dành cho người mới bắt đầu,
                TOPIK II dành cho trình độ trung cấp và nâng cao.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 32,
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
    marginBottom: 16,
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
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inProgressBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  inProgressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inProgressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inProgressIconText: {
    fontSize: 24,
  },
  inProgressInfo: {
    flex: 1,
  },
  inProgressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  inProgressExamTitle: {
    fontSize: 13,
    color: '#666',
  },
  inProgressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  examList: {
    padding: 16,
    paddingBottom: 100,
  },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4CAF50',
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  examInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#4CAF50',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  infoSectionHeader: {
    flexDirection: 'row',
  },
  infoSectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoSectionContent: {
    flex: 1,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoSectionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default TopikExamListScreen;
