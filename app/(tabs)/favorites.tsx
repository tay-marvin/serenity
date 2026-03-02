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
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
      >
        <View style={styles.rowInner}>
          <Text style={[styles.soundName, { color: item.color }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.rowMeta}>
            <Text style={styles.categoryLabel}>{item.category}</Text>
            {active && (
              <View style={styles.playingDots}>
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
        <Text style={styles.appTitle}>saved</Text>
        <Text style={styles.appSub}>
          {favSounds.length === 0 ? 'your favourites' : `${favSounds.length} sound${favSounds.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {favSounds.length === 0 ? (
        <View style={[styles.empty, { paddingTop: insets.top + 130 }]}>
          <Text style={styles.emptyTitle}>nothing here yet</Text>
          <Text style={styles.emptyDesc}>
            Open any sound and tap the heart to save it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favSounds}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '300',
    color: '#F5F5F0',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  appSub: {
    fontSize: 13,
    color: '#444444',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 24,
  },
  row: {
    paddingVertical: 6,
  },
  rowInner: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soundName: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.3,
    flex: 1,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333333',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    backgroundColor: '#1A1A1A',
  },
  empty: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2A2A2A',
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
