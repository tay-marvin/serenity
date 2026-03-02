import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import * as Haptics from 'expo-haptics';

const TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90];
const BELL_OPTIONS = [5, 10, 15, 20, 30];

interface TimerSheetProps {
  visible: boolean;
  onClose: () => void;
  accentColor: string;
}

export function TimerSheet({ visible, onClose, accentColor }: TimerSheetProps) {
  const { startTimer, cancelTimer, timerEndTime, bellEnabled, bellIntervalMinutes, setBell } = useAudioEngine();
  const insets = useSafeAreaInsets();

  const [selectedTimer, setSelectedTimer] = useState<number>(30);
  const [fadeOut, setFadeOut] = useState(true);
  const [localBellEnabled, setLocalBellEnabled] = useState(bellEnabled);
  const [selectedBell, setSelectedBell] = useState(bellIntervalMinutes ?? 10);

  const hasActiveTimer = timerEndTime !== null;

  const handleStart = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    startTimer(selectedTimer, fadeOut);
    setBell(localBellEnabled, selectedBell);
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
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.content}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>sleep timer</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>done</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Timer duration */}
            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.optionsGrid}>
              {TIMER_OPTIONS.map(min => (
                <Pressable
                  key={min}
                  onPress={() => setSelectedTimer(min)}
                  style={[
                    styles.optionChip,
                    selectedTimer === min && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    selectedTimer === min && styles.optionTextActive,
                  ]}>
                    {min < 60 ? `${min}m` : `${min / 60}h`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Fade out toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Fade Out</Text>
                <Text style={styles.toggleDesc}>Gradually reduce volume before stopping</Text>
              </View>
              <Switch
                value={fadeOut}
                onValueChange={setFadeOut}
                trackColor={{ false: '#333', true: accentColor }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Meditation bell */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Meditation Bell</Text>
                <Text style={styles.toggleDesc}>Gentle chime at intervals</Text>
              </View>
              <Switch
                value={localBellEnabled}
                onValueChange={setLocalBellEnabled}
                trackColor={{ false: '#333', true: accentColor }}
                thumbColor="#FFFFFF"
              />
            </View>

            {localBellEnabled && (
              <>
                <Text style={styles.sectionLabel}>Bell Interval</Text>
                <View style={styles.optionsRow}>
                  {BELL_OPTIONS.map(min => (
                    <Pressable
                      key={min}
                      onPress={() => setSelectedBell(min)}
                      style={[
                        styles.optionChip,
                        selectedBell === min && { backgroundColor: accentColor, borderColor: accentColor },
                      ]}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedBell === min && styles.optionTextActive,
                      ]}>
                        {min}m
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {hasActiveTimer && (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.cancelText}>Cancel Timer</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: accentColor },
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.startText}>
                {hasActiveTimer ? 'Restart Timer' : 'Start Timer'}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#0A0A0A',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#1A1A1A',
    maxHeight: '80%',
  },
  content: {
    padding: 24,
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#F5F5F0',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#444444',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3A3A3A',
    letterSpacing: 0.3,
  },
  optionTextActive: {
    color: '#F5F5F0',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '300',
    color: '#F5F5F0',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#333333',
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3A3A3A',
    letterSpacing: 0.3,
  },
  startButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  startText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.3,
  },
});
