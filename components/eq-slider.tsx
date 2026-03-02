import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SLIDER_HEIGHT = 160;
const SLIDER_WIDTH = 28;
const THUMB_SIZE = 24;

interface EQSliderProps {
  label: string;
  value: number; // 0-100
  accentColor: string;
  onChange: (value: number) => void;
}

export function EQSlider({ label, value, accentColor, onChange }: EQSliderProps) {
  const fillHeight = (value / 100) * SLIDER_HEIGHT;
  const thumbPosition = SLIDER_HEIGHT - fillHeight - THUMB_SIZE / 2;

  const panRef = useRef<PanResponder | null>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(value);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        startYRef.current = gestureState.y0;
        startValueRef.current = value;
      },
      onPanResponderMove: (_, gestureState) => {
        const dy = gestureState.moveY - startYRef.current;
        const delta = -(dy / SLIDER_HEIGHT) * 100;
        const newValue = Math.min(100, Math.max(0, startValueRef.current + delta));
        onChange(Math.round(newValue));
      },
    })
  ).current;

  // Interpolate color from teal (low) to violet (high)
  const fillOpacity = 0.3 + (value / 100) * 0.7;

  return (
    <View style={styles.container}>
      {/* Track background */}
      <View style={styles.track} {...panResponder.panHandlers}>
        {/* Fill */}
        <View
          style={[
            styles.fill,
            {
              height: fillHeight,
              bottom: 0,
              backgroundColor: accentColor,
              opacity: fillOpacity,
            },
          ]}
        />

        {/* Glow at top of fill */}
        {value > 5 && (
          <View
            style={[
              styles.glow,
              {
                bottom: fillHeight - 4,
                backgroundColor: accentColor,
                shadowColor: accentColor,
              },
            ]}
          />
        )}

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              bottom: fillHeight - THUMB_SIZE / 2,
              backgroundColor: '#FFFFFF',
              shadowColor: accentColor,
            },
          ]}
        />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value */}
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  track: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: SLIDER_WIDTH / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: SLIDER_WIDTH / 2,
  },
  glow: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  thumb: {
    position: 'absolute',
    left: (SLIDER_WIDTH - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 10,
    fontWeight: '700',
  },
});
