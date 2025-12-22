import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import ChatBotBubble from '../../components/ChatBotBubble';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const bannerData = [
    { id: 1, title: 'Học tiếng Hàn dễ dàng', subtitle: 'Với K-Tiger Study', color: '#FF6B35' },
    { id: 2, title: 'Thi thử TOPIK miễn phí', subtitle: 'Đánh giá trình độ chính xác', color: '#3B82F6' },
    { id: 3, title: 'Chat AI luyện hội thoại', subtitle: 'Nâng cao kỹ năng giao tiếp', color: '#10B981' },
  ];

  const topikLevels = [
    { level: 'TOPIK 1', vocab: '800 từ', grammar: '80 cấu trúc', color: '#FF6B35' },
    { level: 'TOPIK 2', vocab: '1500 từ', grammar: '200 cấu trúc', color: '#3B82F6' },
    { level: 'TOPIK 3', vocab: '3000 từ', grammar: '300 cấu trúc', color: '#10B981' },
    { level: 'TOPIK 4', vocab: '4500 từ', grammar: '400 cấu trúc', color: '#8B5CF6' },
    { level: 'TOPIK 5', vocab: '6000 từ', grammar: '500 cấu trúc', color: '#F59E0B' },
    { level: 'TOPIK 6', vocab: '8000 từ', grammar: '600 cấu trúc', color: '#EF4444' },
  ];

  const features = [
    {
      icon: '📚',
      title: 'HỌC THEO LỘ TRÌNH',
      description: 'Lộ trình từ Sơ cấp đến Cao cấp, học từ vựng, ngữ pháp, luyện nghe đọc viết đa dạng',
      color: '#FF6B35',
    },
    {
      icon: '🎯',
      title: 'THI THỬ TOPIK',
      description: 'Mô phỏng đề thi TOPIK theo đúng cấu trúc, chấm điểm tự động và phản hồi chi tiết',
      color: '#3B82F6',
    },
    {
      icon: '💬',
      title: 'CHAT AI HỘI THOẠI',
      description: 'Luyện hội thoại với AI trong nhiều tình huống, nhận phản hồi ngay lập tức',
      color: '#10B981',
    },
  ];

  const reviews = [
    { name: 'Quang Minh', rating: 5, text: 'Ứng dụng rất bổ ích cho người mới bắt đầu học tiếng Hàn!' },
    { name: 'Mai Trang', rating: 5, text: 'Tính năng thi thử TOPIK giúp mình làm quen với đề thi.' },
    { name: 'Tuấn Anh', rating: 5, text: 'Chat AI rất hữu ích! Mình có thể luyện nói mọi lúc mọi nơi.' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = (prev + 1) % bannerData.length;
        if (bannerScrollRef.current) {
          bannerScrollRef.current.scrollToIndex({ index: nextIndex, animated: true });
        }
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const renderBanner = ({ item }) => (
    <View style={[styles.bannerSlide, { backgroundColor: item.color }]}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" translucent={false} />
      
      {/* ChatBot Bubble */}
      <ChatBotBubble onPress={() => navigation.navigate('PathTab', { 
        screen: 'ConversationTopics' 
      })} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🐯 K-Tiger Study</Text>
          <Text style={styles.welcome}>Xin chào, {user?.fullName || user?.email || 'User'}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.leaderboardButton}
          onPress={() => navigation.navigate('PathTab', { screen: 'Leaderboard' })}
        >
          <Text style={styles.leaderboardIcon}>🏆</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Carousel */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerScrollRef}
            data={bannerData}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentBannerIndex(index);
            }}
          />
          <View style={styles.bannerDots}>
            {bannerData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: index === currentBannerIndex ? '#fff' : 'rgba(255,255,255,0.5)' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* TOPIK Roadmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lộ trình <Text style={{ color: '#FF6B35' }}>TOPIK</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>Nhanh 3 tháng để học ngôn ngữ mastery!</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topikScroll}>
            {topikLevels.map((item, index) => (
              <View key={index} style={[styles.topikCard, { borderColor: item.color }]}>
                <View style={[styles.topikBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.topikBadgeText}>{item.level}</Text>
                </View>
                <Text style={styles.topikVocab}>📖 {item.vocab}</Text>
                <Text style={styles.topikGrammar}>✍️ {item.grammar}</Text>
                <TouchableOpacity 
                  style={[styles.topikButton, { backgroundColor: item.color }]}
                  onPress={() => navigation.navigate('PathTab', { screen: 'LevelSelect' })}
                >
                  <Text style={styles.topikButtonText}>Học ngay →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Text style={{ color: '#FF6B35' }}>K-Tiger Study</Text>: Làm chủ tiếng Hàn
          </Text>
          
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { borderLeftColor: feature.color }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: feature.color }]}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (index === 0) navigation.navigate('PathTab', { screen: 'LevelSelect' });
                    else if (index === 1) navigation.navigate('TestTab');
                    else navigation.navigate('PathTab', { screen: 'ConversationTopics' });
                  }}
                >
                  <Text style={[styles.featureLink, { color: feature.color }]}>Tìm hiểu thêm →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Goals Section */}
        <View style={[styles.section, { backgroundColor: '#FF6B35', marginHorizontal: 0, padding: 24, borderRadius: 0 }]}>
          <Text style={[styles.sectionTitle, { color: '#fff', textAlign: 'center' }]}>
            ĐẶT MỤC TIÊU LỚN TỪ NHỮNG MỤC TIÊU NHỎ
          </Text>
          
          <View style={styles.goalsContainer}>
            <View style={styles.goalCard}>
              <Text style={styles.goalTitle}>LỘ TRÌNH CHI TIẾT</Text>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Xác định mục tiêu TOPIK</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Học từ vựng theo chủ đề</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Luyện nghe đọc mỗi ngày</Text>
              </View>
            </View>

            <View style={styles.goalCard}>
              <Text style={styles.goalTitle}>ĐẢM BẢO ĐIỂM CAO</Text>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Đề thi TOPIK chuẩn Hàn</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Chấm điểm tự động AI</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalCheck}>✓</Text>
                <Text style={styles.goalText}>Bảng xếp hạng học viên</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('PathTab', { screen: 'LevelSelect' })}
          >
            <Text style={styles.startButtonText}>BẮT ĐẦU HỌC NGAY</Text>
          </TouchableOpacity>
        </View>

        {/* User Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Học viên nói gì</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{review.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewStars}>{'⭐'.repeat(review.rating)}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Sẵn sàng bắt đầu?</Text>
          <Text style={styles.ctaSubtitle}>Tham gia cùng hàng ngàn học viên khác</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('TestTab')}
          >
            <Text style={styles.ctaButtonText}>Làm bài kiểm tra trình độ</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  leaderboardButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  leaderboardIcon: {
    fontSize: 24,
  },
  scrollContent: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    marginTop: 16,
  },
  bannerSlide: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  bannerDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  topikScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  topikCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topikBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  topikBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  topikVocab: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  topikGrammar: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  topikButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  topikButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  featureLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalsContainer: {
    marginTop: 16,
    gap: 16,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalCheck: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  goalText: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  reviewCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewStars: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: 32,
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;
