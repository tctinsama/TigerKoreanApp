import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

const LearningStatsScreen = ({ navigation }) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalPoints: 0,
    streak: 0,
    level: 1,
  });

  useEffect(() => {
    fetchLearningStats();
  }, []);

  const fetchLearningStats = async () => {
    const userId = authUser?.userId;
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // Fetch 3 API song song
      const [userXPResponse, progressResponse] = await Promise.all([
        apiClient.get(`/user-xp/${userId}`).catch(() => null),
        apiClient.get(`/user-progress/user/${userId}`).catch(() => null),
      ]);

      // Lấy dữ liệu XP (totalPoints, level)
      const userXP = userXPResponse?.data || null;
      const totalPoints = userXP?.totalXP || 0;
      const level = userXP?.levelNumber || 1;

      // Lấy dữ liệu Progress (completedLessons, streak)
      const progressData = progressResponse?.data || [];
      
      // Đếm số bài học đã hoàn thành
      const completedLessons = progressData.filter(
        (p) => p.isLessonCompleted === true
      ).length;

      // Tính streak (số ngày học liên tiếp)
      const streak = calculateStreak(progressData);

      console.log('📊 Learning Stats:', {
        completedLessons,
        totalPoints,
        streak,
        level,
      });

      setStats({
        completedLessons,
        totalPoints,
        streak,
        level,
      });
    } catch (error) {
      console.error('Lỗi khi fetch learning stats:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê học tập');
    } finally {
      setLoading(false);
    }
  };

  // Hàm tính số ngày học liên tiếp (giống logic website)
  const calculateStreak = (progressData) => {
    if (progressData.length === 0) return 0;

    // Lấy các ngày duy nhất và sắp xếp giảm dần
    const uniqueDates = Array.from(
      new Set(
        progressData
          .filter((p) => p.lastAccessed)
          .map((p) => {
            const date = new Date(p.lastAccessed);
            date.setHours(0, 0, 0, 0);
            return date.toISOString();
          })
      )
    )
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    if (uniqueDates.length === 0) return 0;

    // Kiểm tra xem ngày gần nhất có phải hôm nay hoặc hôm qua không
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(uniqueDates[0]);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Nếu ngày cuối cùng không phải hôm nay hoặc hôm qua, streak = 0
    if (daysDiff > 1) return 0;

    // Đếm số ngày liên tiếp
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const prevDate = new Date(uniqueDates[i]);
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê học tập</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Completed Lessons */}
          <View style={[styles.statCard, styles.blueCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📚</Text>
            </View>
            <Text style={styles.statLabel}>Bài học đã hoàn thành</Text>
            <Text style={[styles.statValue, styles.blueText]}>
              {stats.completedLessons}
            </Text>
          </View>

          {/* Total Points */}
          <View style={[styles.statCard, styles.greenCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⭐</Text>
            </View>
            <Text style={styles.statLabel}>Điểm tích lũy</Text>
            <Text style={[styles.statValue, styles.greenText]}>
              {stats.totalPoints}
            </Text>
          </View>

          {/* Streak */}
          <View style={[styles.statCard, styles.orangeCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🔥</Text>
            </View>
            <Text style={styles.statLabel}>Số ngày học liên tiếp</Text>
            <Text style={[styles.statValue, styles.orangeText]}>
              {stats.streak}
            </Text>
          </View>

          {/* Level */}
          <View style={[styles.statCard, styles.purpleCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🏆</Text>
            </View>
            <Text style={styles.statLabel}>Cấp độ hiện tại</Text>
            <Text style={[styles.statValue, styles.purpleText]}>
              {stats.level}
            </Text>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageIcon}>💪</Text>
          <Text style={styles.messageTitle}>Tiếp tục phấn đấu!</Text>
          <Text style={styles.messageText}>
            Bạn đang làm rất tốt! Hãy tiếp tục học tập đều đặn mỗi ngày để duy trì streak và nâng cao trình độ tiếng Hàn của mình.
          </Text>
        </View>

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  blueCard: {
    backgroundColor: '#E3F2FD',
  },
  greenCard: {
    backgroundColor: '#E8F5E9',
  },
  orangeCard: {
    backgroundColor: '#FFF3E0',
  },
  purpleCard: {
    backgroundColor: '#F3E5F5',
  },
  statIconContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 32,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  blueText: {
    color: '#1976D2',
  },
  greenText: {
    color: '#388E3C',
  },
  orangeText: {
    color: '#F57C00',
  },
  purpleText: {
    color: '#7B1FA2',
  },
  messageCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#FFE8DC',
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default LearningStatsScreen;
