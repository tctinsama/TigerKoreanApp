import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatBotBubble = ({ onPress }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT - 200 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tooltipOpacity = useRef(new Animated.Value(1)).current;

  // Pan responder for draggable bubble
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        // Snap to edges
        const toValue = { x: pan.x._value, y: pan.y._value };
        
        if (pan.x._value < SCREEN_WIDTH / 2) {
          toValue.x = 20;
        } else {
          toValue.x = SCREEN_WIDTH - 80;
        }
        
        // Keep within screen bounds
        if (toValue.y < 60) toValue.y = 60;
        if (toValue.y > SCREEN_HEIGHT - 120) toValue.y = SCREEN_HEIGHT - 120;
        
        Animated.parallel([
          Animated.spring(pan, {
            toValue,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();

        // If it's a tap (not a drag), open chat
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onPress();
        }
      },
    })
  ).current;

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Hide tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowTooltip(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Tooltip */}
      {showTooltip && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: tooltipOpacity,
              transform: [
                { translateX: pan.x },
                { translateY: Animated.add(pan.y, -60) },
              ],
            },
          ]}
        >
          <Text style={styles.tooltipText}>Nhấn để chat với AI! 🤖</Text>
        </Animated.View>
      )}

      {/* Bubble */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.bubble,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        
        <View style={styles.bubbleContent}>
          <MaterialCommunityIcons name="robot" size={32} color="#FFF" />
        </View>

        {/* Badge notification */}
        <View style={styles.badge}>
          <MaterialCommunityIcons name="chat" size={12} color="#FFF" />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 1000,
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  bubbleContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChatBotBubble;
