import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { placementQuestions, levelRecommendations } from '../constants/placementTestData';

const { width } = Dimensions.get('window');

const PlacementTestScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, test, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Tính kết quả test
  const calculateResult = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === placementQuestions[index].correct) {
        correctAnswers++;
      }
    });

    const score = correctAnswers * 10;
    let recommendedLevel = 1;
    if (correctAnswers >= 9) recommendedLevel = 6;
    else if (correctAnswers >= 8) recommendedLevel = 5;
    else if (correctAnswers >= 7) recommendedLevel = 4;
    else if (correctAnswers >= 6) recommendedLevel = 3;
    else if (correctAnswers >= 4) recommendedLevel = 2;
    else recommendedLevel = 1;

    return { score, recommendedLevel, correctAnswers };
  };

  // Xử lý chọn đáp án
  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < placementQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      const result = calculateResult();
      setTestResult(result);
      setCurrentStep('result');
    }
  };

  // Phát audio
  const playAudio = async (audioUrl) => {
    try {
      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.log('Audio error:', error);
      setIsPlaying(false);
      Alert.alert('Lỗi', 'Không thể phát audio');
    }
  };

  // Cleanup audio
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // INTRO SCREEN
  if (currentStep === 'intro') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconLarge}>🐯</Text>
          </View>

          {/* Title */}
          <Text style={styles.introTitle}>Chào mừng đến với{'\n'}TigerKorean</Text>
          <Text style={styles.introSubtitle}>
            Hành trình học tiếng Hàn của bạn bắt đầu từ đây!
          </Text>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎯 Kiểm tra trình độ</Text>
            <Text style={styles.infoDescription}>
              Làm 9 câu hỏi nhanh để chúng tôi đánh giá trình độ và gợi ý cấp độ học phù hợp nhất
              cho bạn
            </Text>
            <View style={styles.infoStats}>
              <Text style={styles.infoStatText}>⏱️ Thời gian: ~3 phút</Text>
              <Text style={styles.infoStatText}>•</Text>
              <Text style={styles.infoStatText}>📝 9 câu hỏi</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.startButton} onPress={() => setCurrentStep('test')}>
            <Text style={styles.startButtonText}>🚀 Bắt đầu kiểm tra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.skipButtonText}>Bỏ qua - Học ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // TEST SCREEN
  if (currentStep === 'test') {
    const question = placementQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / placementQuestions.length) * 100;

    return (
      <View style={styles.container}>
        {/* Header with progress */}
        <View style={styles.testHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Câu {currentQuestion + 1} / {placementQuestions.length}
            </Text>
            <Text style={styles.levelBadge}>Cấp độ {question.level}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.testContent} showsVerticalScrollIndicator={false}>
          {/* Instruction */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{question.instruction}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Audio Player for listening questions */}
          {question.type === 'listening' && (
            <View style={styles.audioContainer}>
              <View style={styles.audioHeader}>
                <View style={styles.audioIcon}>
                  <Text style={styles.audioIconText}>🎧</Text>
                </View>
                <Text style={styles.audioLabel}>Phần nghe</Text>
              </View>
              <TouchableOpacity
                style={[styles.playButton, isPlaying && styles.playButtonActive]}
                onPress={() => playAudio(question.audioUrl)}
                disabled={isPlaying}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸️ Đang phát...' : '▶️ Nghe audio'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.audioTip}>💡 Nhấn để nghe lại nhiều lần</Text>
            </View>
          )}

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(index)}
              >
                <View style={styles.optionCircle}>
                  <Text style={styles.optionCircleText}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // RESULT SCREEN
  if (currentStep === 'result' && testResult) {
    const recommendation = levelRecommendations[testResult.recommendedLevel - 1];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultContainer}>
          {/* Celebration */}
          <Text style={styles.celebrationIcon}>🎉</Text>
          <Text style={styles.resultTitle}>Kết quả kiểm tra trình độ</Text>
          <Text style={styles.resultSubtitle}>
            Bạn đã hoàn thành bài kiểm tra! Đây là kết quả và đề xuất của chúng tôi
          </Text>

          {/* Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreNumber}>{testResult.score}</Text>
              <Text style={styles.scoreLabel}>Điểm số</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreNumber}>
                {testResult.correctAnswers}/{placementQuestions.length}
              </Text>
              <Text style={styles.scoreLabel}>Câu đúng</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreNumber}>
                {Math.round((testResult.correctAnswers / placementQuestions.length) * 100)}%
              </Text>
              <Text style={styles.scoreLabel}>Tỷ lệ đúng</Text>
            </View>
          </View>

          {/* Recommended Level */}
          <View style={[styles.recommendCard, { backgroundColor: recommendation.color }]}>
            <View style={styles.recommendHeader}>
              <Text style={styles.recommendIcon}>{recommendation.icon}</Text>
              <View style={styles.recommendInfo}>
                <Text style={styles.recommendTitle}>{recommendation.title}</Text>
                <Text style={styles.recommendDescription}>{recommendation.description}</Text>
              </View>
            </View>
            <View style={styles.recommendTip}>
              <Text style={styles.recommendTipText}>
                💡 Gợi ý: Bạn nên bắt đầu học từ cấp độ này để có nền tảng vững chắc
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('LessonPath', { level: testResult.recommendedLevel })}
          >
            <Text style={styles.primaryButtonText}>
              🚀 Bắt đầu học cấp {testResult.recommendedLevel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setCurrentStep('test');
              setCurrentQuestion(0);
              setAnswers([]);
              setTestResult(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>🔄 Làm lại test</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  // INTRO STYLES
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: Dimensions.get('window').height - 100,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconLarge: {
    fontSize: 80,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoStatText: {
    fontSize: 14,
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  // TEST STYLES
  testHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  levelBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  testContent: {
    flex: 1,
    padding: 16,
  },
  instructionBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 24,
  },
  questionBox: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 28,
  },
  audioContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioIconText: {
    fontSize: 16,
  },
  audioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  playButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  playButtonActive: {
    backgroundColor: '#FCD34D',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  audioTip: {
    fontSize: 12,
    color: '#92400E',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  // RESULT STYLES
  resultContainer: {
    padding: 24,
    alignItems: 'center',
  },
  celebrationIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 24,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  scoreDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  recommendCard: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  recommendInfo: {
    flex: 1,
  },
  recommendTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  recommendDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  recommendTip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  recommendTipText: {
    fontSize: 14,
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlacementTestScreen;
