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
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Full-screen gradient background — no image */}
      <LinearGradient
        colors={[soundscape.gradient[0], soundscape.gradient[1], '#000000']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft glow orb */}
      <View style={[styles.glowOrb, { backgroundColor: accent }]} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="chevron.left" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>

        <View style={styles.headerMeta}>
          <Text style={styles.headerCategory}>{soundscape.category}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setTimerSheetVisible(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            {timerRemaining
              ? <Text style={[styles.timerText, { color: accent }]}>{timerRemaining}</Text>
              : <IconSymbol name="timer" size={20} color="rgba(255,255,255,0.4)" />
            }
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(soundscape.id);
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.heartBtn, isFavorite && { color: accent }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sound name */}
        <View style={styles.titleBlock}>
          <Text style={styles.soundName}>{soundscape.name}</Text>
          <Text style={styles.soundDesc}>{soundscape.description}</Text>
        </View>

        {/* Play / Pause */}
        <View style={styles.playRow}>
          <Pressable
            onPress={handlePlayPause}
            style={({ pressed }) => [
              styles.playBtn,
              { borderColor: `${accent}50` },
              (isActive && isPlaying) && { backgroundColor: accent, borderColor: accent },
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <IconSymbol
              name={(isActive && isPlaying) ? 'pause.fill' : 'play.fill'}
              size={26}
              color={(isActive && isPlaying) ? '#000000' : accent}
            />
          </Pressable>
          <Text style={styles.playStatus}>
            {(isActive && isPlaying) ? 'playing' : 'tap to play'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* EQ Section */}
        <Text style={styles.sectionLabel}>Sound Mix</Text>
        <Text style={styles.sectionSub}>Drag each band to shape the sound</Text>

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
                { borderColor: `${accent}25` },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.presetText, { color: `${accent}BB` }]}>{preset.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Master Volume */}
        <View style={styles.volumeRow}>
          <Text style={styles.sectionLabel}>Volume</Text>
          <Text style={[styles.volumeValue, { color: accent }]}>
            {Math.round(isActive ? masterVolume : 80)}%
          </Text>
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
                  { width: `${isActive ? masterVolume : 80}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <View
              style={[
                styles.volumeThumb,
                {
                  left: `${isActive ? masterVolume : 80}%`,
                  backgroundColor: '#FFFFFF',
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
  glowOrb: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.08,
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
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
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
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleBlock: {
    marginBottom: 28,
    gap: 8,
  },
  soundName: {
    fontSize: 40,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  soundDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
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
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  playStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.18)',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '400',
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
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 1,
  },
  volumeThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: 8,
    marginLeft: -8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});
