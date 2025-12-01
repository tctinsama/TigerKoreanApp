import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Video, Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MultipleChoiceQuestion = ({ question, onNext }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleCheck = () => {
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setIsChecked(true);
  };

  const handleNext = () => {
    if (onNext) onNext(Boolean(isCorrect));
    setIsChecked(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
  };

  const handleSkip = () => {
    if (onNext) onNext(false);
    setIsChecked(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
  };

  const isAudioFile = question.linkMedia && question.linkMedia.match(/\.(mp3|m4a|ogg)$/i);
  const isVideoFile = question.linkMedia && question.linkMedia.match(/\.(mp4|mov|avi)$/i);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        <Text style={styles.questionText}>{question.questionText}</Text>

        {/* Media Player */}
        {question.linkMedia && (
          <View style={styles.mediaContainer}>
            {isAudioFile && (
              <Video
                source={{ uri: question.linkMedia }}
                style={styles.audioPlayer}
                useNativeControls
                resizeMode="contain"
              />
            )}
            {isVideoFile && (
              <Video
                source={{ uri: question.linkMedia }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode="contain"
              />
            )}
          </View>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            const optionKey = `option${opt}`;
            const optionText = question[optionKey];
            
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionButton,
                  selectedAnswer === opt && styles.optionButtonSelected,
                  isChecked && selectedAnswer === opt && isCorrect && styles.optionButtonCorrect,
                  isChecked && selectedAnswer === opt && !isCorrect && styles.optionButtonWrong,
                ]}
                onPress={() => !isChecked && setSelectedAnswer(opt)}
                disabled={isChecked}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === opt && styles.optionTextSelected,
                ]}>
                  <Text style={styles.optionLabel}>{opt}.</Text> {optionText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        {!isChecked ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Bỏ qua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.checkButton,
                !selectedAnswer && styles.checkButtonDisabled,
              ]}
              onPress={handleCheck}
              disabled={!selectedAnswer}
            >
              <Text style={styles.checkButtonText}>Kiểm tra</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[
            styles.resultContainer,
            isCorrect ? styles.resultCorrect : styles.resultWrong,
          ]}>
            <View style={styles.resultContent}>
              <View style={styles.resultIcon}>
                <MaterialCommunityIcons
                  name={isCorrect ? 'check-circle' : 'close-circle'}
                  size={32}
                  color={isCorrect ? '#10B981' : '#EF4444'}
                />
              </View>
              <View style={styles.resultTextContainer}>
                <Text style={[
                  styles.resultTitle,
                  isCorrect ? styles.resultTitleCorrect : styles.resultTitleWrong,
                ]}>
                  {isCorrect ? 'Tuyệt vời!' : 'Đáp án đúng:'}
                </Text>
                {!isCorrect && (
                  <Text style={styles.resultAnswer}>
                    {question[`option${question.correctAnswer}`]}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                isCorrect ? styles.continueButtonCorrect : styles.continueButtonWrong,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Thêm padding để không bị che bởi tab bar
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 26,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  audioPlayer: {
    width: '100%',
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionButtonWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  optionLabel: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  resultCorrect: {
    backgroundColor: '#D1FAE5',
  },
  resultWrong: {
    backgroundColor: '#FEE2E2',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultTitleCorrect: {
    color: '#065F46',
  },
  resultTitleWrong: {
    color: '#991B1B',
  },
  resultAnswer: {
    fontSize: 14,
    color: '#7F1D1D',
    fontStyle: 'italic',
  },
  continueButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonCorrect: {
    backgroundColor: '#10B981',
  },
  continueButtonWrong: {
    backgroundColor: '#EF4444',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default MultipleChoiceQuestion;
