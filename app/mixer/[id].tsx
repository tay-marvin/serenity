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

  // Keep screen awake while playing
  useKeepAwake();

  // Auto-play when entering mixer
  useEffect(() => {
    if (soundscape && !isActive) {
      play(soundscape.id);
    }
  }, [soundscape?.id]);

  // Timer countdown display
  useEffect(() => {
    if (!timerEndTime) {
      setTimerRemaining(null);
      return;
    }
    const update = () => {
      const remaining = timerEndTime - Date.now();
      if (remaining <= 0) {
        setTimerRemaining(null);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimerRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timerEndTime]);

  if (!soundscape) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Soundscape not found</Text>
      </View>
    );
  }

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isActive && isPlaying) {
      pause();
    } else if (isActive && !isPlaying) {
      resume();
    } else {
      play(soundscape.id);
    }
  };

  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(soundscape.id);
  };

  const handlePreset = (presetIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    applyPreset(soundscape.presets[presetIndex]);
  };

  const handleBack = () => {
    router.back();
  };

  const currentLevels = isActive ? levels : soundscape.presets[0].levels;

  return (
    <View style={styles.container}>
      {/* Full-bleed background image */}
      <Image
        source={{ uri: soundscape.imageUrl }}
        style={styles.bgImage}
        contentFit="cover"
        transition={500}
      />

      {/* Dark overlay */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.5)',
          'rgba(8,8,16,0.85)',
          'rgba(8,8,16,0.98)',
        ]}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerCategory}>{soundscape.category}</Text>
          <Text style={styles.headerName}>{soundscape.name}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Timer button */}
          <Pressable
            onPress={() => setTimerSheetVisible(true)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            {timerRemaining ? (
              <Text style={[styles.timerText, { color: soundscape.color }]}>
                {timerRemaining}
              </Text>
            ) : (
              <IconSymbol name="timer" size={22} color="rgba(255,255,255,0.7)" />
            )}
          </Pressable>

          {/* Favorite button */}
          <Pressable
            onPress={handleFavorite}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol
              name={isFavorite ? 'heart.fill' : 'heart'}
              size={22}
              color={isFavorite ? '#EF4444' : 'rgba(255,255,255,0.7)'}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* EQ Sliders */}
        <View style={styles.sliderSection}>
          <Text style={styles.sectionTitle}>EQ Mix</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.slidersRow}
          >
            {EQ_BAND_LABELS.map((label, index) => (
              <EQSlider
                key={label}
                label={label}
                value={currentLevels[index] ?? 70}
                accentColor={soundscape.color}
                onChange={(val) => setLevel(index, val)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.presetsRow}>
            {soundscape.presets.map((preset, index) => (
              <Pressable
                key={preset.name}
                onPress={() => handlePreset(index)}
                style={({ pressed }) => [
                  styles.presetChip,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                ]}
              >
                <LinearGradient
                  colors={[`${soundscape.color}30`, `${soundscape.color}10`]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={[styles.presetText, { color: soundscape.color }]}>
                  {preset.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Master Volume */}
        <View style={styles.volumeSection}>
          <View style={styles.volumeHeader}>
            <IconSymbol name="speaker.wave.1.fill" size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.sectionTitle}>Volume</Text>
            <Text style={[styles.volumeValue, { color: soundscape.color }]}>
              {Math.round(isActive ? masterVolume : 80)}%
            </Text>
          </View>
          <View style={styles.volumeTrack}>
            <Pressable
              style={styles.volumeTrackInner}
              onStartShouldSetResponder={() => true}
              onResponderMove={(e) => {
                const x = e.nativeEvent.locationX;
                const trackWidth = width - 48;
                const newVol = Math.min(100, Math.max(0, Math.round((x / trackWidth) * 100)));
                setMasterVolume(newVol);
              }}
            >
              <View
                style={[
                  styles.volumeFill,
                  {
                    width: `${isActive ? masterVolume : 80}%`,
                    backgroundColor: soundscape.color,
                  },
                ]}
              />
              <View
                style={[
                  styles.volumeThumb,
                  {
                    left: `${isActive ? masterVolume : 80}%`,
                    backgroundColor: '#FFFFFF',
                    shadowColor: soundscape.color,
                  },
                ]}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Play/Pause Button */}
      <View style={[styles.playContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handlePlayPause}
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: soundscape.color },
            pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
          ]}
        >
          {/* Glow effect */}
          <View style={[styles.playGlow, { backgroundColor: soundscape.color }]} />
          <IconSymbol
            name={(isActive && isPlaying) ? 'pause.fill' : 'play.fill'}
            size={32}
            color="#FFFFFF"
          />
        </Pressable>
        <Text style={styles.playLabel}>
          {(isActive && isPlaying) ? 'Playing' : 'Tap to play'}
        </Text>
      </View>

      {/* Timer Sheet */}
      <TimerSheet
        visible={timerSheetVisible}
        onClose={() => setTimerSheetVisible(false)}
        accentColor={soundscape.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 28,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sliderSection: {},
  slidersRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 4,
  },
  presetsSection: {},
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  volumeSection: {},
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  volumeTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'visible',
  },
  volumeTrackInner: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  volumeFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  volumeThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -7,
    marginLeft: -10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  playContainer: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 8,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.3,
    transform: [{ scale: 1.4 }],
  },
  playLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});
