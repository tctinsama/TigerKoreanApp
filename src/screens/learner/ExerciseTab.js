import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import exerciseService from '../../services/exerciseService';
import { lessonService } from '../../services/lessonService';
import MultipleChoiceQuestion from '../../components/MultipleChoiceQuestion';
import SentenceRewritingQuestion from '../../components/SentenceRewritingQuestion';

const ExerciseTab = ({ route, navigation }) => {
  const { lessonId } = route.params || {};
  const { user } = useAuth();
  const userId = user?.userId;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentList, setCurrentList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wrongList, setWrongList] = useState([]);
  const [phase, setPhase] = useState('main'); // 'main', 'review', 'done'
  const [questionKey, setQuestionKey] = useState(0);

  const correctCountFirst = useRef(new Map());
  const finishedFirstRound = useRef(false);
  const pendingSavedExercises = useRef(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [lessonId]);

  useEffect(() => {
    if (phase === 'done' && questions.length > 0 && userId) {
      processCompletion();
    }
  }, [phase]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const exercises = await exerciseService.getExercisesByLessonId(lessonId);
      const allQuestions = [];

      for (const ex of exercises) {
        const [mcq, rewrite] = await Promise.all([
          exerciseService.getMultipleChoiceByExerciseId(ex.exerciseId),
          exerciseService.getSentenceRewritingByExerciseId(ex.exerciseId),
        ]);

        mcq.forEach((q) => {
          allQuestions.push({
            type: 'multiple',
            data: { ...q },
            exerciseId: ex.exerciseId,
          });
        });

        rewrite.forEach((q) => {
          allQuestions.push({
            type: 'rewrite',
            data: { ...q },
            exerciseId: ex.exerciseId,
          });
        });
      }

      // Mock data nếu API lỗi
      if (allQuestions.length === 0) {
        const mockQuestions = [
          {
            type: 'multiple',
            data: {
              questionId: 1,
              questionText: '빈칸에 들어갈 알맞은 말을 고르세요.\n_____ 공부해야 시험을 잘 볼 수 있어요.',
              optionA: '열심히',
              optionB: '조용히',
              optionC: '빠르게',
              optionD: '천천히',
              correctAnswer: 'A',
            },
            exerciseId: 1,
          },
          {
            type: 'rewrite',
            data: {
              questionId: 2,
              originalSentence: '저는 한국어를 배우다.',
              rewrittenSentence: '저는 한국어를 배워요.',
            },
            exerciseId: 1,
          },
        ];
        allQuestions.push(...mockQuestions);
      }

      setQuestions(allQuestions);
      setCurrentList(allQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Lỗi', 'Không thể tải bài tập. Sử dụng dữ liệu mẫu.');
      
      // Mock data
      const mockQuestions = [
        {
          type: 'multiple',
          data: {
            questionId: 1,
            questionText: '빈칸에 들어갈 알맞은 말을 고르세요.\n_____ 공부해야 시험을 잘 볼 수 있어요.',
            optionA: '열심히',
            optionB: '조용히',
            optionC: '빠르게',
            optionD: '천천히',
            correctAnswer: 'A',
          },
          exerciseId: 1,
        },
        {
          type: 'rewrite',
          data: {
            questionId: 2,
            originalSentence: '저는 한국어를 배우다.',
            rewrittenSentence: '저는 한국어를 배워요.',
          },
          exerciseId: 1,
        },
      ];
      setQuestions(mockQuestions);
      setCurrentList(mockQuestions);
    } finally {
      setLoading(false);
    }
  };

  const processCompletion = async () => {
    try {
      // Group questions by exerciseId
      const groups = {};
      questions.forEach((q) => {
        const eid = q.exerciseId;
        if (!groups[eid]) groups[eid] = [];
        groups[eid].push(q);
      });

      const exerciseScores = [];

      // Save result for each exercise
      for (const [eidStr, qArr] of Object.entries(groups)) {
        const eid = Number(eidStr);
        if (pendingSavedExercises.current.has(eid)) continue;

        const correct = correctCountFirst.current.get(eid) || 0;
        const total = qArr.length;
        const exerciseScore = Math.round((correct / total) * 100);

        exerciseScores.push(exerciseScore);

        await exerciseService.saveUserExerciseResult({
          userId,
          exerciseId: eid,
          score: exerciseScore,
          dateComplete: new Date().toISOString(),
        });

        pendingSavedExercises.current.add(eid);
      }

      // Calculate lesson score
      const lessonScore = Math.round(
        exerciseScores.reduce((sum, score) => sum + score, 0) / exerciseScores.length
      );

      // Complete lesson - API này sẽ:
      // 1. Đánh dấu lesson hiện tại là completed
      // 2. TỰ ĐỘNG mở khóa bài tiếp theo (backend tạo UserProgress cho bài mới)
      await lessonService.completeLesson(userId, lessonId, lessonScore);

      Alert.alert(
        'Hoàn thành! 🎉',
        `Bạn đã hoàn thành bài tập với điểm số: ${lessonScore}%\n\nBài học tiếp theo đã được mở khóa!`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Navigate back 2 screens để về LessonPathScreen
            // LessonPathScreen sẽ tự động reload và hiển thị bài mới mở khóa
            navigation.goBack(); // Back to LessonDetail
            setTimeout(() => navigation.goBack(), 100); // Back to LessonPath
          }
        }]
      );
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành bài học. Vui lòng thử lại.');
    }
  };

  const handleAnswer = (isCorrect) => {
    const curQuestion = currentList[currentIdx];
    const eid = curQuestion.exerciseId;

    if (phase === 'main' && !finishedFirstRound.current) {
      if (isCorrect) {
        correctCountFirst.current.set(
          eid,
          (correctCountFirst.current.get(eid) || 0) + 1
        );
      }
    }

    if (!isCorrect) {
      setWrongList((list) => [...list, curQuestion]);
    }

    if (currentIdx + 1 < currentList.length) {
      setCurrentIdx((idx) => idx + 1);
      setQuestionKey((k) => k + 1);
    } else {
      if (phase === 'main') {
        finishedFirstRound.current = true;
        if (wrongList.length + (isCorrect ? 0 : 1) > 0) {
          const newWrongList = [...wrongList];
          if (!isCorrect) newWrongList.push(curQuestion);
          setCurrentList(newWrongList);
          setWrongList([]);
          setCurrentIdx(0);
          setPhase('review');
          setQuestionKey((k) => k + 1);
        } else {
          setPhase('done');
        }
      } else {
        if (wrongList.length + (isCorrect ? 0 : 1) > 0) {
          const newWrongList = [...wrongList];
          if (!isCorrect) newWrongList.push(curQuestion);
          setCurrentList(newWrongList);
          setWrongList([]);
          setCurrentIdx(0);
          setQuestionKey((k) => k + 1);
        } else {
          setPhase('done');
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải bài tập...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
        </Text>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Hoàn thành bài tập!</Text>
          
          {Object.entries(
            questions.reduce((acc, q) => {
              const eid = q.exerciseId;
              acc[eid] = (acc[eid] || 0) + 1;
              return acc;
            }, {})
          ).map(([eid, total]) => (
            <View key={eid} style={styles.scoreItem}>
              <Text style={styles.scoreText}>
                Bài tập ID {eid}: Đúng lần đầu:{' '}
                <Text style={styles.scoreBold}>
                  {correctCountFirst.current.get(+eid) || 0}/{total} (
                  {Math.round(
                    ((correctCountFirst.current.get(+eid) || 0) / total) * 100
                  )}
                  %)
                </Text>
              </Text>
            </View>
          ))}
          
          <Text style={styles.completedSubtitle}>
            Tất cả câu hỏi đã được làm đúng, bạn đã hoàn thành bài tập này.
          </Text>
        </View>
        
        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }

  const current = currentList[currentIdx];
  if (!current) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Câu {currentIdx + 1} / {currentList.length}
          {phase === 'review' && <Text style={styles.reviewText}> (Làm lại các câu sai)</Text>}
        </Text>
      </View>

      {current.type === 'multiple' && (
        <MultipleChoiceQuestion
          key={questionKey}
          question={current.data}
          onNext={handleAnswer}
        />
      )}

      {current.type === 'rewrite' && (
        <SentenceRewritingQuestion
          key={questionKey}
          question={current.data}
          onNext={handleAnswer}
        />
      )}
      
      {/* Bottom Spacing for Tab Bar */}
      <View style={{ height: 100 }} />
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
    paddingBottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  reviewText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  completedContainer: {
    padding: 24,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  scoreItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    width: '100%',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
  },
  scoreBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ExerciseTab;
