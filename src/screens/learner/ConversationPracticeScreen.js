import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import chatService from '../../services/chatService';
import { AuthContext } from '../../contexts/AuthContext';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// Quick phrases theo scenario
const QUICK_PHRASES = {
  introduction: ['안녕하세요!', '처음 뵙겠습니다', '이름이 뭐예요?', '어디서 왔어요?', '반갑습니다'],
  restaurant: ['안녕하세요!', '메뉴 추천해 주세요', '이것은 얼마예요?', '계산해 주세요', '감사합니다'],
  shopping: ['안녕하세요!', '이것 얼마예요?', '더 큰 사이즈 있어요?', '카드로 결제할게요', '감사합니다'],
  direction: ['실례합니다', '지하철역이 어디예요?', '얼마나 걸려요?', '감사합니다', '안녕히 계세요'],
  daily: ['안녕!', '오늘 어때?', '뭐 해?', '날씨 좋다', '나중에 봐']
};

const ConversationPracticeScreen = ({ route, navigation }) => {
  const { topic, level } = route.params;
  const { user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showQuickPhrases, setShowQuickPhrases] = useState(true);
  const flatListRef = useRef(null);
  const lastAutoPlayedMessageId = useRef(null);

  // Level info
  const levelInfo = {
    beginner: { name: 'Sơ cấp', color: '#10B981', instruction: 'Sử dụng câu đơn giản, từ vựng cơ bản' },
    intermediate: { name: 'Trung cấp', color: '#F59E0B', instruction: 'Sử dụng ngữ pháp trung cấp, từ vựng phong phú hơn' },
    advanced: { name: 'Nâng cao', color: '#EF4444', instruction: 'Sử dụng thành ngữ, từ vựng chuyên sâu' },
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Request audio permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền microphone để ghi âm');
      }
    })();
  }, []);

  // Auto-play new AI messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.sender === 'ai' && 
      lastMessage.id !== lastAutoPlayedMessageId.current
    ) {
      lastAutoPlayedMessageId.current = lastMessage.id;
      // Delay để user thấy message trước khi đọc
      setTimeout(() => {
        speakKorean(lastMessage.id, lastMessage.text);
      }, 500);
    }
  }, [messages]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Parse AI message - Backend trả về translation riêng
  const parseAIMessage = (text, translation) => {
    // Nếu có translation từ backend thì dùng luôn
    if (translation) {
      return {
        korean: text.trim(),
        romanization: null,
        vietnamese: translation,
      };
    }
    
    // Fallback: parse theo format cũ (nếu backend chưa có translation)
    const korean = text.trim();
    const romanizationMatch = text.match(/\(([^)]+)\)/);
    const romanization = romanizationMatch ? romanizationMatch[1] : null;
    const vietnameseMatch = text.match(/\[([^\]]+)\]/);
    const vietnamese = vietnameseMatch ? vietnameseMatch[1] : null;
    
    let cleanKorean = korean
      .replace(/\([^)]+\)/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .trim();
    
    return {
      korean: cleanKorean,
      romanization,
      vietnamese,
    };
  };

  // Toggle translation visibility
  const toggleTranslation = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Speak Korean text
  const speakKorean = async (messageId, text) => {
    try {
      // Stop any current speech
      await Speech.stop();
      setSpeakingMessageId(messageId);
      
      console.log('🔊 Starting TTS:', text);
      
      // Check available voices
      const voices = await Speech.getAvailableVoicesAsync();
      const koreanVoices = voices.filter(v => v.language.startsWith('ko'));
      console.log('🎤 Korean voices available:', koreanVoices.length, koreanVoices.map(v => v.name));
      
      await Speech.speak(text, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 0.85, // Slower for learning
        onDone: () => {
          console.log('✅ TTS done');
          setSpeakingMessageId(null);
        },
        onStopped: () => {
          console.log('⏹ TTS stopped');
          setSpeakingMessageId(null);
        },
        onError: (error) => {
          console.error('❌ TTS error:', error);
          Alert.alert('Lỗi TTS', 'Không thể phát giọng nói. Thiết bị có thể chưa cài giọng tiếng Hàn.');
          setSpeakingMessageId(null);
        },
      });
    } catch (error) {
      console.error('❌ TTS Error:', error);
      Alert.alert('Lỗi TTS', `Lỗi: ${error.message}`);
      setSpeakingMessageId(null);
    }
  };

  // Toggle speech for a message
  const handleSpeakerPress = async (messageId, text) => {
    if (speakingMessageId === messageId) {
      // Stop if currently speaking this message
      await Speech.stop();
      setSpeakingMessageId(null);
    } else {
      // Speak this message
      await speakKorean(messageId, text);
    }
  };

  // Send quick phrase
  const handleQuickPhrase = async (phrase) => {
    setShowQuickPhrases(false);
    setInputText(phrase);
    // Auto send after a short delay
    setTimeout(() => {
      if (conversationId) {
        handleSendMessageWithText(phrase);
      }
    }, 100);
  };

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    // Note: Speech-to-text would require additional API
    Alert.alert('Ghi âm hoàn tất', 'Tính năng chuyển giọng nói thành text đang phát triển. Vui lòng nhập bằng bàn phím.');
  };

  // Map topic.id (number) to scenario string
  const scenarioMap = {
    1: 'introduction',
    2: 'restaurant',
    3: 'shopping',
    4: 'direction',
    5: 'daily',
    6: 'daily',
    7: 'daily',
    8: 'daily',
    9: 'daily',
    10: 'direction',
    11: 'daily',
    12: 'daily',
  };

  // Start conversation
  const startConversation = async () => {
    setIsStarted(true);
    setIsLoading(true);

    try {
      const scenario = scenarioMap[topic.id] || 'daily';
      const userId = user?.userId || 1; // Fallback to 1 if no user

      console.log('Creating conversation:', { userId, scenario, level });

      // 1. Tạo conversation mới qua backend
      const conversation = await chatService.createConversation(userId, scenario, level);
      console.log('Conversation created:', conversation);
      setConversationId(conversation.conversationId);

      // 2. Gửi tin nhắn đầu tiên để AI bắt đầu
      const responsePair = await chatService.sendMessage(
        conversation.conversationId,
        'Xin chào! Hãy bắt đầu cuộc hội thoại với tôi.'
      );
      console.log('AI response received:', responsePair);

      // 3. Hiển thị tin nhắn AI
      const aiMessage = {
        id: responsePair.aiMessage.messageId.toString(),
        text: responsePair.aiMessage.content,
        translation: responsePair.aiMessage.translation,
        sender: 'ai',
        timestamp: new Date(responsePair.aiMessage.timestamp),
      };

      setMessages([aiMessage]);
    } catch (error) {
      console.error('Start conversation error:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert(
        'Lỗi kết nối Backend', 
        `Không thể bắt đầu hội thoại.\n\nChi tiết: ${error.response?.data?.message || error.message}\n\nVui lòng kiểm tra:\n- Backend có đang chạy không?\n- URL trong config.js đúng chưa?`
      );
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message with text parameter
  const handleSendMessageWithText = async (text) => {
    const messageText = text || inputText.trim();
    if (!messageText || !conversationId) return;

    // Stop any current speech
    await Speech.stop();
    setSpeakingMessageId(null);

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowQuickPhrases(false);
    setIsLoading(true);

    try {
      console.log('Sending message to backend:', { conversationId, text: userMessage.text });
      
      // Gọi backend để gửi tin nhắn
      const responsePair = await chatService.sendMessage(
        conversationId,
        userMessage.text
      );
      
      console.log('Received response from backend:', responsePair);

      // Hiển thị tin nhắn AI với translation
      const aiMessage = {
        id: responsePair.aiMessage.messageId.toString(),
        text: responsePair.aiMessage.content,
        translation: responsePair.aiMessage.translation,
        sender: 'ai',
        timestamp: new Date(responsePair.aiMessage.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert(
        'Lỗi gửi tin nhắn', 
        `Không thể gửi tin nhắn.\n\nChi tiết: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Send message (wrapper)
  const handleSendMessage = () => handleSendMessageWithText();

  // Render message item
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isExpanded = expandedMessages[item.id];
    const parsed = !isUser ? parseAIMessage(item.text, item.translation) : null;
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.avatarText}>🇰🇷</Text>
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser ? (
            <>
              <Text style={styles.aiText}>
                {parsed.korean}
              </Text>
              
              {isExpanded && (
                <View style={styles.translationContainer}>
                  {parsed.romanization && (
                    <Text style={styles.romanizationText}>
                      {parsed.romanization}
                    </Text>
                  )}
                  {parsed.vietnamese && (
                    <Text style={styles.vietnameseText}>
                      {parsed.vietnamese}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.aiMessageActions}>
                <TouchableOpacity 
                  style={styles.translateButton}
                  onPress={() => toggleTranslation(item.id)}
                >
                  <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "translate"} 
                    size={16} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.translateButtonText}>
                    {isExpanded ? '숨기기' : '번역'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.speakerButton,
                    speakingMessageId === item.id && styles.speakerButtonActive
                  ]}
                  onPress={() => handleSpeakerPress(item.id, parsed.korean)}
                >
                  <MaterialCommunityIcons 
                    name={speakingMessageId === item.id ? "volume-high" : "volume-medium"} 
                    size={16} 
                    color={speakingMessageId === item.id ? COLORS.success : COLORS.primary} 
                  />
                  <Text style={[
                    styles.speakerButtonText,
                    speakingMessageId === item.id && styles.speakerButtonTextActive
                  ]}>
                    {speakingMessageId === item.id ? '🔊' : '🔈'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.userText}>{item.text}</Text>
          )}
          
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <MaterialCommunityIcons name="account" size={20} color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: topic.color }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.topicIcon}>{topic.icon}</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{topic.title}</Text>
            <Text style={styles.headerSubtitle}>{topic.titleKorean} • {levelInfo[level].name}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => {
            setMessages([]);
            setIsStarted(false);
            setExpandedMessages({});
          }}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Welcome / Messages */}
      {!isStarted ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeIcon}>{topic.icon}</Text>
          <Text style={styles.welcomeTitle}>{topic.title}</Text>
          <Text style={styles.welcomeTitleKorean}>{topic.titleKorean}</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📝 {topic.description}</Text>
            <Text style={styles.infoText}>🎯 Cấp độ: {levelInfo[level].name}</Text>
            <Text style={styles.infoText}>🤖 AI sẽ đóng vai người Hàn Quốc thực sự</Text>
            <Text style={styles.infoText}>🇰🇷 Tin nhắn chỉ hiển thị tiếng Hàn</Text>
            <Text style={styles.infoText}>💬 Nhấn nút "번역" để xem bản dịch</Text>
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: topic.color }]}
            onPress={startConversation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
                <Text style={styles.startButtonText}>Bắt đầu hội thoại</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={topic.color} />
              <Text style={styles.loadingText}>AI đang trả lời...</Text>
            </View>
          )}

          {/* Quick Phrases */}
          {showQuickPhrases && isStarted && (
            <View style={styles.quickPhrasesContainer}>
              <Text style={styles.quickPhrasesTitle}>💬 Gợi ý:</Text>
              <View style={styles.quickPhrasesRow}>
                {(QUICK_PHRASES[scenarioMap[topic.id] || 'daily'] || QUICK_PHRASES.daily).map((phrase, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPhraseButton}
                    onPress={() => handleQuickPhrase(phrase)}
                    disabled={isLoading}
                  >
                    <Text style={styles.quickPhraseText}>{phrase}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardAvoid}
          >
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <MaterialCommunityIcons
                  name={isRecording ? "stop" : "microphone"}
                  size={24}
                  color={isRecording ? "#FFF" : topic.color}
                />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Nhập câu trả lời bằng tiếng Hàn..."
                placeholderTextColor={COLORS.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading && !isRecording}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: topic.color },
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={24}
                  color={inputText.trim() && !isLoading ? '#FFF' : COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  topicIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  welcomeTitleKorean: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    fontWeight: '500',
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFF',
  },
  translationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  romanizationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  vietnameseText: {
    fontSize: 14,
    color: COLORS.text,
  },
  aiMessageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  translateButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  speakerButtonActive: {
    backgroundColor: COLORS.success + '20',
  },
  speakerButtonText: {
    fontSize: 10,
  },
  speakerButtonTextActive: {
    color: COLORS.success,
  },
  quickPhrasesContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickPhrasesTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  quickPhrasesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPhraseButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPhraseText: {
    fontSize: 13,
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  keyboardAvoid: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
});

export default ConversationPracticeScreen;
