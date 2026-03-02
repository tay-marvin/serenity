import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioEngine } from '@/lib/audio-engine';
import * as Haptics from 'expo-haptics';

export function MiniPlayer() {
  const { activeSoundscape, isPlaying, pause, resume } = useAudioEngine();
  const router = useRouter();

  if (!activeSoundscape) return null;

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isPlaying ? pause() : resume();
  };

  const handleOpen = () => {
    router.push({ pathname: '/mixer/[id]' as any, params: { id: activeSoundscape.id } });
  };

  return (
    <Pressable onPress={handleOpen} style={styles.wrapper}>
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <View style={styles.container}>
          {/* Warm accent dot */}
          <View style={[styles.dot, isPlaying && styles.dotActive]} />

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name}>{activeSoundscape.name}</Text>
            <Text style={styles.status}>{isPlaying ? 'Now playing' : 'Paused'}</Text>
          </View>

          {/* Animated bars (static representation) */}
          {isPlaying && (
            <View style={styles.bars}>
              {[10, 16, 8, 14, 6].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h }]} />
              ))}
            </View>
          )}

          {/* Play/Pause */}
          <Pressable
            onPress={handlePlayPause}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
          >
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={16}
              color="#C8B89A"
            />
          </Pressable>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  blur: {
    backgroundColor: 'rgba(10,10,10,0.7)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(200,184,154,0.3)',
  },
  dotActive: {
    backgroundColor: '#C8B89A',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '400',
    color: '#F5F0E8',
    letterSpacing: 0.3,
  },
  status: {
    fontSize: 11,
    color: '#6B6560',
    letterSpacing: 0.5,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
    backgroundColor: '#C8B89A',
    opacity: 0.7,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,184,154,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
