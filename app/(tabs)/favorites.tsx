import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  SectionList,
} from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import type { SavedMix } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import type { Soundscape } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const {
    favorites,
    savedMixes,
    activeSoundscapeId,
    layerAId,
    layerBId,
    isPlaying,
    loadMix,
    deleteMix,
  } = useAudioEngine();

  const favoriteSounds = SOUNDSCAPES.filter(s => favorites.includes(s.id));

  const handleSoundPress = (sound: Soundscape) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id: sound.id } });
  };

  const handleMixPress = (mix: SavedMix) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loadMix(mix);
  };

  const handleMixDelete = (mix: SavedMix) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteMix(mix.id);
  };

  const isEmpty = savedMixes.length === 0 && favoriteSounds.length === 0;

  // Subtitle for header
  const parts: string[] = [];
  if (savedMixes.length > 0) parts.push(`${savedMixes.length} MIX${savedMixes.length !== 1 ? 'ES' : ''}`);
  if (favoriteSounds.length > 0) parts.push(`${favoriteSounds.length} SOUND${favoriteSounds.length !== 1 ? 'S' : ''}`);
  const subtitle = parts.length > 0 ? parts.join(' · ') : 'YOUR SOUNDS & MIXES';

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.appTitle, { color: C.text }]}>Saved</Text>
        <Text style={[styles.appSubtitle, { color: C.muted }]}>{subtitle}</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: C.text }]}>Nothing saved yet.</Text>
          <Text style={[styles.emptyBody, { color: C.muted }]}>
            Open a sound and tap the bookmark to save it here.{'\n'}
            In the mixer, tap <Text style={{ fontStyle: 'italic' }}>Save Mix</Text> to save a layered combination.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* ─── Saved Mixes ─────────────────────────────────────── */}
              {savedMixes.length > 0 && (
                <>
                  <View style={[styles.sectionHeader, { borderBottomColor: C.border }]}>
                    <Text style={[styles.sectionLabel, { color: C.muted }]}>MIXES</Text>
                  </View>
                  {savedMixes.map((mix) => {
                    const soundA = SOUNDSCAPES.find(s => s.id === mix.layerAId);
                    const soundB = mix.layerBId ? SOUNDSCAPES.find(s => s.id === mix.layerBId) : null;
                    const isActive = isPlaying &&
                      layerAId === mix.layerAId &&
                      layerBId === mix.layerBId;
                    return (
                      <Pressable
                        key={mix.id}
                        onPress={() => handleMixPress(mix)}
                        accessibilityRole="button"
                        accessibilityLabel={`${mix.name}${isActive ? ', now playing' : ''}`}
                        style={({ pressed }) => [
                          styles.mixRow,
                          { borderBottomColor: C.border },
                          pressed && { opacity: 0.5 },
                        ]}
                      >
                        <View style={styles.mixRowLeft}>
                          <Text
                            style={[
                              styles.mixName,
                              { color: C.text },
                              isActive && styles.mixNameActive,
                            ]}
                            numberOfLines={1}
                          >
                            {mix.name}
                          </Text>
                          <Text style={[styles.mixSub, { color: C.muted }]} numberOfLines={1}>
                            {soundA?.name ?? mix.layerAId}
                            {soundB ? ` + ${soundB.name}` : ''}
                          </Text>
                        </View>
                        <View style={styles.mixRowRight}>
                          {isActive ? (
                            <View style={[styles.dot, { backgroundColor: C.text }]} />
                          ) : (
                            <Pressable
                              onPress={() => handleMixDelete(mix)}
                              accessibilityRole="button"
                              accessibilityLabel={`Delete mix ${mix.name}`}
                              hitSlop={12}
                              style={({ pressed }) => pressed && { opacity: 0.5 }}
                            >
                              <Text style={[styles.deleteBtn, { color: C.muted }]}>✕</Text>
                            </Pressable>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </>
              )}

              {/* ─── Saved Sounds ─────────────────────────────────────── */}
              {favoriteSounds.length > 0 && (
                <>
                  <View style={[styles.sectionHeader, { borderBottomColor: C.border }]}>
                    <Text style={[styles.sectionLabel, { color: C.muted }]}>SOUNDS</Text>
                  </View>
                  {favoriteSounds.map((item, index) => {
                    const isActive = activeSoundscapeId === item.id && isPlaying;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleSoundPress(item)}
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
                  })}
                </>
              )}
            </>
          }
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
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  // Mix rows
  mixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },
  mixRowLeft: {
    flex: 1,
    gap: 4,
  },
  mixName: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  mixNameActive: {
    fontFamily: 'PlayfairDisplay-Italic',
  },
  mixSub: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  mixRowRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteBtn: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Sound rows
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
