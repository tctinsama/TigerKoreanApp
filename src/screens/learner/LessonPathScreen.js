import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import LessonNode from '../../components/LessonNode';
import { lessonService } from '../../services/lessonService';
import { levelService } from '../../services/levelService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Cấu hình màu sắc cho các level
const levelConfigs = [
  { color: '#10B981', icon: '📚' },
  { color: '#3B82F6', icon: '🎯' },
  { color: '#8B5CF6', icon: '⭐' },
  { color: '#F59E0B', icon: '🏆' },
  { color: '#EF4444', icon: '🚀' },
  { color: '#6366F1', icon: '👑' },
];

const LessonPathScreen = ({ route, navigation }) => {
  const { levelId = 1 } = route.params || {};
  const { user } = useAuth();
  
  const [lessons, setLessons] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [levelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load level info
      const levelData = await levelService.getLevelById(levelId);
      const config = levelConfigs[(levelId - 1) % levelConfigs.length];
      setLevelInfo({
        ...levelData,
        color: config.color,
        icon: config.icon,
      });

      // Load lessons với progress nếu có userId
      let lessonsData;
      if (user?.userId) {
        lessonsData = await lessonService.getLessonsByLevelIdWithProgress(levelId, user.userId);
      } else {
        lessonsData = await lessonService.getLessonsByLevelId(levelId);
      }

      // Transform data to match UI format
      const transformedLessons = lessonsData.map((lesson, index) => ({
        id: lesson.lessonId,
        title: lesson.lessonName,
        description: lesson.lessonDescription || '',
        status: lesson.isLocked ? 'locked' : (lesson.isLessonCompleted ? 'completed' : 'available'),
        type: 'lesson',
        stars: lesson.stars || 0,
      }));

      setLessons(transformedLessons);
    } catch (err) {
      console.error('Load lesson error:', err);
      setError('Không thể tải dữ liệu bài học');
      Alert.alert('Lỗi', 'Không thể tải dữ liệu bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lesson) => {
    if (lesson.status === 'locked') {
      Alert.alert('Bài học bị khóa', 'Hoàn thành bài học trước để mở khóa bài này');
      return;
    }

    // Navigate to lesson detail screen
    Alert.alert(lesson.title, 'Tính năng học bài đang phát triển');
    // navigation.navigate('LessonDetail', { lessonId: lesson.id });
  };

  const renderConnectingPath = () => {
    if (lessons.length < 2) return null;

    const pathData = [];
    const centerX = width / 2;
    const startY = 100;
    const verticalSpacing = 140;
    const horizontalOffset = 80;

    lessons.forEach((lesson, index) => {
      if (index === 0) return;

      const prevIsLeft = (index - 1) % 2 === 0;
      const currentIsLeft = index % 2 === 0;

      const prevX = prevIsLeft ? centerX - horizontalOffset : centerX + horizontalOffset;
      const currentX = currentIsLeft ? centerX - horizontalOffset : centerX + horizontalOffset;
      const prevY = startY + (index - 1) * verticalSpacing;
      const currentY = startY + index * verticalSpacing;

      const midY = (prevY + currentY) / 2;
      const curveOffset = 30;

      const path = `M ${prevX} ${prevY} 
                    Q ${prevX} ${midY - curveOffset}, ${(prevX + currentX) / 2} ${midY}
                    Q ${currentX} ${midY + curveOffset}, ${currentX} ${currentY}`;

      pathData.push({
        path,
        isCompleted: lessons[index - 1].status === 'completed',
        key: `path-${index}`,
      });
    });

    return (
      <Svg height={startY + lessons.length * verticalSpacing} width={width} style={styles.svgPath}>
        <Defs>
          <SvgLinearGradient id="completedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="lockedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#E5E7EB" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D1D5DB" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {pathData.map((item) => (
          <Path
            key={item.key}
            d={item.path}
            stroke={item.isCompleted ? 'url(#completedGrad)' : 'url(#lockedGrad)'}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error || !levelInfo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedCount = lessons.filter(l => l.status === 'completed').length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={levelInfo.color} translucent={false} />

      {/* Header */}
      <LinearGradient colors={[levelInfo.color, levelInfo.color + 'EE']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.iconCircle}>
              <Text style={styles.headerIcon}>{levelInfo.icon}</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{levelInfo.levelName}</Text>
              <Text style={styles.headerSubtitle}>{levelInfo.description || 'Lộ trình học tập'}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>7</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} bài hoàn thành
          </Text>
        </View>
      </LinearGradient>

      {/* Lesson Path */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderConnectingPath()}

        <View style={styles.lessonsContainer}>
          {lessons.map((lesson, index) => {
            const isLeft = index % 2 === 0;
            const centerX = width / 2;
            const horizontalOffset = 80;
            const xPosition = isLeft ? centerX - horizontalOffset : centerX + horizontalOffset;

            return (
              <View
                key={lesson.id}
                style={[
                  styles.lessonWrapper,
                  {
                    position: 'absolute',
                    left: xPosition - 50,
                    top: 100 + index * 140,
                  },
                ]}
              >
                <LessonNode lesson={lesson} onPress={() => handleLessonPress(lesson)} isFirst={index === 0} />
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 + lessons.length * 140 + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBF3',
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
  header: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakIcon: {
    fontSize: 16,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  svgPath: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  lessonsContainer: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  lessonWrapper: {
    width: 100,
    alignItems: 'center',
  },
});

export default LessonPathScreen;
