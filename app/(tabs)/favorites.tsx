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
  const miniPlayerH = activeSoundscapeId ? 74 : 0;

  const renderItem = useCallback(({ item }: { item: typeof SOUNDSCAPES[0] }) => {
    const active = activeSoundscapeId === item.id && isPlaying;
    return (
      <Pressable
        onPress={() => handlePress(item.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {active && <View style={[styles.activeBorder, { borderColor: item.color }]} />}
        <View style={[styles.glow, { backgroundColor: item.color }]} />

        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={[styles.categoryPill, { borderColor: `${item.color}30` }]}>
              <Text style={[styles.categoryPillText, { color: `${item.color}CC` }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.heartIcon, { color: item.color }]}>♥</Text>
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
        <Text style={styles.appName}>S A V E D</Text>
        <Text style={styles.appTagline}>
          {favSounds.length === 0
            ? 'your saved sounds'
            : `${favSounds.length} soundscape${favSounds.length !== 1 ? 's' : ''}`}
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
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  appName: {
    fontSize: 22,
    fontWeight: '300',
    color: '#F5F0E8',
    letterSpacing: 8,
    marginBottom: 3,
  },
  appTagline: {
    fontSize: 11,
    color: '#6B6560',
    letterSpacing: 3,
  },
  list: {
    paddingHorizontal: 16,
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptySymbol: {
    fontSize: 40,
    color: 'rgba(255,255,255,0.12)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  emptyDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
