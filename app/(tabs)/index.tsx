import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SoundCard } from '@/components/sound-card';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const CATEGORIES = ['All', 'Rain', 'Water', 'Nature', 'Fire', 'Storm', 'Wind', 'Urban', 'Noise', 'Cosmic'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, play, pause, resume, favorites } = useAudioEngine();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredSounds = selectedCategory === 'All'
    ? SOUNDSCAPES
    : SOUNDSCAPES.filter(s => s.category === selectedCategory);

  const handleCardPress = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: '/mixer/[id]' as any, params: { id } });
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: typeof SOUNDSCAPES[0]; index: number }) => (
    <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
      <SoundCard
        soundscape={item}
        isPlaying={activeSoundscapeId === item.id && isPlaying}
        isFavorite={favorites.includes(item.id)}
        onPress={() => handleCardPress(item.id)}
      />
    </View>
  ), [activeSoundscapeId, isPlaying, favorites, handleCardPress]);

  const tabBarHeight = Platform.OS === 'web' ? 68 : 80 + insets.bottom;
  const miniPlayerHeight = activeSoundscapeId ? 64 : 0;
  const bottomPad = tabBarHeight + miniPlayerHeight + 16;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0D0D1A', '#080810']}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        data={filteredSounds}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 100, paddingBottom: bottomPad },
        ]}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={null}
      />

      {/* Fixed header overlay */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <LinearGradient
          colors={['rgba(8,8,16,1)', 'rgba(8,8,16,0.95)', 'rgba(8,8,16,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>Serenity</Text>
          <Text style={styles.appSubtitle}>Tune your mind</Text>
        </View>

        {/* Category filter */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
            >
              <Text
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 12,
  },
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0F0FF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
});
