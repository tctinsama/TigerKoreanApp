import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LessonCard, CategoryCard } from '../components/Cards';

const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Dữ liệu mẫu cho các bài học
  const lessons = [
    { id: 1, title: 'Bảng chữ cái Hangul', level: 'Beginner', progress: 75 },
    { id: 2, title: 'Chào hỏi cơ bản', level: 'Beginner', progress: 50 },
    { id: 3, title: 'Giới thiệu bản thân', level: 'Elementary', progress: 30 },
    { id: 4, title: 'Số đếm và thời gian', level: 'Elementary', progress: 10 },
  ];

  // Dữ liệu mẫu cho danh mục
  const categories = [
    { id: 1, icon: '📚', title: 'Từ vựng', subtitle: '500+ từ' },
    { id: 2, icon: '✍️', title: 'Ngữ pháp', subtitle: '50+ bài' },
    { id: 3, icon: '🎧', title: 'Luyện nghe', subtitle: '100+ audio' },
    { id: 4, icon: '💬', title: 'Giao tiếp', subtitle: '30+ hội thoại' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🐯 TigerKorean</Text>
          <Text style={styles.welcome}>Xin chào, {user?.username || 'User'}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Ngày học</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Từ vựng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Bài học</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                title={category.title}
                subtitle={category.subtitle}
                onPress={() => Alert.alert(category.title, 'Tính năng đang phát triển')}
              />
            ))}
          </ScrollView>
        </View>

        {/* Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài học của bạn</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              level={lesson.level}
              progress={lesson.progress}
              onPress={() => Alert.alert(lesson.title, 'Bắt đầu học bài này!')}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  categoriesScroll: {
    marginTop: 16,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
});

export default HomeScreen;
