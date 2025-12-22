import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import examService from '../../services/examService';

const { width } = Dimensions.get('window');

const ExamAttemptScreen = ({ navigation, route }) => {
  const { attemptId } = route.params;

  const [attempt, setAttempt] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(new Map());
  const [textAnswers, setTextAnswers] = useState(new Map());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNavigator, setShowNavigator] = useState(false);
  const [savingText, setSavingText] = useState(new Set());
  const [audioSound, setAudioSound] = useState(null);
  const [sectionAudioSound, setSectionAudioSound] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSectionAudioPlaying, setIsSectionAudioPlaying] = useState(false);

  const timerRef = useRef(null);
  const saveTextTimerRef = useRef(new Map());

  useEffect(() => {
    if (attemptId) {
      setupAudio();
      fetchAttemptData();
    }
    return () => {
      // Cleanup: Stop and unload all audio when leaving screen
      console.log('Cleaning up audio...');
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioSound) {
        audioSound.stopAsync().catch(err => console.log('Error stopping audio:', err));
        audioSound.unloadAsync().catch(err => console.log('Error unloading audio:', err));
      }
      if (sectionAudioSound) {
        sectionAudioSound.stopAsync().catch(err => console.log('Error stopping section audio:', err));
        sectionAudioSound.unloadAsync().catch(err => console.log('Error unloading section audio:', err));
      }
    };
  }, [attemptId]);

  const setupAudio = async () => {
    try {
      console.log('Setting up audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
        interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
      });
      console.log('Audio mode set successfully');
    } catch (err) {
      console.error('Error setting up audio:', err);
      Alert.alert('C\u1ea3nh b\u00e1o', 'Kh\u00f4ng th\u1ec3 thi\u1ebft l\u1eadp audio. Vui l\u00f2ng ki\u1ec3m tra quy\u1ec1n truy c\u1eadp.');
    }
  };

  useEffect(() => {
    // Stop audio when changing questions
    return () => {
      if (audioSound) {
        audioSound.stopAsync();
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    // Auto-play audio when question loads
    if (currentQuestion && questions.length > 0) {
      const questionGroup = getQuestionGroup(currentQuestion);
      const isGrouped = questionGroup.length > 1;
      
      // Chỉ tự động phát question audio nếu KHÔNG phải LISTENING section
      // (Vì LISTENING dùng section audio)
      const currentSec = sections[currentSectionIndex];
      if (currentSec?.sectionType !== 'LISTENING') {
        // Nếu là grouped và có audio chung, tự động phát
        if (isGrouped && currentQuestion.audioUrl) {
          const firstInGroup = questionGroup[0];
          if (currentQuestion.questionId === firstInGroup.questionId) {
            handlePlayAudio(currentQuestion.audioUrl);
          }
        }
        // Nếu không grouped và có audio riêng, tự động phát
        else if (!isGrouped && currentQuestion.audioUrl) {
          handlePlayAudio(currentQuestion.audioUrl);
        }
      }
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (sections.length > 0 && currentSectionIndex < sections.length) {
      // Stop section audio from previous section
      if (sectionAudioSound) {
        console.log('Stopping audio from previous section...');
        sectionAudioSound.stopAsync().catch(err => console.log('Error stopping:', err));
        sectionAudioSound.unloadAsync().catch(err => console.log('Error unloading:', err));
        setSectionAudioSound(null);
        setIsSectionAudioPlaying(false);
      }

      fetchQuestionsForSection(sections[currentSectionIndex].sectionId);
      loadOrResetTimer();
      startTimer();
      
      // Auto-play section audio for LISTENING
      const currentSec = sections[currentSectionIndex];
      if (currentSec.sectionType === 'LISTENING' && currentSec.audioUrl) {
        handlePlaySectionAudio(currentSec.audioUrl);
      }
    }
  }, [currentSectionIndex, sections]);

  const fetchAttemptData = async () => {
    try {
      setLoading(true);
      const attemptData = await examService.getAttemptById(attemptId);
      setAttempt(attemptData);

      // Load saved position
      const saved = await AsyncStorage.getItem('topik_in_progress');
      let savedSectionIndex = 0;
      let savedQuestionIndex = 0;

      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.attemptId === attemptId) {
            savedSectionIndex = data.currentSectionIndex || 0;
            savedQuestionIndex = data.currentQuestionIndex || 0;
          }
        } catch (err) {
          console.error('Error parsing saved position:', err);
        }
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        'topik_in_progress',
        JSON.stringify({
          attemptId,
          examTitle: attemptData.examTitle || 'Bài thi TOPIK',
          startedAt: new Date().toISOString(),
          currentSectionIndex: savedSectionIndex,
          currentQuestionIndex: savedQuestionIndex,
        })
      );

      if (attemptData.examId) {
        const sectionsData = await examService.getSectionsByExam(attemptData.examId);
        setSections(sectionsData.sort((a, b) => a.sectionOrder - b.sectionOrder));
        setCurrentSectionIndex(savedSectionIndex);
        setCurrentQuestionIndex(savedQuestionIndex);
      }

      // Load saved answers
      await loadSavedAnswers();
    } catch (err) {
      console.error('Error fetching attempt:', err);
      Alert.alert('Lỗi', 'Không thể tải thông tin bài thi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      const savedAnswers = await examService.getAnswersByAttempt(attemptId);
      const mcqAnswers = new Map();
      const textAnswersMap = new Map();

      savedAnswers.forEach((answer) => {
        if (answer.questionId) {
          if (answer.choiceId) {
            mcqAnswers.set(answer.questionId, answer.choiceId);
          }
          if (answer.answerText) {
            textAnswersMap.set(answer.questionId, answer.answerText);
          }
        }
      });

      setSelectedAnswers(mcqAnswers);
      setTextAnswers(textAnswersMap);
    } catch (err) {
      console.error('Error loading saved answers:', err);
    }
  };

  const fetchQuestionsForSection = async (sectionId) => {
    try {
      const questionsData = await examService.getQuestionsBySection(sectionId);
      if (!questionsData || questionsData.length === 0) {
        setQuestions([]);
        return;
      }
      const sortedQuestions = questionsData.sort((a, b) => a.questionNumber - b.questionNumber);
      console.log('Questions loaded:', sortedQuestions.length);
      console.log('Sample question:', sortedQuestions[0]);
      console.log('Current section:', sections[currentSectionIndex]);
      
      // Kiểm tra audio trong questions
      const questionsWithAudio = sortedQuestions.filter(q => q.audioUrl);
      console.log('Questions with audio:', questionsWithAudio.length);
      if (questionsWithAudio.length > 0) {
        console.log('First audio URL:', questionsWithAudio[0].audioUrl);
      }
      
      setQuestions(sortedQuestions);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    }
  };

  const loadOrResetTimer = async () => {
    const saved = await AsyncStorage.getItem('topik_in_progress');
    let shouldLoadSavedTime = false;

    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (
          data.attemptId === attemptId &&
          data.currentSectionIndex === currentSectionIndex &&
          data.timeLeft
        ) {
          setTimeLeft(data.timeLeft);
          shouldLoadSavedTime = true;
        }

        data.currentSectionIndex = currentSectionIndex;
        data.currentQuestionIndex = currentQuestionIndex;
        if (!shouldLoadSavedTime) {
          const section = sections[currentSectionIndex];
          const newTime = section.durationMinutes * 60;
          setTimeLeft(newTime);
          data.timeLeft = newTime;
        }
        await AsyncStorage.setItem('topik_in_progress', JSON.stringify(data));
      } catch (err) {
        const section = sections[currentSectionIndex];
        setTimeLeft(section.durationMinutes * 60);
      }
    } else {
      const section = sections[currentSectionIndex];
      setTimeLeft(section.durationMinutes * 60);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }

        const newTime = prev - 1;

        // Save every 5 seconds
        if (newTime % 5 === 0) {
          AsyncStorage.getItem('topik_in_progress').then((saved) => {
            if (saved) {
              try {
                const data = JSON.parse(saved);
                data.timeLeft = newTime;
                AsyncStorage.setItem('topik_in_progress', JSON.stringify(data));
              } catch (err) {
                console.error('Error saving timer:', err);
              }
            }
          });
        }

        return newTime;
      });
    }, 1000);
  };

  const handleAutoSubmit = async () => {
    try {
      await examService.submitExam(attemptId);
      await AsyncStorage.removeItem('topik_in_progress');
      Alert.alert('Hết giờ', 'Bài thi đã được tự động nộp.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ExamResult', { attemptId }),
        },
      ]);
    } catch (err) {
      console.error('Error auto-submitting exam:', err);
      Alert.alert('Lỗi', 'Hết giờ nhưng có lỗi khi tự động nộp bài');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (questionId, choiceId) => {
    const currentAnswer = selectedAnswers.get(questionId);

    if (currentAnswer === choiceId) {
      const newAnswers = new Map(selectedAnswers);
      newAnswers.delete(questionId);
      setSelectedAnswers(newAnswers);

      try {
        await examService.saveUserAnswer({
          attemptId,
          questionId,
          choiceId: null,
        });
      } catch (err) {
        console.error('Error removing answer:', err);
      }
    } else {
      setSelectedAnswers(new Map(selectedAnswers.set(questionId, choiceId)));

      try {
        await examService.saveUserAnswer({
          attemptId,
          questionId,
          choiceId,
        });
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }
  };

  const handleTextAnswerChange = (questionId, text) => {
    setTextAnswers(new Map(textAnswers.set(questionId, text)));

    const existingTimer = saveTextTimerRef.current.get(questionId);
    if (existingTimer) clearTimeout(existingTimer);

    const newTimer = setTimeout(() => {
      handleTextAnswerSave(questionId);
    }, 2000);

    saveTextTimerRef.current.set(questionId, newTimer);
  };

  const handleTextAnswerSave = async (questionId) => {
    const text = textAnswers.get(questionId);
    if (!text || text.trim() === '') return;

    setSavingText(new Set(savingText.add(questionId)));

    try {
      await examService.saveUserAnswer({
        attemptId,
        questionId,
        answerText: text,
      });
    } catch (err) {
      console.error('Error saving text answer:', err);
    } finally {
      setSavingText((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const handlePlayAudio = async (audioUrl) => {
    if (!audioUrl) {
      Alert.alert('Lỗi', 'Không có file audio');
      return;
    }

    try {
      setAudioLoading(true);
      console.log('Playing audio:', audioUrl);
      
      // Stop current audio if playing
      if (audioSound) {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setAudioSound(sound);
      setIsPlaying(true);

      // Set callback when audio finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
        if (status.error) {
          console.error('Audio playback error:', status.error);
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      Alert.alert('Lỗi', `Không thể phát audio: ${err.message}`);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleStopAudio = async () => {
    try {
      if (audioSound) {
        await audioSound.stopAsync();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error stopping audio:', err);
    }
  };

  const handlePlaySectionAudio = async (audioUrl) => {
    if (!audioUrl) {
      Alert.alert('Lỗi', 'Không có file audio');
      return;
    }

    try {
      setAudioLoading(true);
      console.log('Playing section audio:', audioUrl);
      
      // Stop current section audio if playing
      if (sectionAudioSound) {
        console.log('Stopping previous section audio...');
        try {
          await sectionAudioSound.stopAsync();
          await sectionAudioSound.unloadAsync();
        } catch (err) {
          console.log('Error stopping previous audio:', err);
        }
        setSectionAudioSound(null);
        setIsSectionAudioPlaying(false);
      }

      // Small delay to ensure previous audio is fully stopped
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Creating new audio sound...');
      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      console.log('Audio created successfully');
      setSectionAudioSound(sound);
      setIsSectionAudioPlaying(true);

      // Set callback when audio finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('Audio finished playing');
          setIsSectionAudioPlaying(false);
        }
        if (status.error) {
          console.error('Section audio playback error:', status.error);
          setIsSectionAudioPlaying(false);
        }
      });
    } catch (err) {
      console.error('Error playing section audio:', err);
      Alert.alert('Lỗi', `Không thể phát audio: ${err.message}`);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleStopSectionAudio = async () => {
    try {
      if (sectionAudioSound) {
        await sectionAudioSound.stopAsync();
        setIsSectionAudioPlaying(false);
      }
    } catch (err) {
      console.error('Error stopping section audio:', err);
    }
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (currentQ.groupId) {
      const nextIndex = questions.findIndex(
        (q, idx) => idx > currentQuestionIndex && q.groupId !== currentQ.groupId
      );
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
        updateSavedPosition(currentSectionIndex, nextIndex);
      }
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        const newIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(newIndex);
        updateSavedPosition(currentSectionIndex, newIndex);
      }
    }
  };

  const handlePreviousQuestion = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (currentQ.groupId) {
      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        if (questions[i].groupId !== currentQ.groupId) {
          setCurrentQuestionIndex(i);
          updateSavedPosition(currentSectionIndex, i);
          return;
        }
      }
    } else {
      if (currentQuestionIndex > 0) {
        const newIndex = currentQuestionIndex - 1;
        setCurrentQuestionIndex(newIndex);
        updateSavedPosition(currentSectionIndex, newIndex);
      }
    }
  };

  const updateSavedPosition = async (sectionIdx, questionIdx) => {
    const saved = await AsyncStorage.getItem('topik_in_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        data.currentSectionIndex = sectionIdx;
        data.currentQuestionIndex = questionIdx;
        await AsyncStorage.setItem('topik_in_progress', JSON.stringify(data));
      } catch (err) {
        console.error('Error updating question position:', err);
      }
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      Alert.alert(
        'Chuyển phần thi',
        `Bạn muốn chuyển sang phần ${getSectionName(nextSection.sectionType)}?\n\nLưu ý: Bạn không thể quay lại phần trước sau khi chuyển.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Chuyển',
            onPress: async () => {
              // Stop section audio before changing section
              if (sectionAudioSound) {
                try {
                  await sectionAudioSound.stopAsync();
                  await sectionAudioSound.unloadAsync();
                  setSectionAudioSound(null);
                  setIsSectionAudioPlaying(false);
                  console.log('Audio stopped when changing section');
                } catch (err) {
                  console.log('Error stopping audio when changing section:', err);
                }
              }

              const newSectionIndex = currentSectionIndex + 1;
              setCurrentSectionIndex(newSectionIndex);
              setCurrentQuestionIndex(0);
              updateSavedPosition(newSectionIndex, 0);
            },
          },
        ]
      );
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = async () => {
    Alert.alert('Nộp bài', 'Bạn có chắc chắn muốn nộp bài?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Nộp bài',
        style: 'destructive',
        onPress: async () => {
          try {
            await examService.submitExam(attemptId);
            await AsyncStorage.removeItem('topik_in_progress');
            Alert.alert('Thành công', 'Nộp bài thành công!', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('ExamResult', { attemptId }),
              },
            ]);
          } catch (err) {
            console.error('Error submitting exam:', err);
            Alert.alert('Lỗi', 'Có lỗi khi nộp bài');
          }
        },
      },
    ]);
  };

  const handleBackPress = () => {
    Alert.alert(
      'Thoát bài thi',
      'Bài làm của bạn đã được lưu. Bạn có muốn thoát?',
      [
        { text: 'Tiếp tục làm bài', style: 'cancel' },
        {
          text: 'Thoát',
          style: 'destructive',
          onPress: async () => {
            // Stop all audio before leaving
            try {
              if (audioSound) {
                await audioSound.stopAsync();
                await audioSound.unloadAsync();
              }
              if (sectionAudioSound) {
                await sectionAudioSound.stopAsync();
                await sectionAudioSound.unloadAsync();
              }
            } catch (err) {
              console.log('Error stopping audio on exit:', err);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getSectionName = (type) => {
    switch (type) {
      case 'LISTENING':
        return 'Nghe hiểu';
      case 'READING':
        return 'Đọc hiểu';
      case 'WRITING':
        return 'Viết';
      default:
        return 'Phần tiếp theo';
    }
  };

  const getQuestionGroup = (question) => {
    if (!question.groupId) return [question];
    return questions.filter((q) => q.groupId === question.groupId);
  };

  const getUniqueQuestions = () => {
    const seen = new Set();
    return questions.filter((q) => {
      if (seen.has(q.questionNumber)) return false;
      seen.add(q.questionNumber);
      return true;
    });
  };

  const hasQuestionAnswer = (question) => {
    return (
      selectedAnswers.has(question.questionId) || textAnswers.has(question.questionId)
    );
  };

  if (loading || !attempt || sections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải bài thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = questions[currentQuestionIndex];
  const uniqueQuestions = getUniqueQuestions();
  const currentUniqueIndex = uniqueQuestions.findIndex(
    (q) => q.questionNumber === currentQuestion?.questionNumber
  );
  const progress =
    currentUniqueIndex >= 0
      ? ((currentUniqueIndex + 1) / uniqueQuestions.length) * 100
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>← Thoát</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.sectionTitle}>
              {getSectionName(currentSection.sectionType)} - Phần {currentSectionIndex + 1}/{sections.length}
            </Text>
            <Text style={styles.questionBadge}>
              Câu {currentQuestion?.questionNumber || currentQuestionIndex + 1}/
              {uniqueQuestions.length}
            </Text>
          </View>
          <View
            style={[
              styles.timerBadge,
              timeLeft < 300 && styles.timerBadgeWarning,
            ]}
          >
            <Text
              style={[
                styles.timerText,
                timeLeft < 300 && styles.timerTextWarning,
              ]}
            >
              ⏱️ {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Section Audio Player for LISTENING */}
        {currentSection.sectionType === 'LISTENING' && currentSection.audioUrl && (
          <View style={styles.sectionAudioCard}>
            <View style={styles.sectionAudioHeader}>
              <Text style={styles.sectionAudioIcon}>🎧</Text>
              <Text style={styles.sectionAudioTitle}>Audio cho toàn phần Nghe hiểu</Text>
            </View>
            <View style={styles.sectionAudioButtons}>
              <TouchableOpacity
                style={[
                  styles.sectionAudioButton,
                  isSectionAudioPlaying && styles.sectionAudioButtonPlaying,
                ]}
                onPress={() =>
                  isSectionAudioPlaying
                    ? handleStopSectionAudio()
                    : handlePlaySectionAudio(currentSection.audioUrl)
                }
                disabled={audioLoading}
              >
                {audioLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sectionAudioButtonText}>
                    {isSectionAudioPlaying ? '⏸️ Dừng' : '▶️ Phát audio'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionAudioNote}>
              💡 Audio sẽ chạy liên tục cho cả phần thi. Bạn có thể chuyển câu trong khi nghe.
            </Text>
          </View>
        )}

        {currentQuestion ? (
          <View style={styles.questionContainer}>
            {(() => {
              const questionGroup = getQuestionGroup(currentQuestion);
              const isGrouped = questionGroup.length > 1;

              return (
                <>
                  {/* Audio Player (shared for grouped) */}
                  {isGrouped && currentQuestion.audioUrl && (
                    <View style={styles.audioCard}>
                      <View style={styles.audioHeader}>
                        <Text style={styles.audioIcon}>🎧</Text>
                        <Text style={styles.audioTitle}>Audio cho nhóm câu hỏi</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
                        onPress={() => isPlaying ? handleStopAudio() : handlePlayAudio(currentQuestion.audioUrl)}
                        disabled={audioLoading}
                      >
                        {audioLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.audioButtonText}>
                            {isPlaying ? '⏸️ Dừng' : '▶️ Phát audio'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Image (shared for grouped) */}
                  {isGrouped && currentQuestion.imageUrl && (
                    <View style={styles.imageCard}>
                      <Image
                        source={{ uri: currentQuestion.imageUrl }}
                        style={styles.questionImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {/* Passage Text (shared for grouped) */}
                  {isGrouped && currentQuestion.passageText && (
                    <View style={styles.passageCard}>
                      <Text style={styles.passageText}>
                        {currentQuestion.passageText}
                      </Text>
                    </View>
                  )}

                  {/* Questions in group */}
                  {questionGroup.map((q, idx) => (
                    <View
                      key={q.questionId}
                      style={[styles.questionCard, idx > 0 && styles.questionCardBorder]}
                    >
                      {/* Individual Audio (not grouped) */}
                      {!isGrouped && q.audioUrl && (
                        <View style={styles.audioCardSmall}>
                          <TouchableOpacity
                            style={[styles.audioButtonSmall, isPlaying && styles.audioButtonPlaying]}
                            onPress={() => isPlaying ? handleStopAudio() : handlePlayAudio(q.audioUrl)}
                            disabled={audioLoading}
                          >
                            <Text style={styles.audioButtonTextSmall}>
                              {audioLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'} 
                              {audioLoading ? ' Đang tải...' : isPlaying ? ' Dừng audio' : ' Phát audio'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Individual Image (not grouped) */}
                      {!isGrouped && q.imageUrl && (
                        <View style={styles.imageCardSmall}>
                          <Image
                            source={{ uri: q.imageUrl }}
                            style={styles.questionImageSmall}
                            resizeMode="contain"
                          />
                        </View>
                      )}

                      {/* Question Text */}
                      <Text style={styles.questionText}>
                        {q.questionNumber}. {q.questionText}
                      </Text>

                      {/* Answer Options */}
                      <View style={styles.answersContainer}>
                        {q.questionType === 'SHORT' || q.questionType === 'ESSAY' ? (
                          <View style={styles.textAnswerContainer}>
                            <TextInput
                              style={[
                                styles.textInput,
                                q.questionType === 'ESSAY' && styles.textInputEssay,
                              ]}
                              value={textAnswers.get(q.questionId) || ''}
                              onChangeText={(text) =>
                                handleTextAnswerChange(q.questionId, text)
                              }
                              onBlur={() => handleTextAnswerSave(q.questionId)}
                              placeholder={
                                q.questionType === 'ESSAY'
                                  ? 'Nhập câu trả lời (tối thiểu 200 ký tự)...'
                                  : 'Nhập câu trả lời ngắn...'
                              }
                              multiline
                              textAlignVertical="top"
                            />
                            <View style={styles.textAnswerFooter}>
                              <Text style={styles.charCount}>
                                {textAnswers.get(q.questionId)?.length || 0} ký tự
                                {q.questionType === 'ESSAY' && ' (tối thiểu 200)'}
                              </Text>
                              {savingText.has(q.questionId) && (
                                <Text style={styles.savingText}>Đang lưu...</Text>
                              )}
                            </View>
                          </View>
                        ) : q.choices && q.choices.length > 0 ? (
                          q.choices.map((choice) => {
                            // Kiểm tra xem choiceText có phải là URL hình ảnh không
                            const isImageUrl = choice.choiceText && 
                              (choice.choiceText.startsWith('http://') || 
                               choice.choiceText.startsWith('https://')) &&
                              (choice.choiceText.includes('cloudinary') || 
                               choice.choiceText.match(/\.(jpg|jpeg|png|gif|webp)$/i));

                            return (
                              <TouchableOpacity
                                key={choice.choiceId}
                                style={[
                                  styles.choiceButton,
                                  selectedAnswers.get(q.questionId) === choice.choiceId &&
                                    styles.choiceButtonSelected,
                                  isImageUrl && styles.choiceButtonWithImage,
                                ]}
                                onPress={() =>
                                  handleAnswerSelect(q.questionId, choice.choiceId)
                                }
                              >
                                <View style={styles.choiceContent}>
                                  <View
                                    style={[
                                      styles.choiceLabel,
                                      selectedAnswers.get(q.questionId) ===
                                        choice.choiceId && styles.choiceLabelSelected,
                                    ]}
                                  >
                                    <Text style={[
                                      styles.choiceLabelText,
                                      selectedAnswers.get(q.questionId) ===
                                        choice.choiceId && styles.choiceLabelTextSelected,
                                    ]}>
                                      {choice.choiceLabel}
                                    </Text>
                                  </View>
                                  {isImageUrl ? (
                                    <Image
                                      source={{ uri: choice.choiceText }}
                                      style={styles.choiceImage}
                                      resizeMode="contain"
                                    />
                                  ) : (
                                    <Text style={styles.choiceText}>
                                      {choice.choiceText}
                                    </Text>
                                  )}
                                </View>
                                {selectedAnswers.get(q.questionId) ===
                                  choice.choiceId && (
                                  <Text style={styles.checkmark}>✓</Text>
                                )}
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <Text style={styles.noChoicesText}>Không có đáp án</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              );
            })()}
          </View>
        ) : (
          <View style={styles.noQuestionsContainer}>
            <Text style={styles.noQuestionsText}>
              Không có câu hỏi cho phần thi này
            </Text>
          </View>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonSecondary,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonTextSecondary}>← Câu trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setShowNavigator(true)}
          >
            <Text style={styles.navButtonTextPrimary}>
              📋 {uniqueQuestions.filter((q) => hasQuestionAnswer(q)).length}/
              {uniqueQuestions.length}
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.navButtonTextPrimary}>Tiếp →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonSubmit]}
              onPress={handleNextSection}
            >
              <Text style={styles.navButtonTextPrimary}>
                {currentSectionIndex < sections.length - 1
                  ? `→ ${getSectionName(sections[currentSectionIndex + 1].sectionType)}`
                  : 'Nộp bài'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Question Navigator Modal */}
      <Modal
        visible={showNavigator}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNavigator(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.navigatorModal}>
            <View style={styles.navigatorHeader}>
              <Text style={styles.navigatorTitle}>Danh sách câu hỏi</Text>
              <TouchableOpacity onPress={() => setShowNavigator(false)}>
                <Text style={styles.navigatorClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.navigatorGrid}>
              {uniqueQuestions.map((q) => {
                const questionIndex = questions.findIndex(
                  (quest) => quest.questionId === q.questionId
                );
                const isActive = currentQuestion?.questionNumber === q.questionNumber;
                const hasAnswer = hasQuestionAnswer(q);

                return (
                  <TouchableOpacity
                    key={q.questionId}
                    style={[
                      styles.navigatorButton,
                      isActive && styles.navigatorButtonActive,
                      hasAnswer && !isActive && styles.navigatorButtonAnswered,
                    ]}
                    onPress={() => {
                      setCurrentQuestionIndex(questionIndex);
                      setShowNavigator(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.navigatorButtonText,
                        (isActive || hasAnswer) && styles.navigatorButtonTextActive,
                      ]}
                    >
                      {q.questionNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.navigatorLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: '#E8F5E9' }]}
                />
                <Text style={styles.legendText}>Đã trả lời</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: '#FFE8DC' }]}
                />
                <Text style={styles.legendText}>Chưa trả lời</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  questionBadge: {
    fontSize: 12,
    color: '#666',
  },
  timerBadge: {
    backgroundColor: '#FFE8DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerBadgeWarning: {
    backgroundColor: '#FFEBEE',
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  timerTextWarning: {
    color: '#FF5252',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#FFE8DC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionAudioCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1976D2',
    marginBottom: 20,
  },
  sectionAudioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionAudioIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  sectionAudioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  sectionAudioButtons: {
    marginBottom: 12,
  },
  sectionAudioButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  sectionAudioButtonPlaying: {
    backgroundColor: '#F57C00',
  },
  sectionAudioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionAudioNote: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  questionContainer: {
    flex: 1,
  },
  audioCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90CAF9',
    marginBottom: 16,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  audioButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioButtonPlaying: {
    backgroundColor: '#F57C00',
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  audioCardSmall: {
    marginBottom: 12,
  },
  audioButtonSmall: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonTextSmall: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  imageCardSmall: {
    marginBottom: 12,
  },
  questionImageSmall: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  passageCard: {
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE8DC',
    marginBottom: 16,
  },
  passageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionCardBorder: {
    borderTopWidth: 2,
    borderTopColor: '#FFE8DC',
    paddingTop: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  answersContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  choiceButtonWithImage: {
    minHeight: 120,
    alignItems: 'flex-start',
  },
  choiceButtonSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFE8DC',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  choiceLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  choiceLabelSelected: {
    backgroundColor: '#FF6B35',
  },
  choiceLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  choiceLabelTextSelected: {
    color: '#FFFFFF',
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  choiceImage: {
    flex: 1,
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginLeft: 8,
  },
  checkmark: {
    fontSize: 20,
    color: '#FF6B35',
    marginLeft: 8,
  },
  textAnswerContainer: {
    gap: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },
  textInputEssay: {
    minHeight: 200,
  },
  textAnswerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  savingText: {
    fontSize: 12,
    color: '#FF6B35',
  },
  noChoicesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 24,
  },
  noQuestionsContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
  },
  bottomNav: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 90,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#FF6B35',
  },
  navButtonSecondary: {
    backgroundColor: '#FFE8DC',
  },
  navButtonSubmit: {
    backgroundColor: '#4CAF50',
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  navButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextSecondary: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  navigatorModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  navigatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navigatorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  navigatorClose: {
    fontSize: 24,
    color: '#666',
  },
  navigatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  navigatorButton: {
    width: (width - 64 - 48) / 5,
    aspectRatio: 1,
    backgroundColor: '#FFE8DC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigatorButtonActive: {
    backgroundColor: '#FF6B35',
  },
  navigatorButtonAnswered: {
    backgroundColor: '#E8F5E9',
  },
  navigatorButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  navigatorButtonTextActive: {
    color: '#fff',
  },
  navigatorLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ExamAttemptScreen;
