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
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const CARD_HEIGHT = 200;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, favorites } = useAudioEngine();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const CATEGORIES = ['All', 'Rain', 'Storm', 'Water', 'Nature', 'Fire', 'Wind', 'Noise'];

  const filtered = selectedCategory === 'All'
    ? SOUNDSCAPES
    : SOUNDSCAPES.filter(s => s.category === selectedCategory);

  const handlePress = useCallback((id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id } });
  }, [router]);

  const tabBarH = Platform.OS === 'web' ? 60 : 48 + insets.bottom;
  const miniPlayerH = activeSoundscapeId ? 74 : 0;

  const renderItem = useCallback(({ item }: { item: typeof SOUNDSCAPES[0] }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    const fav = favorites.includes(item.id);

    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      >
        {/* Pure gradient background — no images */}
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Subtle noise texture overlay via semi-transparent border */}
        {active && (
          <View style={[styles.activeBorder, { borderColor: item.color }]} />
        )}

        {/* Soft color glow in top-right corner */}
        <View style={[styles.glow, { backgroundColor: item.color }]} />

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={[styles.categoryPill, { borderColor: `${item.color}30` }]}>
              <Text style={[styles.categoryPillText, { color: `${item.color}CC` }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            {fav && <Text style={[styles.heartIcon, { color: item.color }]}>♥</Text>}
          </View>

          {/* Bottom */}
          <View style={styles.cardBottom}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>

            {active && (
              <View style={styles.playingRow}>
                {[8, 14, 6, 12, 10].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h, backgroundColor: item.color }]} />
                ))}
                <Text style={[styles.playingLabel, { color: item.color }]}>Playing</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }, [activeSoundscapeId, isPlaying, favorites, handlePress]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.appName}>S E R E N I T Y</Text>
        <Text style={styles.appTagline}>tune your mind</Text>

        {/* Category pills */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c}
          contentContainerStyle={styles.pills}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item)}
              style={[styles.pill, selectedCategory === item && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedCategory === item && styles.pillTextActive]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Sound list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 128, paddingBottom: tabBarH + miniPlayerH + 16 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    paddingBottom: 14,
    backgroundColor: '#000000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  appName: {
    fontSize: 22,
    fontWeight: '300',
    color: '#F5F0E8',
    letterSpacing: 8,
    paddingHorizontal: 24,
    marginBottom: 3,
  },
  appTagline: {
    fontSize: 11,
    color: '#6B6560',
    letterSpacing: 3,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  pills: {
    paddingHorizontal: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#C8B89A',
    borderColor: '#C8B89A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
  },
  pillTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 10,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  activeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
  },
  glow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.12,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heartIcon: {
    fontSize: 14,
  },
  cardBottom: {
    gap: 5,
  },
  cardName: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.2,
  },
  playingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 8,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.85,
  },
  playingLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
});
