import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EQSlider } from '@/components/eq-slider';
import { TimerSheet } from '@/components/timer-sheet';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES, EQ_BAND_LABELS } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MixerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    activeSoundscapeId,
    isPlaying,
    levels,
    masterVolume,
    favorites,
    timerEndTime,
    play,
    pause,
    resume,
    setLevel,
    applyPreset,
    setMasterVolume,
    toggleFavorite,
  } = useAudioEngine();

  const [timerSheetVisible, setTimerSheetVisible] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<string | null>(null);

  const soundscape = SOUNDSCAPES.find(s => s.id === id);
  const isActive = activeSoundscapeId === id;
  const isFavorite = favorites.includes(id ?? '');

  useKeepAwake();

  useEffect(() => {
    if (soundscape && !isActive) {
      play(soundscape.id);
    }
  }, [soundscape?.id]);

  useEffect(() => {
    if (!timerEndTime) { setTimerRemaining(null); return; }
    const update = () => {
      const rem = timerEndTime - Date.now();
      if (rem <= 0) { setTimerRemaining(null); return; }
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setTimerRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [timerEndTime]);

  if (!soundscape) {
    return <View style={styles.container}><Text style={{ color: '#fff' }}>Not found</Text></View>;
  }

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive && isPlaying) pause();
    else if (isActive && !isPlaying) resume();
    else play(soundscape.id);
  };

  const currentLevels = isActive ? levels : soundscape.presets[0].levels;
  const accent = soundscape.color;

  return (
    <View style={styles.container}>
      {/* Top navigation bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
        >
          <IconSymbol name="chevron.left" size={22} color="#555555" />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setTimerSheetVisible(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
          >
            {timerRemaining
              ? <Text style={[styles.timerText, { color: accent }]}>{timerRemaining}</Text>
              : <IconSymbol name="timer" size={20} color="#333333" />
            }
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(soundscape.id);
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={[styles.heartBtn, { color: isFavorite ? accent : '#333333' }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large colored sound name — Pillowtalk hero text */}
        <View style={styles.heroBlock}>
          <Text style={styles.categoryLabel}>{soundscape.category}</Text>
          <Text style={[styles.soundName, { color: accent }]}>{soundscape.name}</Text>
          <Text style={styles.soundDesc}>{soundscape.description}</Text>
        </View>

        {/* Play / Pause — minimal circle */}
        <View style={styles.playRow}>
          <Pressable
            onPress={handlePlayPause}
            style={({ pressed }) => [
              styles.playBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={[
              styles.playCircle,
              { borderColor: `${accent}40` },
              (isActive && isPlaying) && { backgroundColor: accent, borderColor: accent },
            ]}>
              <IconSymbol
                name={(isActive && isPlaying) ? 'pause.fill' : 'play.fill'}
                size={24}
                color={(isActive && isPlaying) ? '#000000' : accent}
              />
            </View>
          </Pressable>
          <Text style={styles.playLabel}>
            {(isActive && isPlaying) ? 'playing' : 'tap to play'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* EQ Sliders */}
        <Text style={styles.sectionLabel}>Mix</Text>
        <Text style={styles.sectionSub}>Shape the sound to your preference</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slidersRow}
          style={styles.slidersScroll}
        >
          {EQ_BAND_LABELS.map((label, i) => (
            <EQSlider
              key={label}
              label={label}
              value={currentLevels[i] ?? 70}
              accentColor={accent}
              onChange={(val) => setLevel(i, val)}
            />
          ))}
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Presets */}
        <Text style={styles.sectionLabel}>Presets</Text>
        <View style={styles.presetsRow}>
          {soundscape.presets.map((preset) => (
            <Pressable
              key={preset.name}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                applyPreset(preset);
              }}
              style={({ pressed }) => [
                styles.presetChip,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.presetText, { color: accent }]}>{preset.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Master Volume */}
        <View style={styles.volumeHeader}>
          <Text style={styles.sectionLabel}>Volume</Text>
          <Text style={[styles.volumeValue, { color: accent }]}>
            {Math.round(isActive ? masterVolume : 80)}
          </Text>
        </View>

        <View style={styles.volumeTrackWrap}>
          <Pressable
            style={styles.volumeHitArea}
            onStartShouldSetResponder={() => true}
            onResponderMove={(e) => {
              const x = e.nativeEvent.locationX;
              const trackW = width - 48;
              const v = Math.min(100, Math.max(0, Math.round((x / trackW) * 100)));
              setMasterVolume(v);
            }}
          >
            <View style={styles.volumeTrackBg}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${isActive ? masterVolume : 80}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <View
              style={[
                styles.volumeThumb,
                {
                  left: `${isActive ? masterVolume : 80}%`,
                  shadowColor: accent,
                },
              ]}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* Timer Sheet */}
      <TimerSheet
        visible={timerSheetVisible}
        onClose={() => setTimerSheetVisible(false)}
        accentColor={accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
  heartBtn: {
    fontSize: 22,
    lineHeight: 26,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  heroBlock: {
    marginBottom: 32,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333333',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  soundName: {
    fontSize: 52,
    fontWeight: '200',
    letterSpacing: -1,
    lineHeight: 56,
  },
  soundDesc: {
    fontSize: 14,
    color: '#3A3A3A',
    lineHeight: 22,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 36,
  },
  playBtn: {},
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  playLabel: {
    fontSize: 14,
    color: '#333333',
    letterSpacing: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1A1A1A',
    marginVertical: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#2A2A2A',
    letterSpacing: 0.2,
    marginBottom: 24,
  },
  slidersScroll: {
    marginHorizontal: -24,
  },
  slidersRow: {
    flexDirection: 'row',
    gap: 18,
    paddingHorizontal: 24,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  volumeTrackWrap: {
    height: 32,
    justifyContent: 'center',
  },
  volumeHitArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  volumeTrackBg: {
    height: 1.5,
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 1,
  },
  volumeThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 9,
    marginLeft: -7,
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
