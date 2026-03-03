import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import type { Soundscape } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const { activeSoundscapeId, isPlaying } = useAudioEngine();

  const handlePress = (sound: Soundscape) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/mixer/${sound.id}` as any);
  };

  const renderItem = ({ item, index }: { item: Soundscape; index: number }) => {
    const isActive = activeSoundscapeId === item.id && isPlaying;
    return (
      <Pressable
        onPress={() => handlePress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.category}${isActive ? ', now playing' : ''}`}
        style={({ pressed }) => [
          styles.row,
          { borderBottomColor: C.border },
          pressed && { opacity: 0.5 },
        ]}
      >
        {/* Index number — Co-Star uses small numerals in lists */}
        <Text style={[styles.rowIndex, { color: C.muted }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>

        {/* Sound name */}
        <Text
          style={[
            styles.rowName,
            { color: isActive ? C.text : C.text },
            isActive && styles.rowNameActive,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Right side: playing indicator or category */}
        <View style={styles.rowRight}>
          {isActive ? (
            <View style={styles.playingDot}>
              <View style={[styles.dot, { backgroundColor: C.text }]} />
            </View>
          ) : (
            <Text style={[styles.rowCategory, { color: C.muted }]}>
              {item.category.toUpperCase()}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.appTitle, { color: C.text }]}>Serenity</Text>
        <Text style={[styles.appSubtitle, { color: C.muted }]}>TUNE YOUR MIND</Text>
      </View>

      {/* Sound list */}
      <FlatList
        data={SOUNDSCAPES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Color tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg:     '#FFFFFF',
  text:   '#000000',
  muted:  '#666666',
  border: '#E0E0E0',
};
const DARK = {
  bg:     '#000000',
  text:   '#FFFFFF',
  muted:  '#888888',
  border: '#222222',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  appTitle: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 60,
  },
  rowIndex: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1,
    width: 28,
    lineHeight: 18,
  },
  rowName: {
    flex: 1,
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  rowNameActive: {
    fontFamily: 'PlayfairDisplay-Italic',
  },
  rowRight: {
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowCategory: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 14,
    textAlign: 'right',
  },
  playingDot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
