import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LessonNode = ({ lesson, onPress, isFirst }) => {
  const getNodeStyle = () => {
    switch (lesson.status) {
      case 'completed':
        return styles.nodeCompleted;
      case 'current':
        return styles.nodeCurrent;
      default:
        return styles.nodeLocked;
    }
  };

  const getIconStyle = () => {
    if (lesson.status === 'locked') {
      return styles.iconLocked;
    }
    return {};
  };

  return (
    <View style={[styles.container, isFirst && styles.firstNode]}>
      <TouchableOpacity
        style={[styles.node, getNodeStyle()]}
        onPress={onPress}
        disabled={lesson.status === 'locked'}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, getIconStyle()]}>{lesson.icon}</Text>
        </View>

        {/* Progress ring for current lesson */}
        {lesson.status === 'current' && (
          <View style={styles.progressRing}>
            <View style={styles.progressRingInner} />
          </View>
        )}

        {/* Checkmark for completed */}
        {lesson.status === 'completed' && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}

        {/* Lock icon for locked */}
        {lesson.status === 'locked' && (
          <View style={styles.lockIcon}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Lesson title */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            lesson.status === 'locked' && styles.labelLocked,
          ]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
        {lesson.type === 'test' && (
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>TEST</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  firstNode: {
    marginTop: 40,
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nodeCompleted: {
    backgroundColor: '#10B981',
  },
  nodeCurrent: {
    backgroundColor: '#FF6B35',
  },
  nodeLocked: {
    backgroundColor: '#D1D5DB',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
  },
  iconLocked: {
    opacity: 0.5,
  },
  progressRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  checkmark: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  checkmarkText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  lockText: {
    fontSize: 14,
  },
  labelContainer: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  labelLocked: {
    color: '#9CA3AF',
  },
  testBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  testBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LessonNode;
