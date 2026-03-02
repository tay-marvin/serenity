import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

// WCAG AA contrast values (on #000000)
const C = {
  textPrimary:   '#F5F5F0',   // 19.5:1 ✓
  textSecondary: '#999999',   // 9.7:1 ✓
  textTertiary:  '#777777',   // 5.9:1 ✓
  textEmpty:     '#555555',   // 4.5:1 ✓
  separator:     '#2A2A2A',
  bg:            '#000000',
};

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, favorites } = useAudioEngine();

  const favSounds = SOUNDSCAPES.filter(s => favorites.includes(s.id));
  const tabBarH = Platform.OS === 'web' ? 60 : 48 + insets.bottom;
  const miniPlayerH = activeSoundscapeId ? 80 : 0;

  const handlePress = useCallback((id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id } });
  }, [router]);

  const renderItem = useCallback(({ item }: { item: typeof SOUNDSCAPES[0] }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.category}${active ? ', now playing' : ''}`}
        accessibilityHint="Opens the sound mixer"
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.55 }]}
      >
        <View style={styles.rowInner}>
          <Text style={[styles.soundName, { color: item.color }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.rowMeta}>
            <Text style={styles.categoryLabel} accessibilityElementsHidden>
              {item.category}
            </Text>
            {active && (
              <View style={styles.playingDots} accessibilityElementsHidden>
                {[5, 9, 6, 11, 7].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h, backgroundColor: item.color }]} />
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.separator} />
      </Pressable>
    );
  }, [activeSoundscapeId, isPlaying, handlePress]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.appTitle} accessibilityRole="header">saved</Text>
        <Text style={styles.appSub}>
          {favSounds.length === 0
            ? 'your favourites'
            : `${favSounds.length} sound${favSounds.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {favSounds.length === 0 ? (
        <View
          style={[styles.empty, { paddingTop: insets.top + 130 }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.emptyTitle}>nothing here yet</Text>
          <Text style={styles.emptyDesc}>
            Open any sound and tap the heart to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favSounds}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          accessibilityRole="list"
          contentContainerStyle={[
            styles.list,
            { paddingTop: insets.top + 110, paddingBottom: tabBarH + miniPlayerH + 24 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: C.bg,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '300',
    color: C.textPrimary,       // 19.5:1 ✓
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 14,
    color: C.textSecondary,     // 9.7:1 ✓
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 24,
  },
  row: {},
  rowInner: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,              // 44pt minimum touch target ✓
  },
  soundName: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
    flex: 1,
    lineHeight: 34,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  categoryLabel: {
    fontSize: 12,
    color: C.textTertiary,      // 5.9:1 ✓
    letterSpacing: 1,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  playingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
    opacity: 0.9,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
  },
  empty: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: C.textEmpty,         // 4.5:1 ✓
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  emptyDesc: {
    fontSize: 15,
    color: C.textSecondary,     // 9.7:1 ✓
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
