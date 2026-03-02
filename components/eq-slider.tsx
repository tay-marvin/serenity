import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
} from 'react-native';

const SLIDER_HEIGHT = 130;
const SLIDER_WIDTH = 28;
const THUMB_SIZE = 16;

interface EQSliderProps {
  label: string;
  value: number; // 0-100
  accentColor: string;
  onChange: (value: number) => void;
}

export function EQSlider({ label, value, accentColor, onChange }: EQSliderProps) {
  const fillHeight = (value / 100) * SLIDER_HEIGHT;
  const startYRef = useRef(0);
  const startValueRef = useRef(value);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        startYRef.current = g.y0;
        startValueRef.current = value;
      },
      onPanResponderMove: (_, g) => {
        const dy = g.moveY - startYRef.current;
        const delta = -(dy / SLIDER_HEIGHT) * 100;
        const newVal = Math.min(100, Math.max(0, startValueRef.current + delta));
        onChange(Math.round(newVal));
      },
    })
  ).current;

  const isActive = value > 5;

  return (
    <View style={styles.container}>
      {/* Track */}
      <View style={styles.track} {...panResponder.panHandlers}>
        {/* Subtle mid-line */}
        <View style={styles.midLine} />

        {/* Fill */}
        <View
          style={[
            styles.fill,
            {
              height: fillHeight,
              backgroundColor: accentColor,
              opacity: 0.15 + (value / 100) * 0.7,
            },
          ]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              bottom: fillHeight - THUMB_SIZE / 2,
              backgroundColor: isActive ? '#FFFFFF' : '#1A1A1A',
              shadowColor: isActive ? accentColor : 'transparent',
              shadowOpacity: isActive ? 0.6 : 0,
            },
          ]}
        />
      </View>

      {/* Label */}
      <Text style={[styles.label, isActive && { color: '#444444' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  track: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: '#0D0D0D',
    borderRadius: SLIDER_WIDTH / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1A1A1A',
  },
  midLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: SLIDER_HEIGHT / 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1E1E1E',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: SLIDER_WIDTH / 2,
  },
  thumb: {
    position: 'absolute',
    left: (SLIDER_WIDTH - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '400',
    color: '#222222',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
