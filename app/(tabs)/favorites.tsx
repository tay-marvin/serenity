import React, { useCallback } from 'react';
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
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const CARD_HEIGHT = 220;

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId, isPlaying, favorites } = useAudioEngine();

  const favSounds = SOUNDSCAPES.filter(s => favorites.includes(s.id));

  const handlePress = useCallback((id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mixer/[id]' as any, params: { id } });
  }, [router]);

  const tabBarH = Platform.OS === 'web' ? 60 : 48 + insets.bottom;
  const miniPlayerH = activeSoundscapeId ? 68 : 0;

  const renderItem = useCallback(({ item }: { item: typeof SOUNDSCAPES[0] }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {active && <View style={styles.activeBorder} />}
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category}</Text>
            </View>
            <Text style={styles.heartIcon}>♥</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          </View>
        </View>
      </Pressable>
    );
  }, [activeSoundscapeId, isPlaying, handlePress]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.appName}>Saved</Text>
        <Text style={styles.appTagline}>
          {favSounds.length === 0 ? 'your saved sounds' : `${favSounds.length} soundscape${favSounds.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {favSounds.length === 0 ? (
        <View style={[styles.empty, { paddingTop: insets.top + 120 }]}>
          <Text style={styles.emptySymbol}>♡</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
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
          contentContainerStyle={[
            styles.list,
            { paddingTop: insets.top + 100, paddingBottom: tabBarH + miniPlayerH + 16 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    paddingBottom: 14,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  appName: {
    fontSize: 28,
    fontWeight: '300',
    color: '#F5F0E8',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  appTagline: {
    fontSize: 12,
    color: '#6B6560',
    letterSpacing: 3,
    textTransform: 'lowercase',
  },
  list: {
    paddingHorizontal: 16,
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
    borderColor: '#C8B89A',
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptySymbol: {
    fontSize: 40,
    color: 'rgba(255,255,255,0.15)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  emptyDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
