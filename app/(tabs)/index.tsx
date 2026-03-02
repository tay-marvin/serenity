import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const CATEGORIES = ['All', 'Rain', 'Storm', 'Water', 'Nature', 'Fire', 'Wind', 'Noise'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, favorites } = useAudioEngine();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All'
    ? SOUNDSCAPES
    : SOUNDSCAPES.filter(s => s.category === selectedCategory);

  const tabBarH = Platform.OS === 'web' ? 60 : 48 + insets.bottom;
  const miniPlayerH = activeSoundscapeId ? 80 : 0;

  const handlePress = useCallback((id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id } });
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: typeof SOUNDSCAPES[0]; index: number }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    const isFav = favorites.includes(item.id);

    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
      >
        {/* Large colored sound name — Pillowtalk style */}
        <View style={styles.rowInner}>
          <Text style={[styles.soundName, { color: item.color }]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.rowMeta}>
            <Text style={styles.categoryLabel}>{item.category}</Text>
            {isFav && <Text style={[styles.favDot, { color: item.color }]}>•</Text>}
            {active && (
              <View style={styles.playingDots}>
                {[5, 9, 6, 11, 7].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h, backgroundColor: item.color }]} />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Hairline separator */}
        <View style={styles.separator} />
      </Pressable>
    );
  }, [activeSoundscapeId, isPlaying, favorites, handlePress]);

  return (
    <View style={[styles.root, { backgroundColor: '#000000' }]}>
      {/* Fixed header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.appTitle}>serenity</Text>
        <Text style={styles.appSub}>tune your mind</Text>

        {/* Category filter — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
          style={styles.catScroll}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync?.();
                setSelectedCategory(cat);
              }}
              style={styles.catBtn}
            >
              <Text style={[
                styles.catText,
                selectedCategory === cat && styles.catTextActive,
              ]}>
                {cat}
              </Text>
              {selectedCategory === cat && <View style={styles.catUnderline} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Sound list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top + 148,
            paddingBottom: tabBarH + miniPlayerH + 24,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '300',
    color: '#F5F5F0',
    letterSpacing: -0.5,
    paddingHorizontal: 24,
    marginBottom: 2,
  },
  appSub: {
    fontSize: 13,
    color: '#444444',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  catScroll: {
    flexGrow: 0,
  },
  catRow: {
    paddingHorizontal: 20,
    gap: 4,
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
    alignItems: 'center',
  },
  catText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3A3A3A',
    letterSpacing: 0.2,
  },
  catTextActive: {
    color: '#F5F5F0',
    fontWeight: '500',
  },
  catUnderline: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: '#F5F5F0',
    borderRadius: 1,
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
  favDot: {
    fontSize: 16,
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
    backgroundColor: '#1A1A1A',
  },
});
