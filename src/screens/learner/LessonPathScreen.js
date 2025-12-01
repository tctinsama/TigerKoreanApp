import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
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

    const paths = [];
    const centerX = width / 2;
    const startY = 20;
    const spacing = 140;
    const circleRadius = 40;
    const offset = 60;

    for (let i = 1; i < lessons.length; i++) {
      const prevIndex = i - 1;
      const isEven = i % 2 === 0;
      
      // Tính vị trí X: tâm của circle
      const prevX = (prevIndex % 2 === 0) ? centerX - offset : centerX + offset;
      const currX = isEven ? centerX - offset : centerX + offset;
      
      // Tính vị trí Y: chính xác như trong render circle
      // Circle được đặt tại: { top: yPosition, left: circleX - 40 }
      // yPosition = startY + index * spacing
      // Circle có height 80, nên:
      // - Top edge ở yPosition
      // - Bottom edge ở yPosition + 80
      // - Center ở yPosition + 40
      
      const prevYPosition = startY + (prevIndex * spacing);
      const currYPosition = startY + (i * spacing);
      
      // Thêm paddingTop từ lessonsContainer
      const containerPaddingTop = 20;
      
      // Điểm bắt đầu: bottom của circle trên
      const startPointY = prevYPosition + 80 + containerPaddingTop;
      // Điểm kết thúc: top của circle dưới
      const endPointY = currYPosition + containerPaddingTop;
      
      const deltaY = endPointY - startPointY;
      
      // Cubic Bezier curve
      const controlX1 = prevX;
      const controlY1 = startPointY + deltaY * 0.35;
      
      const controlX2 = currX;
      const controlY2 = endPointY - deltaY * 0.35;
      
      const path = `M ${prevX},${startPointY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${currX},${endPointY}`;
      
      const isLocked = lessons[i].status === 'locked';
      const isCompleted = lessons[i].status === 'completed';
      
      paths.push({ path, isLocked, isCompleted, key: i });
    }

    return (
      <Svg height={startY + lessons.length * spacing + 100 + 20} width={width} style={styles.svgPath}>
        {paths.map(({ path, isLocked, isCompleted, key }) => (
          <Path
            key={key}
            d={path}
            stroke={isCompleted ? COLORS.accent : isLocked ? COLORS.disabled : COLORS.warning}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isLocked ? '8,4' : '0'}
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
      <StatusBar barStyle="light-content" backgroundColor={levelInfo.color} translucent={true} />

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
            const centerX = width / 2;
            const startY = 20;
            const spacing = 140;
            const offset = 60;
            const isEven = index % 2 === 0;
            const circleX = isEven ? centerX - offset : centerX + offset;
            const yPosition = startY + index * spacing;
            
            const isCompleted = lesson.status === 'completed';
            const isAvailable = lesson.status === 'available';
            const isLocked = lesson.status === 'locked';

            return (
              <View key={lesson.id}>
                {/* Circle */}
                <View
                  style={[styles.lessonNodeContainer, { top: yPosition, left: circleX - 40 }]}
                >
                  <TouchableOpacity
                    onPress={() => handleLessonPress(lesson)}
                    disabled={isLocked}
                    style={styles.lessonTouchable}
                  >
                    <View style={[
                      styles.lessonCircle,
                      isCompleted && styles.completedCircle,
                      isAvailable && styles.availableCircle,
                      isLocked && styles.lockedCircle,
                    ]}>
                      <View style={styles.innerCircle}>
                        <MaterialCommunityIcons
                          name={isCompleted ? "check-bold" : isLocked ? "lock" : "book-open-variant"}
                          size={28}
                          color={isLocked ? '#999' : '#FFF'}
                        />
                      </View>
                    </View>

                    {isAvailable && index > 0 && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>MỚI</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Tiêu đề bên cạnh */}
                <View
                  style={[
                    styles.lessonTitleContainer,
                    { 
                      top: yPosition + 15,
                      left: isEven ? circleX + 50 : 20,
                      right: isEven ? 20 : width - circleX + 50,
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.lessonTitle,
                      isEven ? styles.lessonTitleLeft : styles.lessonTitleRight
                    ]} 
                    numberOfLines={3}
                  >
                    {lesson.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 + lessons.length * 140 + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textSecondary,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 12,
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
    paddingTop: 20,
  },
  lessonNodeContainer: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  lessonTouchable: {
    alignItems: 'center',
    position: 'relative',
  },
  lessonTitleContainer: {
    position: 'absolute',
    zIndex: 15,
    paddingHorizontal: 4,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lessonTitleLeft: {
    textAlign: 'left',
  },
  lessonTitleRight: {
    textAlign: 'right',
  },
  lessonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  completedCircle: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
  },
  availableCircle: {
    backgroundColor: COLORS.warning,
    borderColor: '#F57F17',
  },
  lockedCircle: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  newBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LessonPathScreen;
