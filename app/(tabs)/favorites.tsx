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

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, favorites } = useAudioEngine();

  const favoriteSounds = SOUNDSCAPES.filter(s => favorites.includes(s.id));

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
        isFavorite
        onPress={() => handleCardPress(item.id)}
      />
    </View>
  ), [activeSoundscapeId, isPlaying, handleCardPress]);

  const tabBarHeight = Platform.OS === 'web' ? 68 : 80 + insets.bottom;
  const miniPlayerHeight = activeSoundscapeId ? 64 : 0;
  const bottomPad = tabBarHeight + miniPlayerHeight + 16;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0D1A', '#080810']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favoriteSounds.length === 0
            ? 'Heart a soundscape to save it here'
            : `${favoriteSounds.length} saved soundscape${favoriteSounds.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {favoriteSounds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyDesc}>
            Open any soundscape and tap the heart icon to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteSounds}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 100, paddingBottom: bottomPad },
          ]}
          columnWrapperStyle={styles.row}
        />
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0F0FF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    color: 'rgba(255,255,255,0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
