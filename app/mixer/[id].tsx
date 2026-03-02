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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useKeepAwake } from 'expo-keep-awake';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EQSlider } from '@/components/eq-slider';
import { TimerSheet } from '@/components/timer-sheet';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES, EQ_BAND_LABELS } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

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

  return (
    <View style={styles.container}>
      {/* Full-bleed background */}
      <Image
        source={{ uri: soundscape.imageUrl }}
        style={styles.bgImage}
        contentFit="cover"
        transition={600}
      />

      {/* Heavy dark overlay — Pillowtalk style: image is subtle, text is king */}
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)', '#000000']}
        locations={[0, 0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="chevron.left" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View style={styles.headerMeta}>
          <Text style={styles.headerCategory}>{soundscape.category}</Text>
        </View>

        <View style={styles.headerActions}>
          {/* Timer */}
          <Pressable
            onPress={() => setTimerSheetVisible(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            {timerRemaining
              ? <Text style={styles.timerText}>{timerRemaining}</Text>
              : <IconSymbol name="timer" size={20} color="rgba(255,255,255,0.5)" />
            }
          </Pressable>

          {/* Favorite */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(soundscape.id);
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.heartBtn, isFavorite && styles.heartActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sound name — large, minimal, Pillowtalk-style */}
        <View style={styles.titleBlock}>
          <Text style={styles.soundName}>{soundscape.name}</Text>
          <Text style={styles.soundDesc}>{soundscape.description}</Text>
        </View>

        {/* Play / Pause button — centered, minimal circle */}
        <View style={styles.playRow}>
          <Pressable
            onPress={handlePlayPause}
            style={({ pressed }) => [
              styles.playBtn,
              (isActive && isPlaying) && styles.playBtnActive,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <IconSymbol
              name={(isActive && isPlaying) ? 'pause.fill' : 'play.fill'}
              size={28}
              color={(isActive && isPlaying) ? '#000000' : '#C8B89A'}
            />
          </Pressable>
          <Text style={styles.playStatus}>
            {(isActive && isPlaying) ? 'playing' : 'tap to play'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* EQ Section label */}
        <Text style={styles.sectionLabel}>Sound Mix</Text>
        <Text style={styles.sectionSub}>Drag each band to shape the sound</Text>

        {/* EQ Sliders — horizontal scroll */}
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
              accentColor="#C8B89A"
              onChange={(val) => setLevel(i, val)}
            />
          ))}
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Presets */}
        <Text style={styles.sectionLabel}>Presets</Text>
        <View style={styles.presetsRow}>
          {soundscape.presets.map((preset, i) => (
            <Pressable
              key={preset.name}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                applyPreset(preset);
              }}
              style={({ pressed }) => [
                styles.presetChip,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.presetText}>{preset.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Master Volume */}
        <View style={styles.volumeRow}>
          <Text style={styles.sectionLabel}>Volume</Text>
          <Text style={styles.volumeValue}>{Math.round(isActive ? masterVolume : 80)}%</Text>
        </View>
        <View style={styles.volumeTrack}>
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
                  { width: `${isActive ? masterVolume : 80}%` },
                ]}
              />
            </View>
            <View
              style={[
                styles.volumeThumb,
                { left: `${isActive ? masterVolume : 80}%` },
              ]}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* Timer Sheet */}
      <TimerSheet
        visible={timerSheetVisible}
        onClose={() => setTimerSheetVisible(false)}
        accentColor="#C8B89A"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    alignItems: 'center',
  },
  headerCategory: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C8B89A',
    minWidth: 36,
    textAlign: 'center',
  },
  heartBtn: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.35)',
  },
  heartActive: {
    color: '#C8B89A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  titleBlock: {
    marginBottom: 28,
    gap: 8,
  },
  soundName: {
    fontSize: 38,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  soundDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(200,184,154,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,184,154,0.06)',
  },
  playBtnActive: {
    backgroundColor: '#C8B89A',
    borderColor: '#C8B89A',
  },
  playStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  slidersScroll: {
    marginHorizontal: -24,
  },
  slidersRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 24,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  presetChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  volumeValue: {
    fontSize: 13,
    color: '#C8B89A',
    fontWeight: '500',
    letterSpacing: 1,
  },
  volumeTrack: {
    height: 32,
    justifyContent: 'center',
  },
  volumeHitArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  volumeTrackBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#C8B89A',
    borderRadius: 2,
  },
  volumeThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C8B89A',
    top: 7,
    marginLeft: -9,
    shadowColor: '#C8B89A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
