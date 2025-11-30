import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import LessonNode from '../components/LessonNode';
import { getLessonsByLevel, getLevelInfo } from '../constants/lessonData';

const { width, height } = Dimensions.get('window');

const LessonPathScreen = ({ route, navigation }) => {
  const { levelId = 1 } = route.params || {};
  const levelInfo = getLevelInfo(levelId);
  const lessons = getLessonsByLevel(levelId);

  const handleLessonPress = (lesson) => {
    if (lesson.status === 'locked') {
      Alert.alert('Bài học bị khóa', 'Hoàn thành bài học trước để mở khóa bài này');
      return;
    }

    if (lesson.type === 'test') {
      Alert.alert(lesson.title, 'Tính năng kiểm tra đang phát triển');
    } else {
      Alert.alert(lesson.title, 'Tính năng học bài đang phát triển');
    }
  };

  // Tạo SVG path giữa các lesson
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={levelInfo.color} />

      {/* Modern Header */}
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
              <Text style={styles.headerTitle}>{levelInfo.name}</Text>
              <Text style={styles.headerSubtitle}>{levelInfo.level}</Text>
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
            <View style={[styles.progressFill, { width: '45%' }]} />
          </View>
          <Text style={styles.progressText}>3/15 bài hoàn thành</Text>
        </View>
      </LinearGradient>

      {/* Lesson Path with SVG connections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SVG Path Lines */}
        {renderConnectingPath()}

        {/* Lesson Nodes */}
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

      {/* Professional Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <LinearGradient colors={['transparent', 'rgba(255,255,255,0.95)']} style={styles.navGradient}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
              <View style={[styles.navIconContainer, styles.navActive]}>
                <Text style={styles.navIconActive}>🏠</Text>
              </View>
              <Text style={[styles.navText, styles.navTextActive]}>Trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => Alert.alert('Tiến độ', 'Tính năng đang phát triển')}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>📊</Text>
              </View>
              <Text style={styles.navText}>Thống kê</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => Alert.alert('Luyện tập', 'Tính năng đang phát triển')}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>⚡</Text>
              </View>
              <Text style={styles.navText}>Luyện tập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => Alert.alert('Hồ sơ', 'Tính năng đang phát triển')}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>👤</Text>
              </View>
              <Text style={styles.navText}>Tài khoản</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBF3',
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
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navGradient: {
    paddingTop: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingBottom: 20,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-around',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navActive: {
    backgroundColor: '#FF6B35',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  navIconActive: {
    fontSize: 24,
    opacity: 1,
  },
  navText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    color: '#FF6B35',
  },
});

export default LessonPathScreen;
