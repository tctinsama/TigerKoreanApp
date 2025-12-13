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
  Modal,
  ImageBackground,
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
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [levelId]);

  // Reload lessons when screen comes back into focus (after completing exercises)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, levelId]);

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

      // Load lessons with progress (isLocked, isLessonCompleted từ backend)
      let lessonsData;
      if (user?.userId) {
        try {
          // Gọi API GET /api/lessons/progress?levelId=X&userId=Y
          // Backend trả về isLocked (bài bị khóa) và isLessonCompleted (bài đã xong)
          lessonsData = await lessonService.getLessonsByLevelIdWithProgress(levelId, user.userId);
        } catch (progressError) {
          // Nếu API progress lỗi → dùng API thường
          lessonsData = await lessonService.getLessonsByLevelId(levelId);
        }
      } else {
        // Nếu chưa login thì chỉ load danh sách bài học
        lessonsData = await lessonService.getLessonsByLevelId(levelId);
      }

      // Transform data: Backend trả về isLocked và isLessonCompleted
      const transformedLessons = lessonsData.map((lesson, index) => {
        // Backend trả về: "locked" và "lessonCompleted" (không có prefix "is")
        // Kiểm tra cả 2 format: với và không có "is"
        const isLocked = lesson.isLocked !== undefined ? lesson.isLocked : lesson.locked;
        const isLessonCompleted = lesson.isLessonCompleted !== undefined ? lesson.isLessonCompleted : lesson.lessonCompleted;
        const hasProgressData = isLocked !== undefined;
        
        let status;
        if (hasProgressData) {
          // Backend có trả lock status
          status = isLocked ? 'locked' : (isLessonCompleted ? 'completed' : 'available');
        } else {
          // Backend KHÔNG có progress → fallback: chỉ bài đầu mở, còn lại khóa
          status = index === 0 ? 'available' : 'locked';
        }

        return {
          id: lesson.lessonId,
          title: lesson.lessonName,
          description: lesson.lessonDescription || '',
          status: status,
          type: 'lesson',
          stars: lesson.stars || 0,
        };
      });

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

    setSelectedLesson(lesson);
    setModalVisible(true);
  };

  const handleStartLesson = () => {
    setModalVisible(false);
    if (selectedLesson) {
      navigation.navigate('LessonDetail', {
        lessonId: selectedLesson.id,
        lessonTitle: selectedLesson.title,
      });
    }
  };

  const renderConnectingPath = () => {
    if (lessons.length < 2) return null;

    const paths = [];
    const centerX = width / 2;
    const startY = 20;
    const spacing = 160;
    const circleRadius = 40;
    const offset = 80;

    for (let i = 1; i < lessons.length; i++) {
      const prevIndex = i - 1;
      const isEven = i % 2 === 0;
      
      // Tính tâm của các circle - Phải khớp với vị trí thực tế của hình tròn
      const prevX = (prevIndex % 2 === 0) ? centerX - offset : centerX + offset;
      const currX = isEven ? centerX - offset : centerX + offset;
      
      // Tâm của circle
      const prevCenterY = startY + (prevIndex * spacing) + circleRadius;
      const currCenterY = startY + (i * spacing) + circleRadius;
      
      // Điểm bắt đầu: sát mép đáy circle trên (không cộng circleRadius nữa)
      const startPointY = prevCenterY + circleRadius - 4;
      // Điểm kết thúc: sát mép đỉnh circle dưới (không trừ circleRadius nữa)
      const endPointY = currCenterY - circleRadius + 4;
      
      // Tính khoảng cách giữa 2 điểm
      const deltaY = endPointY - startPointY;
      
      // Control points cho đường cong mượt hơn
      const controlY1 = startPointY + deltaY * 0.3;
      const controlY2 = endPointY - deltaY * 0.3;
      
      // Cubic Bezier curve
      const path = `M ${prevX},${startPointY} 
                    C ${prevX},${controlY1} ${currX},${controlY2} ${currX},${endPointY}`;
      
      const isLocked = lessons[i].status === 'locked';
      const isCompleted = lessons[i].status === 'completed';
      
      paths.push({ path, isLocked, isCompleted, key: i });
    }

    return (
      <Svg height={startY + lessons.length * spacing + 100} width={width} style={styles.svgPath}>
        {paths.map(({ path, isLocked, isCompleted, key }) => (
          <Path
            key={key}
            d={path}
            stroke={isCompleted ? '#4CAF50' : isLocked ? '#E0E0E0' : '#FFC107'}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isCompleted ? '0' : '10,8'}
            opacity={isLocked ? 0.4 : 1}
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
      <ImageBackground
        source={require('../../../assets/bgpath.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
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
            const spacing = 160;
            const offset = 80;
            const isEven = index % 2 === 0;
            const yPosition = startY + index * spacing;
            
            const isCompleted = lesson.status === 'completed';
            const isAvailable = lesson.status === 'available';
            const isLocked = lesson.status === 'locked';

            return (
              <View
                key={lesson.id}
                style={[styles.lessonNodeContainer, { 
                  top: yPosition,
                  left: 0,
                  width: width,
                  paddingHorizontal: 20,
                }]}
              >
                <View style={[
                  styles.lessonContentWrapper,
                  isEven ? { justifyContent: 'flex-start' } : { justifyContent: 'flex-end' }
                ]}>
                  <TouchableOpacity
                    onPress={() => handleLessonPress(lesson)}
                    disabled={isLocked}
                    style={[styles.lessonTouchable, isEven ? styles.lessonTouchableRow : styles.lessonTouchableRowReverse]}
                    activeOpacity={0.7}
                  >
                    <View style={[
                    styles.lessonCircle,
                    isCompleted && styles.completedCircle,
                    isAvailable && styles.availableCircle,
                    isLocked && styles.lockedCircle,
                  ]}>
                    <MaterialCommunityIcons
                      name={isCompleted ? "check-bold" : isLocked ? "lock" : "book-open-variant"}
                      size={32}
                      color={isCompleted ? '#4CAF50' : isLocked ? '#999' : '#FFF'}
                    />
                  </View>

                  <Text style={[styles.lessonTitle, isEven ? styles.lessonTitleLeft : styles.lessonTitleRight]} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                </TouchableOpacity>

                {isAvailable && index > 0 && (
                  <View style={[styles.newBadge, isEven ? { left: 56 } : { right: 56 }]}>
                    <Text style={styles.newBadgeText}>MỚI</Text>
                  </View>
                )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 + lessons.length * 160 + 100 }} />
        </ScrollView>
      </ImageBackground>

      {/* Lesson Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Lesson Icon */}
            <View style={styles.modalIconContainer}>
              <View style={[
                styles.modalIcon,
                selectedLesson?.status === 'completed' && styles.completedIcon,
                selectedLesson?.status === 'available' && styles.availableIcon,
              ]}>
                <MaterialCommunityIcons
                  name={selectedLesson?.status === 'completed' ? "check-bold" : "book-open-variant"}
                  size={40}
                  color="#FFF"
                />
              </View>
            </View>

            {/* Lesson Title */}
            <Text style={styles.modalTitle}>{selectedLesson?.title}</Text>
            
            {/* Lesson Description */}
            {selectedLesson?.description && (
              <Text style={styles.modalDescription}>{selectedLesson?.description}</Text>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="text-box-outline" size={20} color="#666" />
                <Text style={styles.statText}>15 từ vựng</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                <Text style={styles.statText}>10 phút</Text>
              </View>
            </View>

            {/* Progress (if completed) */}
            {selectedLesson?.status === 'completed' && (
              <View style={styles.progressInfo}>
                <MaterialCommunityIcons name="star" size={20} color="#FFC107" />
                <Text style={styles.progressText}>
                  Bạn đã hoàn thành bài này với {selectedLesson?.stars || 3} sao
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartLesson}
              >
                <Text style={styles.startButtonText}>
                  {selectedLesson?.status === 'completed' ? 'Học lại' : 'Bắt đầu'}
                </Text>
              </TouchableOpacity>

              {selectedLesson?.status === 'completed' && (
                <TouchableOpacity 
                  style={styles.reviewButton}
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('Ôn tập', 'Tính năng đang phát triển');
                  }}
                >
                  <Text style={styles.reviewButtonText}>Ôn tập</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
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
    zIndex: 10,
  },
  lessonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  lessonTouchable: {
    maxWidth: width * 0.6,
  },
  lessonTouchableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTouchableRowReverse: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  lessonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  completedCircle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4CAF50',
    borderWidth: 5,
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
  lessonTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  lessonTitleLeft: {
    textAlign: 'left',
  },
  lessonTitleRight: {
    textAlign: 'right',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 20,
  },
  newBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  modalIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  completedIcon: {
    backgroundColor: '#4CAF50',
  },
  availableIcon: {
    backgroundColor: '#FFC107',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#F57F17',
    fontWeight: '600',
  },
  modalButtons: {
    gap: 12,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonPathScreen;
