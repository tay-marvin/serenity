import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

export function MiniPlayer() {
  const { activeSoundscapeId, isPlaying, pause, resume } = useAudioEngine();
  const router = useRouter();

  if (!activeSoundscapeId) return null;

  const soundscape = SOUNDSCAPES.find(s => s.id === activeSoundscapeId);
  if (!soundscape) return null;

  const accent = soundscape.color;

  const handlePlayPause = (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isPlaying ? pause() : resume();
  };

  const handleOpen = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id: activeSoundscapeId } });
  };

  return (
    <Pressable
      onPress={handleOpen}
      accessibilityRole="button"
      accessibilityLabel={`Now playing: ${soundscape.name}. Tap to open mixer.`}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.7 }]}
    >
      {/* Hairline top border */}
      <View style={[styles.topLine, { backgroundColor: accent, opacity: 0.25 }]} />

      <View style={styles.container}>
        {/* Animated bars when playing */}
        {isPlaying && (
          <View style={styles.bars}>
            {[6, 11, 7, 13, 8].map((h, i) => (
              <View key={i} style={[styles.bar, { height: h, backgroundColor: accent }]} />
            ))}
          </View>
        )}

        {/* Sound name in accent color */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: accent }]} numberOfLines={1}>
            {soundscape.name}
          </Text>
          <Text style={styles.status}>
            {isPlaying ? 'now playing' : 'paused'}
          </Text>
        </View>

        {/* Play/Pause */}
        <Pressable
          onPress={handlePlayPause}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? `Pause ${soundscape.name}` : `Resume ${soundscape.name}`}
          accessibilityState={{ selected: isPlaying }}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.5 }]}
        >
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={18}
            color={accent}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: StyleSheet.hairlineWidth,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
    opacity: 0.8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: -0.2,
  },
  status: {
    fontSize: 12,
    color: '#888888',           // 7.0:1 on black ✓
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  btn: {
    width: 44,                  // 44pt minimum touch target ✓
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
