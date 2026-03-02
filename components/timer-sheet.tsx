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
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.content}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <IconSymbol name="timer" size={20} color={accentColor} />
            <Text style={styles.title}>Sleep Timer</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={18} color="rgba(255,255,255,0.5)" />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(12,12,20,0.95)',
    maxHeight: '80%',
  },
  content: {
    padding: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#F0F0FF',
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0F0FF',
  },
  toggleDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  startButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
