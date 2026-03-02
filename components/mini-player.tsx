import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioEngine } from '@/lib/audio-engine';
import * as Haptics from 'expo-haptics';

export function MiniPlayer() {
  const { activeSoundscape, isPlaying, pause, resume } = useAudioEngine();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!activeSoundscape) return null;

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleOpen = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: '/mixer/[id]' as any, params: { id: activeSoundscape.id } });
  };

  return (
    <Pressable onPress={handleOpen} style={styles.wrapper}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.container}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: activeSoundscape.color }]} />

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.category}>{activeSoundscape.category}</Text>
            <Text style={styles.name}>{activeSoundscape.name}</Text>
          </View>

          {/* Playing indicator */}
          {isPlaying && (
            <View style={styles.waveContainer}>
              {[1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[
                    styles.wavebar,
                    {
                      backgroundColor: activeSoundscape.color,
                      height: 4 + (i % 3) * 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Play/Pause button */}
          <Pressable
            onPress={handlePlayPause}
            style={({ pressed }) => [
              styles.playButton,
              { backgroundColor: activeSoundscape.color },
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
          >
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blur: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  accentBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F0FF',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
  },
  wavebar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
