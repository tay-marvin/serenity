import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';
import { useThemeContext } from '@/lib/theme-provider';

export function MiniPlayer() {
  const { layerAId, layerBId, layerAPlaying, layerBPlaying, pauseAll, resumeAll } = useAudioEngine();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#222222' : '#E0E0E0';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const mutedColor = isDark ? '#888888' : '#666666';

  // Don't render if nothing is loaded
  if (!layerAId) return null;

  const soundscapeA = SOUNDSCAPES.find(s => s.id === layerAId);
  const soundscapeB = layerBId ? SOUNDSCAPES.find(s => s.id === layerBId) : null;
  if (!soundscapeA) return null;

  const isPlaying = layerAPlaying || layerBPlaying;

  const handlePlayPause = (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isPlaying ? pauseAll() : resumeAll();
  };

  const handleOpen = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id: layerAId } });
  };

  return (
    <Pressable
      onPress={handleOpen}
      accessibilityRole="button"
      accessibilityLabel={
        soundscapeB
          ? `Now playing: ${soundscapeA.name} and ${soundscapeB.name}. Tap to open mixer.`
          : `Now playing: ${soundscapeA.name}. Tap to open mixer.`
      }
      style={({ pressed }) => [
        styles.wrapper,
        { backgroundColor: bg, borderTopColor: borderColor },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={styles.container}>
        {/* Sound name(s) */}
        <View style={styles.info}>
          {soundscapeB ? (
            // Two layers — show both names with A/B labels
            <View style={styles.layerNames}>
              <View style={styles.layerRow}>
                <Text style={[styles.layerBadge, { color: mutedColor }]}>A</Text>
                <Text style={[styles.name, { color: textColor, fontFamily: 'PlayfairDisplay-Italic' }]} numberOfLines={1}>
                  {soundscapeA.name}
                </Text>
              </View>
              <View style={styles.layerRow}>
                <Text style={[styles.layerBadge, { color: mutedColor }]}>B</Text>
                <Text style={[styles.nameSecondary, { color: mutedColor, fontFamily: 'PlayfairDisplay-Italic' }]} numberOfLines={1}>
                  {soundscapeB.name}
                </Text>
              </View>
            </View>
          ) : (
            // Single layer
            <Text style={[styles.name, { color: textColor, fontFamily: 'PlayfairDisplay-Italic' }]} numberOfLines={1}>
              {soundscapeA.name}
            </Text>
          )}
          <Text style={[styles.status, { color: mutedColor }]}>
            {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
          </Text>
        </View>

        {/* Play/Pause */}
        <Pressable
          onPress={handlePlayPause}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Resume'}
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
  layerNames: {
    gap: 2,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  layerBadge: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 14,
    width: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  nameSecondary: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.2,
    lineHeight: 20,
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
