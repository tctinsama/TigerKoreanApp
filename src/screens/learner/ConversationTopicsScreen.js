import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ConversationTopicsScreen = ({ navigation }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // Levels
  const levels = [
    { id: 'beginner', name: 'Sơ cấp', icon: '🌱', color: '#10B981' },
    { id: 'intermediate', name: 'Trung cấp', icon: '🌿', color: '#F59E0B' },
    { id: 'advanced', name: 'Nâng cao', icon: '🌳', color: '#EF4444' },
  ];

  // Conversation Topics
  const topics = [
    {
      id: 1,
      title: 'Chào hỏi & Giới thiệu',
      titleKorean: '인사 & 소개',
      description: 'Chào hỏi, tự giới thiệu bản thân',
      icon: '👋',
      color: '#FF6B6B',
      difficulty: ['beginner', 'intermediate'],
    },
    {
      id: 2,
      title: 'Ở nhà hàng',
      titleKorean: '식당에서',
      description: 'Đặt món, gọi đồ ăn, thanh toán',
      icon: '🍽️',
      color: '#4ECDC4',
      difficulty: ['beginner', 'intermediate', 'advanced'],
    },
    {
      id: 3,
      title: 'Mua sắm',
      titleKorean: '쇼핑',
      description: 'Hỏi giá, thử đồ, mặc cả',
      icon: '🛍️',
      color: '#95E1D3',
      difficulty: ['beginner', 'intermediate', 'advanced'],
    },
    {
      id: 4,
      title: 'Đi du lịch',
      titleKorean: '여행',
      description: 'Hỏi đường, đặt khách sạn, tham quan',
      icon: '✈️',
      color: '#F38181',
      difficulty: ['intermediate', 'advanced'],
    },
    {
      id: 5,
      title: 'Ở văn phòng',
      titleKorean: '회사에서',
      description: 'Làm việc, họp, email công việc',
      icon: '💼',
      color: '#AA96DA',
      difficulty: ['intermediate', 'advanced'],
    },
    {
      id: 6,
      title: 'Bệnh viện',
      titleKorean: '병원',
      description: 'Khám bệnh, mô tả triệu chứng',
      icon: '🏥',
      color: '#FCBAD3',
      difficulty: ['intermediate', 'advanced'],
    },
    {
      id: 7,
      title: 'Gia đình',
      titleKorean: '가족',
      description: 'Nói về gia đình, người thân',
      icon: '👨‍👩‍👧‍👦',
      color: '#FFFFD2',
      difficulty: ['beginner', 'intermediate'],
    },
    {
      id: 8,
      title: 'Sở thích',
      titleKorean: '취미',
      description: 'Phim, nhạc, thể thao, đọc sách',
      icon: '🎨',
      color: '#A8E6CF',
      difficulty: ['beginner', 'intermediate', 'advanced'],
    },
    {
      id: 9,
      title: 'Thời tiết',
      titleKorean: '날씨',
      description: 'Nói về thời tiết, mùa',
      icon: '🌤️',
      color: '#FFD3B6',
      difficulty: ['beginner'],
    },
    {
      id: 10,
      title: 'Giao thông',
      titleKorean: '교통',
      description: 'Taxi, xe bus, tàu điện ngầm',
      icon: '🚇',
      color: '#FFAAA5',
      difficulty: ['beginner', 'intermediate'],
    },
    {
      id: 11,
      title: 'Ngân hàng',
      titleKorean: '은행',
      description: 'Gửi tiền, rút tiền, chuyển khoản',
      icon: '🏦',
      color: '#FF8B94',
      difficulty: ['intermediate', 'advanced'],
    },
    {
      id: 12,
      title: 'Hẹn hò',
      titleKorean: '데이트',
      description: 'Rủ đi chơi, hẹn gặp',
      icon: '💕',
      color: '#FFC6FF',
      difficulty: ['intermediate', 'advanced'],
    },
  ];

  // Open modal when topic clicked
  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setShowLevelModal(true);
  };

  // Navigate after level selected
  const handleLevelSelect = (level) => {
    setShowLevelModal(false);
    navigation.navigate('ConversationPractice', {
      topic: selectedTopic,
      level: level,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Luyện hội thoại</Text>
          <Text style={styles.headerSubtitle}>Chọn chủ đề để bắt đầu</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Topics Grid */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>
            Chủ đề hội thoại ({topics.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Chọn chủ đề để bắt đầu luyện hội thoại
          </Text>
          
          <View style={styles.topicsGrid}>
            {topics.map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicCard, { backgroundColor: topic.color + '20' }]}
                onPress={() => handleTopicPress(topic)}
                activeOpacity={0.7}
              >
                <View style={[styles.topicIconContainer, { backgroundColor: topic.color }]}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                </View>
                
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicTitleKorean}>{topic.titleKorean}</Text>
                <Text style={styles.topicDescription} numberOfLines={2}>
                  {topic.description}
                </Text>

                <View style={styles.topicFooter}>
                  <MaterialCommunityIcons 
                    name="play-circle" 
                    size={20} 
                    color={topic.color} 
                  />
                  <Text style={[styles.startText, { color: topic.color }]}>
                    Bắt đầu
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Level Selection Modal */}
      <Modal
        visible={showLevelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLevelModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn cấp độ</Text>
              <Text style={styles.modalSubtitle}>
                {selectedTopic?.title} • {selectedTopic?.titleKorean}
              </Text>
            </View>

            <View style={styles.modalBody}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.modalLevelCard,
                    { borderColor: level.color }
                  ]}
                  onPress={() => handleLevelSelect(level.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modalLevelIconContainer, { backgroundColor: level.color }]}>
                    <Text style={styles.modalLevelIcon}>{level.icon}</Text>
                  </View>
                  <View style={styles.modalLevelInfo}>
                    <Text style={[styles.modalLevelName, { color: level.color }]}>
                      {level.name}
                    </Text>
                    <Text style={styles.modalLevelDesc}>
                      {level.id === 'beginner' && 'Từ vựng cơ bản, câu ngắn, dễ hiểu'}
                      {level.id === 'intermediate' && 'Ngữ pháp trung cấp, tự nhiên hơn'}
                      {level.id === 'advanced' && 'Như người bản xứ, có slang'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color={level.color} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowLevelModal(false)}
            >
              <Text style={styles.modalCloseText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  levelSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  levelCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  levelIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  topicsSection: {
    padding: 16,
    paddingTop: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicIcon: {
    fontSize: 24,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  topicTitleKorean: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  topicDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  topicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 12,
  },
  modalLevelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLevelIcon: {
    fontSize: 24,
  },
  modalLevelInfo: {
    flex: 1,
  },
  modalLevelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalLevelDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  modalCloseButton: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default ConversationTopicsScreen;
