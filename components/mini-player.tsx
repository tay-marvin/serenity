import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';
import { useThemeContext } from '@/lib/theme-provider';

export function MiniPlayer() {
  const { activeSoundscapeId, isPlaying, pause, resume } = useAudioEngine();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#222222' : '#E0E0E0';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const mutedColor = isDark ? '#888888' : '#666666';

  if (!activeSoundscapeId) return null;

  const soundscape = SOUNDSCAPES.find(s => s.id === activeSoundscapeId);
  if (!soundscape) return null;

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
      style={({ pressed }) => [
        styles.wrapper,
        { backgroundColor: bg, borderTopColor: borderColor },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={styles.container}>
        {/* Sound name */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: textColor, fontFamily: 'PlayfairDisplay-Italic' }]} numberOfLines={1}>
            {soundscape.name}
          </Text>
          <Text style={[styles.status, { color: mutedColor }]}>
            {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
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
            size={16}
            color={textColor}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  status: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2.5,
    lineHeight: 14,
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
