import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import các component học tập
import VocabularyTab from './VocabularyTab';
import GrammarTab from './GrammarTab';
import ExerciseTab from './ExerciseTab';

const LessonDetailScreen = ({ route, navigation }) => {
  const { lessonId, lessonTitle } = route.params || {};
  const [activeTab, setActiveTab] = useState('vocabulary');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vocabulary':
        return <VocabularyTab route={{ params: { lessonId } }} />;
      case 'grammar':
        return <GrammarTab route={{ params: { lessonId } }} />;
      case 'exercise':
        return <ExerciseTab route={{ params: { lessonId } }} navigation={navigation} />;
      default:
        return <VocabularyTab route={{ params: { lessonId } }} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
        
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lessonTitle || 'Lý thuyết'}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'vocabulary' && styles.tabButtonActive]}
          onPress={() => setActiveTab('vocabulary')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'vocabulary' && styles.tabButtonTextActive]}>
            Từ vựng
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'grammar' && styles.tabButtonActive]}
          onPress={() => setActiveTab('grammar')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'grammar' && styles.tabButtonTextActive]}>
            Ngữ pháp
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'exercise' && styles.tabButtonActive]}
          onPress={() => setActiveTab('exercise')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'exercise' && styles.tabButtonTextActive]}>
            Bài tập
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#FF6B35',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#FF6B35',
  },
});

export default LessonDetailScreen;
