import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SentenceRewritingQuestion = ({ question, onNext }) => {
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const checkAnswer = () => {
    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = question.rewrittenSentence.trim().toLowerCase();
    const isOk = userAnswer === correctAnswer;
    
    setIsCorrect(isOk);
    setIsChecked(true);
  };

  const handleNext = () => {
    if (onNext) onNext(Boolean(isCorrect));
    setIsChecked(false);
    setIsCorrect(null);
    setUserInput('');
  };

  const handleMicClick = () => {
    Alert.alert(
      'Nhận dạng giọng nói',
      'Tính năng nhận dạng giọng nói đang được phát triển. Vui lòng nhập bằng bàn phím.',
      [{ text: 'OK' }]
    );
  };

  const isAudioFile = question.linkMedia && question.linkMedia.match(/\.(mp3|m4a|ogg)$/i);
  const isVideoFile = question.linkMedia && question.linkMedia.match(/\.(mp4|mov|avi)$/i);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="pencil" size={24} color="#3B82F6" />
          <Text style={styles.title}>Viết lại câu</Text>
        </View>

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

        {/* Original Sentence */}
        <View style={styles.originalSentenceContainer}>
          <Text style={styles.originalSentence}>{question.originalSentence}</Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              isChecked && (isCorrect ? styles.inputCorrect : styles.inputWrong),
            ]}
            placeholder="Viết lại câu hoặc sử dụng microphone..."
            value={userInput}
            onChangeText={setUserInput}
            editable={!isChecked}
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.micButton,
              isChecked && styles.micButtonDisabled,
            ]}
            onPress={handleMicClick}
            disabled={isChecked}
          >
            <MaterialCommunityIcons
              name="microphone"
              size={24}
              color={isChecked ? '#D1D5DB' : '#3B82F6'}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {!isChecked ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                userInput.trim() === '' && styles.checkButtonDisabled,
              ]}
              onPress={checkAnswer}
              disabled={userInput.trim() === ''}
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
                  {isCorrect ? 'Chính xác!' : 'Đáp án mẫu:'}
                </Text>
                {!isCorrect && (
                  <Text style={styles.resultAnswer}>
                    {question.rewrittenSentence}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  originalSentenceContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  originalSentence: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    paddingRight: 56,
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  inputWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  micButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  actionButtons: {
    marginTop: 16,
  },
  checkButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultIcon: {
    marginRight: 12,
    marginTop: 2,
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
    lineHeight: 22,
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

export default SentenceRewritingQuestion;
