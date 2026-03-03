import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import * as Haptics from 'expo-haptics';

const TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90];

interface TimerSheetProps {
  visible: boolean;
  onClose: () => void;
  accentColor: string;
}

export function TimerSheet({ visible, onClose, accentColor }: TimerSheetProps) {
  const { startTimer, cancelTimer, timerEndTime } = useAudioEngine();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#0A0A0A' : '#FAFAFA';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const mutedColor = isDark ? '#888888' : '#666666';
  const borderColor = isDark ? '#222222' : '#E0E0E0';

  const [selectedTimer, setSelectedTimer] = useState<number>(30);
  const [fadeOut, setFadeOut] = useState(true);

  const hasActiveTimer = timerEndTime !== null;

  const handleStart = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    startTimer(selectedTimer, fadeOut);
    onClose();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    cancelTimer();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: bg, borderTopColor: borderColor, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.content}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: borderColor }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor, fontFamily: 'PlayfairDisplay-Regular' }]}>
              Sleep Timer
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close timer sheet"
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}
            >
              <Text style={[styles.closeBtnText, { color: mutedColor }]}>DONE</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Timer duration */}
            <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.sectionLabel, { color: mutedColor }]}>DURATION</Text>
            </View>
            <View style={styles.optionsGrid}>
              {TIMER_OPTIONS.map(min => {
                const isSelected = selectedTimer === min;
                return (
                  <Pressable
                    key={min}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTimer(min);
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={`${min < 60 ? `${min} minutes` : `${min / 60} hour${min > 60 ? 's' : ''}`}`}
                    accessibilityState={{ checked: isSelected }}
                    style={({ pressed }) => [
                      styles.optionChip,
                      { borderColor: isSelected ? textColor : borderColor },
                      isSelected && { backgroundColor: textColor },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: isSelected ? bg : textColor },
                    ]}>
                      {min < 60 ? `${min}m` : `${min / 60}h`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Fade out toggle */}
            <View style={[styles.toggleRow, { borderBottomColor: borderColor }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: textColor }]}>Fade Out</Text>
                <Text style={[styles.toggleDesc, { color: mutedColor }]}>
                  Gradually reduce volume before stopping
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setFadeOut(v => !v);
                }}
                accessibilityRole="switch"
                accessibilityLabel={fadeOut ? 'Fade out enabled' : 'Fade out disabled'}
                accessibilityState={{ checked: fadeOut }}
                style={({ pressed }) => [
                  styles.toggleBtn,
                  { borderColor: fadeOut ? textColor : borderColor },
                  fadeOut && { backgroundColor: textColor },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.toggleBtnText, { color: fadeOut ? bg : textColor }]}>
                  {fadeOut ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: borderColor }]}>
            {hasActiveTimer && (
              <Pressable
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel="Cancel active timer"
                style={({ pressed }) => [
                  styles.cancelButton,
                  { borderColor },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.cancelText, { color: mutedColor }]}>CANCEL</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityLabel={hasActiveTimer ? 'Restart timer' : 'Start timer'}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: textColor },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.startText, { color: bg }]}>
                {hasActiveTimer ? 'RESTART' : 'START'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: '80%',
  },
  content: {
    padding: 24,
  },
  handle: {
    width: 32,
    height: 1,
    alignSelf: 'center',
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingLeft: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 14,
  },
  sectionHeader: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  toggleInfo: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  toggleDesc: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 14,
  },
  startButton: {
    flex: 2,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  startText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 14,
  },
});
