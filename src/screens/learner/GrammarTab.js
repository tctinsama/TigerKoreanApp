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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import grammarService from '../../services/grammarService';

const GrammarTab = ({ route, navigation }) => {
  const { lessonId } = route.params || {};
  const [grammars, setGrammars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    loadGrammars();
    loadCompletedIds();
  }, [lessonId]);

  const loadGrammars = async () => {
    try {
      setLoading(true);
      const data = await grammarService.getGrammarByLessonId(lessonId);
      
      // Transform data
      const transformedData = data.map((item) => ({
        grammarId: item.id || item.grammarId,
        grammarTitle: item.title || item.grammarTitle,
        grammarContent: item.content || item.grammarContent,
        grammarExample: item.example || item.grammarExample,
      }));

      setGrammars(transformedData);
      
      // Mở grammar đầu tiên tự động
      if (transformedData.length > 0) {
        setExpandedId(transformedData[0].grammarId);
      }
    } catch (error) {
      console.error('Load grammars error:', error);
      Alert.alert('Lỗi', 'Không thể tải ngữ pháp. Sử dụng dữ liệu mẫu.');
      
      // Mock data
      const mockData = [
        {
          grammarId: 1,
          grammarTitle: '-아/어 버리다',
          grammarContent: 'Diễn tả một hành động đã hoàn tất hoặc kết thúc hoàn toàn.\n\nCấu trúc:\n- Động từ + 아/어 버리다\n- Dùng 아 sau nguyên âm sáng (ㅏ, ㅗ)\n- Dùng 어 sau nguyên âm tối (ㅓ, ㅜ, ㅡ, ㅣ)',
          grammarExample: '먹다 → 먹어 버렸어요 (Đã ăn xong rồi)\n읽다 → 읽어 버렸어요 (Đã đọc xong rồi)\n사다 → 사 버렸어요 (Đã mua luôn rồi)',
        },
        {
          grammarId: 2,
          grammarTitle: '-고 나서',
          grammarContent: 'Diễn tả hành động xảy ra sau khi một hành động khác hoàn thành.\n\nCấu trúc:\n- Động từ + 고 나서\n- Tương đương với "sau khi... thì..." trong tiếng Việt',
          grammarExample: '숙제를 하고 나서 놀았어요.\n(Sau khi làm bài tập xong thì đi chơi)\n\n밥을 먹고 나서 커피를 마셨어요.\n(Sau khi ăn cơm xong thì uống cà phê)',
        },
      ];
      setGrammars(mockData);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedIds = async () => {
    try {
      const saved = await AsyncStorage.getItem(`grammar_completed_${lessonId}`);
      if (saved) {
        setCompletedIds(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Load completed IDs error:', error);
    }
  };

  const handleMarkAsCompleted = async (grammarId) => {
    let newCompletedIds;
    
    if (completedIds.includes(grammarId)) {
      // Bỏ đánh dấu
      newCompletedIds = completedIds.filter(id => id !== grammarId);
     
    } else {
      // Thêm đánh dấu
      newCompletedIds = [...completedIds, grammarId];
    
    }
    
    setCompletedIds(newCompletedIds);

    
    // Lưu vào AsyncStorage
    try {
      await AsyncStorage.setItem(
        `grammar_completed_${lessonId}`,
        JSON.stringify(newCompletedIds)
      );
      
      // TODO: Gọi API để sync với server
      // await grammarService.markGrammarAsCompleted(grammarId, !completedIds.includes(grammarId));
    } catch (error) {
      console.error('Save completed error:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const completionPercentage = grammars.length > 0 
    ? Math.round((completedIds.length / grammars.length) * 100) 
    : 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải ngữ pháp...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      key={`grammar-list-${grammars.length}-${completedIds.length}`}
    >
      {/* Progress Bar */}
      {grammars.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ học ngữ pháp</Text>
            <Text style={styles.progressValue}>
              {completedIds.length}/{grammars.length}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
            />
          </View>
        </View>
      )}

      {/* Empty State */}
      {grammars.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>
            Không có dữ liệu ngữ pháp cho bài học này
          </Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng chọn bài học khác hoặc quay lại sau
          </Text>
        </View>
      )}

      {/* Grammar List */}
      <View style={styles.grammarList}>
        {grammars.map((grammar, index) => {
          const isCompleted = completedIds.includes(grammar.grammarId);
          const isExpanded = expandedId === grammar.grammarId;
          
          return (
            <View
              key={grammar.grammarId}
              style={[
                styles.grammarCard,
                isExpanded && styles.grammarCardExpanded,
                isCompleted && styles.grammarCardCompleted,
                { marginBottom: 16 },
              ]}
            >
              {/* Header */}
              <TouchableOpacity
                style={styles.grammarHeader}
                onPress={() => toggleExpand(grammar.grammarId)}
              >
                <View style={styles.grammarHeaderLeft}>
                  <View style={[
                    styles.grammarNumber,
                    isCompleted && styles.grammarNumberCompleted
                  ]}>
                    <Text style={[
                      styles.grammarNumberText,
                      isCompleted && styles.grammarNumberTextCompleted
                    ]}>
                      {isCompleted ? '✓' : index + 1}
                    </Text>
                  </View>
                  <View style={styles.grammarTitleContainer}>
                    <Text style={styles.grammarTitle}>{grammar.grammarTitle}</Text>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Đã học</Text>
                      </View>
                    )}
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {/* Content - Expanded */}
              {isExpanded && (
                <View style={styles.grammarBody}>
                  {/* Nội dung */}
                  <View style={[styles.contentSection, { marginBottom: 16 }]}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="book-open-variant" size={20} color="#3B82F6" />
                      <Text style={styles.sectionTitle}>Nội dung</Text>
                    </View>
                    <Text style={styles.sectionText}>{grammar.grammarContent}</Text>
                  </View>

                  {/* Ví dụ */}
                  <View style={[styles.contentSection, { marginBottom: 16 }]}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#10B981" />
                      <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Ví dụ</Text>
                    </View>
                    <Text style={styles.sectionText}>{grammar.grammarExample}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsContainer}>
                    <View style={styles.actionsLeft}>
                      <TouchableOpacity style={[styles.actionButton, { marginRight: 8 }]}>
                        <MaterialCommunityIcons name="notebook-edit" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                        <Text style={styles.actionButtonText}>Ghi chú</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                        <MaterialCommunityIcons name="message-text" size={16} color="#666" style={{ marginRight: 4 }} />
                        <Text style={[styles.actionButtonText, { color: '#666' }]}>Hỏi đáp</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        isCompleted && styles.completeButtonCompleted
                      ]}
                      onPress={() => handleMarkAsCompleted(grammar.grammarId)}
                    >
                      <MaterialCommunityIcons
                        name={isCompleted ? 'close-circle' : 'check-circle'}
                        size={18}
                        color={isCompleted ? '#666' : '#FFF'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[
                        styles.completeButtonText,
                        isCompleted && styles.completeButtonTextCompleted
                      ]}>
                        {isCompleted ? 'Đánh dấu chưa học' : 'Đánh dấu đã học'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Next Step Suggestion */}
      {grammars.length > 0 && (
        <View style={styles.nextStepContainer}>
          <View style={styles.nextStepContent}>
            <Text style={styles.nextStepTitle}>Bước tiếp theo</Text>
            <Text style={styles.nextStepText}>
              Sau khi học xong ngữ pháp, hãy làm bài tập để củng cố kiến thức!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.nextStepButton}
            onPress={() => {
              // Navigate to Exercise tab
              Alert.alert('Bài tập', 'Chức năng đang phát triển');
            }}
          >
            <Text style={styles.nextStepButtonText}>Làm bài tập</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
  },
  badge: {
    marginLeft: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  progressContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  grammarList: {
    marginBottom: 16,
  },
  grammarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  grammarCardExpanded: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  grammarCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  grammarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  grammarHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  grammarNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  grammarNumberCompleted: {
    backgroundColor: '#D1FAE5',
  },
  grammarNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  grammarNumberTextCompleted: {
    color: '#059669',
  },
  grammarTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  grammarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedBadge: {
    marginLeft: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  grammarBody: {
    padding: 16,
    paddingTop: 0,
  },
  contentSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionsLeft: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonSecondary: {
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  completeButtonCompleted: {
    backgroundColor: '#F3F4F6',
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  completeButtonTextCompleted: {
    color: '#666',
  },
  nextStepContainer: {
    marginTop: 24,
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  nextStepContent: {
    marginBottom: 12,
  },
  nextStepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 6,
  },
  nextStepText: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextStepButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default GrammarTab;
