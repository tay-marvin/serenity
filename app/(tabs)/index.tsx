import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 220;

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

  const tabBarH = Platform.OS === 'web' ? 60 : 56 + insets.bottom;
  const miniPlayerH = activeSoundscapeId ? 68 : 0;

  const renderItem = useCallback(({ item }: { item: typeof SOUNDSCAPES[0] }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    const fav = favorites.includes(item.id);
    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
      >
        {/* Background image */}
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />

        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Active playing glow border */}
        {active && (
          <View style={[styles.activeBorder, { borderColor: '#C8B89A' }]} />
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category}</Text>
            </View>
            {fav && <Text style={styles.heartIcon}>♥</Text>}
          </View>

          {/* Bottom */}
          <View style={styles.cardBottom}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>

            {active && (
              <View style={styles.playingRow}>
                {[1,2,3,4,5].map(i => (
                  <View
                    key={i}
                    style={[styles.bar, { height: 4 + (i % 3) * 5, backgroundColor: '#C8B89A' }]}
                  />
                ))}
                <Text style={styles.playingLabel}>Playing</Text>
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
        <Text style={styles.appName}>Serenity</Text>
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
          { paddingTop: insets.top + 130, paddingBottom: tabBarH + miniPlayerH + 16 },
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
    fontSize: 28,
    fontWeight: '300',
    color: '#F5F0E8',
    letterSpacing: 6,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 2,
  },
  appTagline: {
    fontSize: 12,
    color: '#6B6560',
    letterSpacing: 3,
    textTransform: 'lowercase',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  pills: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#C8B89A',
    borderColor: '#C8B89A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  activeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cardContent: {
    flex: 1,
    padding: 18,
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
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heartIcon: {
    fontSize: 14,
    color: '#C8B89A',
  },
  cardBottom: {
    gap: 4,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
  playingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.9,
  },
  playingLabel: {
    fontSize: 11,
    color: '#C8B89A',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
});
