import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import examService from '../../services/examService';

const ExamResultScreen = ({ navigation, route }) => {
  const { attemptId } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const data = await examService.getExamResult(attemptId);
      console.log('📊 Result data:', data);
      console.log('📊 Result.questions:', data.questions);
      console.log('📊 Result.sectionResults:', data.sectionResults);
      setResult(data);
    } catch (err) {
      console.error('Error fetching result:', err);
      Alert.alert('Lỗi', 'Không thể tải kết quả bài thi');
    } finally {
      setLoading(false);
    }
  };

  const getTopikLevel = (score) => {
    if (score >= 230) return { level: 'TOPIK 6', color: '#9C27B0', bg: '#F3E5F5' };
    if (score >= 190) return { level: 'TOPIK 5', color: '#2196F3', bg: '#E3F2FD' };
    if (score >= 150) return { level: 'TOPIK 4', color: '#4CAF50', bg: '#E8F5E9' };
    if (score >= 120) return { level: 'TOPIK 3', color: '#FF9800', bg: '#FFF3E0' };
    return { level: 'Chưa đạt', color: '#FF5252', bg: '#FFEBEE' };
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'LISTENING': return '🎧';
      case 'READING': return '📖';
      case 'WRITING': return '✍️';
      default: return '📝';
    }
  };

  const getSectionColor = (type) => {
    switch (type) {
      case 'LISTENING': return { bg: '#E3F2FD', border: '#2196F3', text: '#2196F3' };
      case 'READING': return { bg: '#E8F5E9', border: '#4CAF50', text: '#4CAF50' };
      case 'WRITING': return { bg: '#F3E5F5', border: '#9C27B0', text: '#9C27B0' };
      default: return { bg: '#FFF8F0', border: '#FF6B35', text: '#FF6B35' };
    }
  };

  const getSectionDisplay = (sectionType, section) => {
    // LISTENING và READING: mỗi câu = 2 điểm, tổng 100 điểm (50 câu)
    // WRITING: tùy backend trả về
    if (sectionType === 'LISTENING' || sectionType === 'READING') {
      const scoreEarned = section.correctCount * 2;
      const maxScore = 100;
      const totalQuestions = 50;
      const percentage = (scoreEarned / maxScore) * 100;
      
      return {
        score: scoreEarned,
        maxScore: maxScore,
        correctCount: section.correctCount,
        totalCount: totalQuestions,
        percentage: percentage,
      };
    }
    
    // WRITING hoặc section khác dùng data từ backend
    return {
      score: section.score,
      maxScore: section.totalPoints,
      correctCount: section.correctCount,
      totalCount: section.totalCount,
      percentage: section.percentage,
    };
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const renderAnswer = (answer) => {
    if (!answer) return '❌ Chưa trả lời';
    
    const isImageUrl = answer.startsWith('http') && 
      (answer.includes('cloudinary') || answer.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    
    if (isImageUrl) {
      return (
        <Image 
          source={{ uri: answer }} 
          style={styles.answerImage}
          resizeMode="contain"
        />
      );
    }
    return answer;
  };

  if (loading || !result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalScore = result.totalScore || 0;
  const totalPossible = 300;
  const topikLevel = getTopikLevel(totalScore);
  const isPassed = totalScore >= 120;
  const passPercentage = (totalScore / totalPossible) * 100;

  const sectionResults = result.sectionResults || {};
  const sections = Object.keys(sectionResults);
  const questions = result.questions || [];
  
  console.log('📊 Sections found:', sections.length, sections);
  console.log('📊 Section Results:', sectionResults);

  const getFilteredQuestions = () => {
    if (activeTab === 'overview') return [];
    let filtered = questions.filter((q) => q.sectionType === activeTab);
    if (showOnlyWrong) {
      filtered = filtered.filter((q) => !q.isCorrect);
    }
    return filtered;
  };

  const wrongQuestions = questions.filter((q) => !q.isCorrect);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('TopikExamList')}
        >
          <Text style={styles.backButtonText}>← Về danh sách</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả thi TOPIK</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreIcon}>{isPassed ? '🎉' : '📝'}</Text>
          <Text style={styles.scoreTitle}>
            {isPassed ? 'Chúc mừng!' : 'Hoàn thành'}
          </Text>
          
          <View style={styles.scoreMain}>
            <Text style={[styles.scoreValue, isPassed && styles.scoreValuePassed]}>
              {totalScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreMax}>/300</Text>
          </View>

          <View style={[styles.levelBadge, { backgroundColor: topikLevel.bg }]}>
            <Text style={[styles.levelText, { color: topikLevel.color }]}>
              {topikLevel.level}
            </Text>
          </View>

          <View style={[styles.statusBadge, isPassed ? styles.statusPassed : styles.statusFailed]}>
            <Text style={styles.statusText}>
              {isPassed ? '✓ Đạt' : 'Chưa đạt'} ({passPercentage.toFixed(1)}%)
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                📊 Tổng quan
              </Text>
            </TouchableOpacity>

            {sections.map((sectionType) => {
              const colors = getSectionColor(sectionType);
              const section = sectionResults[sectionType];
              const display = getSectionDisplay(sectionType, section);
              return (
                <TouchableOpacity
                  key={sectionType}
                  style={[
                    styles.tab,
                    activeTab === sectionType && { ...styles.tabActive, backgroundColor: colors.bg },
                  ]}
                  onPress={() => setActiveTab(sectionType)}
                >
                  <Text style={[styles.tabText, activeTab === sectionType && { color: colors.text }]}>
                    {getSectionIcon(sectionType)} {sectionType}
                  </Text>
                  <Text style={[styles.tabBadge, activeTab === sectionType && { color: colors.text }]}>
                    {display.correctCount}/{display.totalCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.content}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
                <Text style={styles.statLabel}>Câu đúng</Text>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {result.correctAnswers}
                </Text>
                <Text style={styles.statSubLabel}>/{result.totalQuestions} câu</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FFEBEE', borderColor: '#FF5252' }]}>
                <Text style={styles.statLabel}>Câu sai</Text>
                <Text style={[styles.statValue, { color: '#FF5252' }]}>
                  {result.totalQuestions - result.correctAnswers}
                </Text>
                <Text style={styles.statSubLabel}>câu</Text>
              </View>
            </View>

            {/* Section Results */}
            <Text style={styles.sectionTitle}>📊 Điểm theo phần thi</Text>
            {sections.map((sectionType) => {
              const section = sectionResults[sectionType];
              const colors = getSectionColor(sectionType);
              const display = getSectionDisplay(sectionType, section);
              return (
                <TouchableOpacity
                  key={sectionType}
                  style={[styles.sectionCard, { borderColor: colors.border }]}
                  onPress={() => setActiveTab(sectionType)}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>{getSectionIcon(sectionType)}</Text>
                    <Text style={[styles.sectionName, { color: colors.text }]}>{sectionType}</Text>
                  </View>
                  
                  <View style={styles.sectionStats}>
                    <View style={styles.sectionStat}>
                      <Text style={styles.sectionStatLabel}>Điểm</Text>
                      <Text style={[styles.sectionStatValue, { color: colors.text }]}>
                        {display.score.toFixed(1)}
                      </Text>
                      <Text style={styles.sectionStatMax}>/{display.maxScore}</Text>
                    </View>
                    <View style={styles.sectionStat}>
                      <Text style={styles.sectionStatLabel}>Câu hỏi</Text>
                      <Text style={[styles.sectionStatValue, { color: colors.text }]}>
                        {display.correctCount}
                      </Text>
                      <Text style={styles.sectionStatMax}>/{display.totalCount}</Text>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${display.percentage}%`, backgroundColor: colors.border }]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {display.percentage.toFixed(1)}%
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* TOPIK Level Reference */}
            <Text style={styles.sectionTitle}>🎯 Bảng xếp loại TOPIK II</Text>
            <View style={styles.levelReferenceCard}>
              {[
                { level: 'TOPIK 6', range: '≥ 230 điểm', color: '#9C27B0', bg: '#F3E5F5' },
                { level: 'TOPIK 5', range: '190 - 229 điểm', color: '#2196F3', bg: '#E3F2FD' },
                { level: 'TOPIK 4', range: '150 - 189 điểm', color: '#4CAF50', bg: '#E8F5E9' },
                { level: 'TOPIK 3', range: '120 - 149 điểm', color: '#FF9800', bg: '#FFF3E0' },
                { level: 'Chưa đạt', range: '< 120 điểm', color: '#FF5252', bg: '#FFEBEE' },
              ].map((item) => {
                const isYourLevel = topikLevel.level === item.level;
                return (
                  <View
                    key={item.level}
                    style={[
                      styles.levelReferenceRow,
                      { backgroundColor: isYourLevel ? item.bg : '#F5F5F5' },
                      isYourLevel && { borderWidth: 2, borderColor: item.color },
                    ]}
                  >
                    <Text style={[styles.levelReferenceLevel, { color: item.color }]}>
                      {item.level}
                    </Text>
                    <Text style={styles.levelReferenceRange}>{item.range}</Text>
                    {isYourLevel && <Text style={styles.levelReferenceYou}>👈 Bạn</Text>}
                  </View>
                );
              })}
            </View>

            {/* Score Structure */}
            <Text style={styles.sectionTitle}>📝 Cấu trúc điểm TOPIK II</Text>
            <View style={styles.scoreStructureCard}>
              <View style={[styles.scoreStructureRow, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.scoreStructureLabel, { color: '#2196F3' }]}>🎧 Listening</Text>
                <Text style={styles.scoreStructureValue}>50 câu × 2đ = <Text style={styles.scoreStructureBold}>100</Text></Text>
              </View>
              <View style={[styles.scoreStructureRow, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.scoreStructureLabel, { color: '#4CAF50' }]}>📖 Reading</Text>
                <Text style={styles.scoreStructureValue}>50 câu × 2đ = <Text style={styles.scoreStructureBold}>100</Text></Text>
              </View>
              <View style={[styles.scoreStructureRow, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.scoreStructureLabel, { color: '#9C27B0' }]}>✍️ Writing</Text>
                <Text style={styles.scoreStructureValue}><Text style={styles.scoreStructureBold}>100</Text></Text>
              </View>
              <Text style={styles.scoreStructureDetail}>  • Câu 51, 52: 10 + 10 = 20đ</Text>
              <Text style={styles.scoreStructureDetail}>  • Câu 53: 30đ</Text>
              <Text style={styles.scoreStructureDetail}>  • Câu 54: 50đ</Text>
              <View style={styles.scoreStructureTotal}>
                <Text style={styles.scoreStructureTotalText}>Tổng điểm: 300 điểm</Text>
              </View>
            </View>

            {/* Wrong Questions */}
            {wrongQuestions.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>❌ Câu trả lời sai ({wrongQuestions.length})</Text>
                <View style={styles.wrongQuestionsGrid}>
                  {wrongQuestions.map((q) => (
                    <TouchableOpacity
                      key={q.questionId}
                      style={styles.wrongQuestionButton}
                      onPress={() => {
                        setActiveTab(q.sectionType);
                        setExpandedQuestions(new Set([q.questionId]));
                      }}
                    >
                      <Text style={styles.wrongQuestionText}>Câu {q.questionNumber}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Section Detail Tab */}
        {activeTab !== 'overview' && (
          <View style={styles.content}>
            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.filterButton, showOnlyWrong && styles.filterButtonActive]}
                onPress={() => setShowOnlyWrong(!showOnlyWrong)}
              >
                <Text style={[styles.filterButtonText, showOnlyWrong && styles.filterButtonTextActive]}>
                  {showOnlyWrong ? '👁️ Đang lọc câu sai' : '🔍 Chỉ xem câu sai'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Questions */}
            <View style={styles.questionsList}>
              {getFilteredQuestions().map((question) => {
                const isExpanded = expandedQuestions.has(question.questionId);
                const isCorrect = question.isCorrect;

                return (
                  <View
                    key={question.questionId}
                    style={[
                      styles.questionCard,
                      { borderColor: isCorrect ? '#4CAF50' : '#FF5252' },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.questionHeader}
                      onPress={() => toggleQuestion(question.questionId)}
                    >
                      <View style={styles.questionHeaderLeft}>
                        <Text style={[styles.questionIcon, { color: isCorrect ? '#4CAF50' : '#FF5252' }]}>
                          {isCorrect ? '✓' : '✗'}
                        </Text>
                        <Text style={styles.questionNumber}>Câu {question.questionNumber}</Text>
                        <Text style={styles.questionType}>{question.questionType}</Text>
                      </View>
                      <Text style={styles.questionScore}>
                        {question.score}/{question.maxScore}đ
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.questionContent}>
                        <Text style={styles.questionText}>{question.questionText}</Text>

                        {question.questionType !== 'ESSAY' && (
                          <View style={styles.answersRow}>
                            <View style={styles.answerBox}>
                              <Text style={styles.answerLabel}>Câu trả lời của bạn:</Text>
                              <View style={styles.answerTextContainer}>
                                {typeof renderAnswer(question.userAnswer) === 'string' ? (
                                  <Text style={[styles.answerText, { color: isCorrect ? '#4CAF50' : '#FF5252' }]}>
                                    {renderAnswer(question.userAnswer)}
                                  </Text>
                                ) : (
                                  renderAnswer(question.userAnswer)
                                )}
                              </View>
                            </View>

                            <View style={styles.answerBox}>
                              <Text style={styles.answerLabel}>Đáp án đúng:</Text>
                              <View style={styles.answerTextContainer}>
                                {typeof renderAnswer(question.correctAnswer) === 'string' ? (
                                  <Text style={[styles.answerText, { color: '#4CAF50' }]}>
                                    {renderAnswer(question.correctAnswer)}
                                  </Text>
                                ) : (
                                  renderAnswer(question.correctAnswer)
                                )}
                              </View>
                            </View>
                          </View>
                        )}

                        {question.questionType === 'ESSAY' && (
                          <View style={styles.essayContainer}>
                            <Text style={styles.essayLabel}>
                              📝 Bài làm ({question.userAnswer?.length || 0} ký tự):
                            </Text>
                            <ScrollView style={styles.essayScrollView}>
                              <Text style={styles.essayText}>
                                {question.userAnswer || '(Không có bài làm)'}
                              </Text>
                            </ScrollView>

                            {question.aiScore !== null && question.aiScore !== undefined && (
                              <View style={styles.aiGradingCard}>
                                <View style={styles.aiHeader}>
                                  <Text style={styles.aiTitle}>🤖 Chấm điểm AI</Text>
                                  <Text style={styles.aiScore}>
                                    {question.aiScore}/100
                                  </Text>
                                </View>

                                {question.aiBreakdown && (
                                  <View style={styles.aiBreakdown}>
                                    <View style={styles.aiBreakdownItem}>
                                      <Text style={styles.aiBreakdownLabel}>Nội dung</Text>
                                      <Text style={styles.aiBreakdownValue}>
                                        {question.aiBreakdown.content}/40
                                      </Text>
                                    </View>
                                    <View style={styles.aiBreakdownItem}>
                                      <Text style={styles.aiBreakdownLabel}>Ngữ pháp</Text>
                                      <Text style={styles.aiBreakdownValue}>
                                        {question.aiBreakdown.grammar}/30
                                      </Text>
                                    </View>
                                    <View style={styles.aiBreakdownItem}>
                                      <Text style={styles.aiBreakdownLabel}>Từ vựng</Text>
                                      <Text style={styles.aiBreakdownValue}>
                                        {question.aiBreakdown.vocabulary}/20
                                      </Text>
                                    </View>
                                    <View style={styles.aiBreakdownItem}>
                                      <Text style={styles.aiBreakdownLabel}>Tổ chức</Text>
                                      <Text style={styles.aiBreakdownValue}>
                                        {question.aiBreakdown.organization}/10
                                      </Text>
                                    </View>
                                  </View>
                                )}

                                {question.aiFeedback && (
                                  <View style={styles.aiFeedbackBox}>
                                    <Text style={styles.aiFeedbackLabel}>💬 Nhận xét:</Text>
                                    <Text style={styles.aiFeedbackText}>{question.aiFeedback}</Text>
                                  </View>
                                )}

                                {question.aiSuggestions && question.aiSuggestions.length > 0 && (
                                  <View style={styles.aiSuggestionsBox}>
                                    <Text style={styles.aiSuggestionsLabel}>💡 Gợi ý:</Text>
                                    {question.aiSuggestions.map((suggestion, idx) => (
                                      <Text key={idx} style={styles.aiSuggestionText}>
                                        • {suggestion}
                                      </Text>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              {getFilteredQuestions().length === 0 && showOnlyWrong && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    🎉 Tuyệt vời! Bạn đã trả lời đúng tất cả!
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => navigation.navigate('ExamDetail', { examId: result.examId })}
        >
          <Text style={styles.retakeButtonText}>🔄 Làm lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  scoreValuePassed: {
    color: '#4CAF50',
  },
  scoreMax: {
    fontSize: 24,
    color: '#999',
    marginLeft: 4,
  },
  levelBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPassed: {
    backgroundColor: '#E8F5E9',
  },
  statusFailed: {
    backgroundColor: '#FFE8DC',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingLeft: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FF6B35',
  },
  tabBadge: {
    fontSize: 11,
    marginTop: 4,
    color: '#999',
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  sectionStat: {
    alignItems: 'center',
  },
  sectionStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sectionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionStatMax: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wrongQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrongQuestionButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  wrongQuestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5252',
  },
  levelReferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  levelReferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  levelReferenceLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 90,
  },
  levelReferenceRange: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  levelReferenceYou: {
    fontSize: 14,
  },
  scoreStructureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scoreStructureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scoreStructureLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreStructureValue: {
    fontSize: 12,
    color: '#666',
  },
  scoreStructureBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  scoreStructureDetail: {
    fontSize: 11,
    color: '#666',
    marginLeft: 28,
    marginBottom: 4,
  },
  scoreStructureTotal: {
    backgroundColor: '#FFE8DC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  scoreStructureTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  controls: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF5252',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#FF5252',
  },
  questionsList: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  questionType: {
    fontSize: 10,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionScore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  questionContent: {
    padding: 12,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  answersRow: {
    gap: 12,
  },
  answerBox: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  answerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  answerTextContainer: {
    minHeight: 20,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  answerImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  essayContainer: {
    gap: 12,
  },
  essayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  essayScrollView: {
    maxHeight: 150,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  essayText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  aiGradingCard: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  aiScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  aiBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  aiBreakdownItem: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    width: '47%',
  },
  aiBreakdownLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  aiBreakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  aiFeedbackBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiFeedbackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  aiFeedbackText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  aiSuggestionsBox: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
  },
  aiSuggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 6,
  },
  aiSuggestionText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  retakeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExamResultScreen;
