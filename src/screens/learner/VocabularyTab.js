import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import vocabularyService from '../../services/vocabularyService';

const { width } = Dimensions.get('window');

const VocabularyTab = ({ route }) => {
  const { lessonId } = route.params || {};
  const [vocabularies, setVocabularies] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVocabularies();
  }, [lessonId]);

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      
      // Gọi API lấy từ vựng theo lessonId
      const data = await vocabularyService.getVocabularyByLessonId(lessonId);
      
      // Transform data từ API về format phù hợp với app
      const transformedData = data.map((item) => ({
        vocabId: item.id || item.vocabId,
        word: item.word || item.term,
        pronunciation: item.pronunciation || '',
        meaning: item.meaning,
        example: item.example || '',
        exampleMeaning: item.exampleMeaning || '',
        image: item.image || '', // Link ảnh từ Cloudinary
      }));

      setVocabularies(transformedData);
    } catch (error) {
      console.error('Load vocabularies error:', error);
      Alert.alert('Lỗi', 'Không thể tải từ vựng. Vui lòng thử lại.');
      
      // Fallback: Sử dụng mock data nếu API lỗi
      const mockData = [
        {
          vocabId: 1,
          word: '깜빡하다',
          pronunciation: 'kkam-ppa-ka-da',
          meaning: '(động từ) quên mất',
          example: '약속을 깜빡했어요.',
          exampleMeaning: 'Tôi đã quên mất lời hẹn.',
          image: '',
        },
        {
          vocabId: 2,
          word: '감자기',
          pronunciation: 'gap-ja-gi',
          meaning: '(phó từ) đột ngột, bất thình lình, bỗng nhiên',
          example: '감자기 비가 왔어요.',
          exampleMeaning: 'Trời đột nhiên mưa.',
          image: '',
        },
        {
          vocabId: 3,
          word: '반복하다',
          pronunciation: 'ban-bo-ka-da',
          meaning: '(động từ) lặp lại',
          example: '같은 실수를 반복하다.',
          exampleMeaning: 'Lặp lại cùng một lỗi.',
          image: '',
        },
      ];
      setVocabularies(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const goToNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % vocabularies.length);
  };

  const goToPreviousCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? vocabularies.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải từ vựng...</Text>
      </View>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📚</Text>
        <Text style={styles.emptyTitle}>Chưa có từ vựng</Text>
      </View>
    );
  }

  const currentVocab = vocabularies[currentCardIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Flashcard */}
      <View style={styles.flashcardContainer}>
        <TouchableOpacity 
          style={styles.flashcard}
          onPress={handleFlip}
          activeOpacity={0.9}
        >
          {!isFlipped ? (
            // Front: Word
            <View style={styles.cardFront}>
              {currentVocab.image ? (
                <View style={styles.cardWithImage}>
                  <View style={styles.wordSection}>
                    <Text style={styles.wordText}>{currentVocab.word}</Text>
                    <Text style={styles.pronunciationText}>{currentVocab.pronunciation}</Text>
                  </View>
                  <Image
                    source={{ uri: currentVocab.image }}
                    style={styles.vocabImage}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.cardNoImage}>
                  <Text style={styles.wordText}>{currentVocab.word}</Text>
                  <Text style={styles.pronunciationText}>{currentVocab.pronunciation}</Text>
                </View>
              )}
              <View style={styles.flipHint}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={20} color="#999" />
                <Text style={styles.flipHintText}>Nhấn để xem nghĩa</Text>
              </View>
            </View>
          ) : (
            // Back: Meaning
            <View style={styles.cardBack}>
              <Text style={styles.meaningText}>{currentVocab.meaning}</Text>
              {currentVocab.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Ví dụ:</Text>
                  <Text style={styles.exampleText}>{currentVocab.example}</Text>
                  <Text style={styles.exampleMeaningText}>{currentVocab.exampleMeaning}</Text>
                </View>
              )}
              <View style={styles.flipHint}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={20} color="#999" />
                <Text style={styles.flipHintText}>Nhấn để xem từ</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Card Counter */}
        <Text style={styles.cardCounter}>
          {currentCardIndex + 1} / {vocabularies.length}
        </Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={goToPreviousCard}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color="#FF6B35" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.soundButton}
          onPress={() => Alert.alert('Phát âm', 'Tính năng đang phát triển')}
        >
          <MaterialCommunityIcons name="volume-high" size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={goToNextCard}
        >
          <MaterialCommunityIcons name="chevron-right" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Vocabulary List */}
      <View style={styles.vocabList}>
        <Text style={styles.listTitle}>Danh sách từ vựng ({vocabularies.length})</Text>
        {vocabularies.map((vocab, index) => (
          <TouchableOpacity 
            key={vocab.vocabId}
            style={[
              styles.vocabItem,
              index === currentCardIndex && styles.vocabItemActive
            ]}
            onPress={() => {
              setCurrentCardIndex(index);
              setIsFlipped(false);
            }}
          >
            <View style={styles.vocabItemLeft}>
              <Text style={styles.vocabWord}>{vocab.word}</Text>
              <Text style={styles.vocabMeaning}>{vocab.meaning}</Text>
            </View>
            <MaterialCommunityIcons 
              name="volume-high" 
              size={24} 
              color="#999" 
            />
          </TouchableOpacity>
        ))}
      </View>
      
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  flashcardContainer: {
    marginBottom: 24,
  },
  flashcard: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardFront: {
    alignItems: 'center',
    width: '100%',
  },
  cardWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  wordSection: {
    flex: 1,
    alignItems: 'center',
  },
  cardNoImage: {
    alignItems: 'center',
    width: '100%',
  },
  vocabImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardBack: {
    alignItems: 'center',
  },
  wordText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pronunciationText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  meaningText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 24,
    textAlign: 'center',
  },
  exampleContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  exampleMeaningText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  flipHintText: {
    fontSize: 14,
    color: '#999',
  },
  cardCounter: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  vocabList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  vocabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  vocabItemActive: {
    backgroundColor: '#FFE8DC',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  vocabItemLeft: {
    flex: 1,
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vocabMeaning: {
    fontSize: 14,
    color: '#666',
  },
});

export default VocabularyTab;
