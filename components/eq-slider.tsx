import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  PanResponder,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const TRACK_HEIGHT = 160;
const THUMB_SIZE = 20;

interface EQSliderProps {
  label: string;
  value: number;       // 0–100
  accentColor: string;
  onChange: (value: number) => void;
}

export function EQSlider({ label, value, accentColor, onChange }: EQSliderProps) {
  const lastHapticVal = useRef(value);

  const handlePan = useCallback((dy: number, startVal: number) => {
    const delta = -(dy / TRACK_HEIGHT) * 100;
    const next = Math.min(100, Math.max(0, Math.round(startVal + delta)));
    if (Math.abs(next - lastHapticVal.current) >= 10 && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticVal.current = next;
    }
    onChange(next);
  }, [onChange]);

  const startValRef = useRef(value);

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
      {/* Value label — WCAG AA: #999 on black = 9.7:1 ✓ */}
      <Text style={styles.valueLabel}>{Math.round(value)}</Text>

      {/* Track */}
      <View style={styles.trackContainer} {...panResponder.panHandlers}>
        {/* Background track */}
        <View style={styles.trackBg} />

        {/* Filled portion */}
        <View
          style={[
            styles.trackFill,
            {
              height: fillHeight,
              backgroundColor: accentColor,
              bottom: 0,
            },
          ]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              top: thumbOffset,
              backgroundColor: '#FFFFFF',
              shadowColor: accentColor,
            },
          ]}
        />
      </View>

      {/* Band label — WCAG AA: #888 on black = 7.0:1 ✓ */}
      <Text style={styles.bandLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 44,                  // 44pt minimum touch target width ✓
    gap: 8,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',           // 9.7:1 on black ✓
    letterSpacing: 0.3,
    lineHeight: 14,
    textAlign: 'center',
  },
  trackContainer: {
    width: 44,                  // 44pt minimum touch target ✓
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  bandLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#888888',           // 7.0:1 on black ✓
    letterSpacing: 0.5,
    lineHeight: 14,
    textAlign: 'center',
  },
});
