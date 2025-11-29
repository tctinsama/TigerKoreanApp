import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const LessonCard = ({ title, level, progress, onPress }) => (
  <TouchableOpacity style={styles.lessonCard} onPress={onPress}>
    <View style={styles.lessonHeader}>
      <Text style={styles.lessonTitle}>{title}</Text>
      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
    </View>
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  </TouchableOpacity>
);

const getLevelColor = (level) => {
  const colors = {
    'Beginner': '#4CAF50',
    'Elementary': '#2196F3',
    'Intermediate': '#FF9800',
    'Advanced': '#F44336',
  };
  return colors[level] || '#999';
};

const CategoryCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <Text style={styles.categoryIcon}>{icon}</Text>
    <Text style={styles.categoryTitle}>{title}</Text>
    <Text style={styles.categorySubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export { LessonCard, CategoryCard };

const styles = StyleSheet.create({
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 35,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 160,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
