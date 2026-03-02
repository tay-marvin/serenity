import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Soundscape } from '@/lib/sounds';

interface SoundCardProps {
  soundscape: Soundscape;
  isPlaying: boolean;
  isFavorite: boolean;
  onPress: () => void;
}

export function SoundCard({ soundscape, isPlaying, isFavorite, onPress }: SoundCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      {/* Background image */}
      <Image
        source={{ uri: soundscape.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent glow when playing */}
      {isPlaying && (
        <View
          style={[
            styles.playingGlow,
            { borderColor: soundscape.color, shadowColor: soundscape.color },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: category + favorite */}
        <View style={styles.topRow}>
          <View style={[styles.categoryBadge, { backgroundColor: `${soundscape.color}25` }]}>
            <Text style={[styles.categoryText, { color: soundscape.color }]}>
              {soundscape.category}
            </Text>
          </View>
          {isFavorite && (
            <IconSymbol name="heart.fill" size={14} color="#EF4444" />
          )}
        </View>

        {/* Bottom: name + playing indicator */}
        <View style={styles.bottomRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{soundscape.name}</Text>
          </View>
          {isPlaying && (
            <View style={[styles.playingDot, { backgroundColor: soundscape.color }]} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  playingGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
});
