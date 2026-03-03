import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES } from '@/lib/sounds';
import type { Soundscape } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const { layerAId, layerBId, layerAPlaying, layerBPlaying, playLayer, clearLayer } = useAudioEngine();

  // Tap → set Layer A and open mixer
  const handlePress = (sound: Soundscape) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playLayer('A', sound.id);
    router.push(`/mixer/${sound.id}` as any);
  };

  // Long-press → toggle Layer B
  const handleLongPress = (sound: Soundscape) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (layerBId === sound.id) {
      // Already Layer B — clear it
      clearLayer('B');
    } else {
      // Set as Layer B (can't be the same as Layer A)
      if (layerAId === sound.id) return; // silently ignore — same sound can't be both layers
      playLayer('B', sound.id);
    }
  };

  const handleToggleTheme = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleColorScheme();
  };

  const renderItem = ({ item, index }: { item: Soundscape; index: number }) => {
    const isLayerA = layerAId === item.id;
    const isLayerB = layerBId === item.id;
    const isActive = isLayerA || isLayerB;
    const isPlaying = (isLayerA && layerAPlaying) || (isLayerB && layerBPlaying);

    return (
      <Pressable
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={400}
        accessibilityRole="button"
        accessibilityLabel={
          isLayerA
            ? `${item.name}, Layer A, ${layerAPlaying ? 'playing' : 'paused'}. Long press to add as Layer B.`
            : isLayerB
            ? `${item.name}, Layer B, ${layerBPlaying ? 'playing' : 'paused'}. Long press to remove Layer B.`
            : `${item.name}, ${item.category}. Tap to play, long press to add as second layer.`
        }
        style={({ pressed }) => [
          styles.row,
          { borderBottomColor: C.border },
          pressed && { opacity: 0.5 },
        ]}
      >
        {/* Index number */}
        <Text style={[styles.rowIndex, { color: C.muted }]}>
          {String(index + 1).padStart(2, '0')}
        </Text>

        {/* Sound name */}
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

        {/* Right side: layer badge, playing dot, or category */}
        <View style={styles.rowRight}>
          {isLayerA || isLayerB ? (
            <View style={styles.badgeRow}>
              {isLayerA && (
                <View style={[styles.badge, { borderColor: C.text }]}>
                  <Text style={[styles.badgeText, { color: C.text }]}>A</Text>
                </View>
              )}
              {isLayerB && (
                <View style={[styles.badge, { borderColor: C.muted }]}>
                  <Text style={[styles.badgeText, { color: C.muted }]}>B</Text>
                </View>
              )}
              {isPlaying && (
                <View style={[styles.dot, { backgroundColor: C.text }]} />
              )}
            </View>
          ) : (
            <Text style={[styles.rowCategory, { color: C.muted }]}>
              {item.category.toUpperCase()}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appTitle, { color: C.text }]}>Serenity</Text>
          <Text style={[styles.appSubtitle, { color: C.muted }]}>TUNE YOUR MIND</Text>
        </View>
        <Pressable
          onPress={handleToggleTheme}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={({ pressed }) => [
            styles.themeToggle,
            { borderColor: C.border },
            pressed && { opacity: 0.5 },
          ]}
        >
          <IconSymbol
            name={isDark ? 'sun.max' : 'moon'}
            size={16}
            color={C.text}
          />
        </Pressable>
      </View>

      {/* Layer hint — only shown when a second layer is active */}
      {layerBId && (
        <View style={[styles.layerHint, { borderBottomColor: C.border }]}>
          <Text style={[styles.layerHintText, { color: C.muted }]}>
            LAYERING · LONG PRESS TO REMOVE LAYER B
          </Text>
        </View>
      )}

      {/* Sound list */}
      <FlatList
        data={SOUNDSCAPES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Color tokens ─────────────────────────────────────────────────────────────
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerLeft: {
    gap: 4,
  },
  themeToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    marginBottom: 2,
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
  layerHint: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  layerHintText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 14,
  },
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 11,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
