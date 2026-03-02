import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
} from 'react-native';

const SLIDER_HEIGHT = 150;
const SLIDER_WIDTH = 32;
const THUMB_SIZE = 20;

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

  // Opacity scales with value for a subtle breathing effect
  const fillOpacity = 0.25 + (value / 100) * 0.75;

  return (
    <View style={styles.container}>
      {/* Track */}
      <View style={styles.track} {...panResponder.panHandlers}>
        {/* Track background lines (subtle grid) */}
        {[25, 50, 75].map(pct => (
          <View
            key={pct}
            style={[styles.gridLine, { bottom: (pct / 100) * SLIDER_HEIGHT }]}
          />
        ))}

        {/* Fill */}
        <View
          style={[
            styles.fill,
            {
              height: fillHeight,
              backgroundColor: accentColor,
              opacity: fillOpacity,
            },
          ]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              bottom: fillHeight - THUMB_SIZE / 2,
              backgroundColor: value > 5 ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
              shadowColor: accentColor,
              shadowOpacity: value > 5 ? 0.5 : 0,
            },
          ]}
        />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value */}
      <Text style={[styles.value, { color: value > 5 ? accentColor : 'rgba(255,255,255,0.2)' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  track: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SLIDER_WIDTH / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
