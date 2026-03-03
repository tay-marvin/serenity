import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import type { Soundscape } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const { favorites, activeSoundscapeId, isPlaying } = useAudioEngine();
  const favoriteSounds = SOUNDSCAPES.filter(s => favorites.includes(s.id));

  const handlePress = (sound: Soundscape) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id: sound.id } });
  };

  const renderItem = ({ item, index }: { item: Soundscape; index: number }) => {
    const isActive = activeSoundscapeId === item.id && isPlaying;
    return (
      <Pressable
        onPress={() => handlePress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${isActive ? ', now playing' : ''}`}
        style={({ pressed }) => [
          styles.row,
          { borderBottomColor: C.border },
          pressed && { opacity: 0.5 },
        ]}
      >
        <Text style={[styles.rowIndex, { color: C.muted }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text
          style={[
            styles.rowName,
            { color: C.text },
            isActive && styles.rowNameActive,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.rowRight}>
          {isActive ? (
            <View style={[styles.dot, { backgroundColor: C.text }]} />
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
        <Text style={[styles.appTitle, { color: C.text }]}>Saved</Text>
        <Text style={[styles.appSubtitle, { color: C.muted }]}>
          {favoriteSounds.length === 0
            ? 'YOUR SOUNDS'
            : `${favoriteSounds.length} SOUND${favoriteSounds.length !== 1 ? 'S' : ''}`}
        </Text>
      </View>

      {favoriteSounds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: C.text }]}>Nothing saved yet.</Text>
          <Text style={[styles.emptyBody, { color: C.muted }]}>
            Open a sound and tap the bookmark{'\n'}to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteSounds}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

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
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
});
