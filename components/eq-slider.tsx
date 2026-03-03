import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeContext } from '@/lib/theme-provider';

const TRACK_HEIGHT = 160;
const THUMB_SIZE = 14;

export interface EQSliderProps {
  label: string;
  value: number;       // 0–100
  accentColor: string;
  onChange: (value: number) => void;
}

export function EQSlider({ label, value, accentColor, onChange }: EQSliderProps) {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';
  const trackBgColor = isDark ? '#222222' : '#E0E0E0';
  const textColor = isDark ? '#888888' : '#666666';
  const thumbColor = isDark ? '#FFFFFF' : '#000000';

  const lastHapticVal = useRef(value);
  const startValRef = useRef(value);

  const handlePan = useCallback((dy: number, startVal: number) => {
    const delta = -(dy / TRACK_HEIGHT) * 100;
    const next = Math.min(100, Math.max(0, Math.round(startVal + delta)));
    if (Math.abs(next - lastHapticVal.current) >= 10 && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticVal.current = next;
    }
    onChange(next);
  }, [onChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startValRef.current = value;
      },
      onPanResponderMove: (_, gs) => {
        handlePan(gs.dy, startValRef.current);
      },
    })
  ).current;

  const fillHeight = (value / 100) * TRACK_HEIGHT;
  const thumbOffset = TRACK_HEIGHT - fillHeight - THUMB_SIZE / 2;

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="adjustable"
      accessibilityLabel={`${label} level`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      accessibilityHint="Drag up or down to adjust"
    >
      {/* Value */}
      <Text style={[styles.valueLabel, { color: textColor }]}>{Math.round(value)}</Text>

      {/* Track */}
      <View style={styles.trackContainer} {...panResponder.panHandlers}>
        <View style={[styles.trackBg, { backgroundColor: trackBgColor }]} />
        <View
          style={[
            styles.trackFill,
            { height: fillHeight, backgroundColor: accentColor, bottom: 0 },
          ]}
        />
        <View
          style={[
            styles.thumb,
            { top: thumbOffset, backgroundColor: thumbColor },
          ]}
        />
      </View>

      {/* Band label */}
      <Text style={[styles.bandLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 44,
    gap: 8,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 14,
    textAlign: 'center',
  },
  trackContainer: {
    width: 44,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderRadius: 1,
  },
  trackFill: {
    position: 'absolute',
    width: 1,
    borderRadius: 1,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  bandLabel: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
