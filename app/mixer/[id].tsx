import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  PanResponder,
} from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EQSlider } from '@/components/eq-slider';
import { TimerSheet } from '@/components/timer-sheet';
import { useAudioEngine } from '@/lib/audio-engine';
import { SOUNDSCAPES, EQ_BAND_LABELS } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

// ─── Horizontal Volume Slider ──────────────────────────────────────────────
// Renders a track + thumb with its own label row. No outer section header needed.
function VolumeSlider({
  label,
  value,
  onChange,
  isDark,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  isDark: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const C = isDark ? DARK : LIGHT;
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const lastHapticRef = useRef(value);

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => {
        const tw = trackWidthRef.current;
        if (tw > 0) {
          const next = clamp((e.nativeEvent.locationX / tw) * 100);
          lastHapticRef.current = next;
          onChange(next);
        }
        onDragStart?.();
      },
      onPanResponderMove: (e) => {
        const tw = trackWidthRef.current;
        if (tw <= 0) return;
        const next = clamp((e.nativeEvent.locationX / tw) * 100);
        if (Math.abs(next - lastHapticRef.current) >= 5 && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticRef.current = next;
        }
        onChange(next);
      },
      onPanResponderRelease: () => onDragEnd?.(),
      onPanResponderTerminate: () => onDragEnd?.(),
    })
  ).current;

  const THUMB = 14;
  const thumbLeft = trackWidth > 0
    ? Math.max(0, Math.min(trackWidth - THUMB, (value / 100) * trackWidth - THUMB / 2))
    : 0;

  return (
    <View style={volStyles.wrapper}>
      {/* Label row — this is the only header for this slider */}
      <View style={[volStyles.labelRow, { borderBottomColor: C.border }]}>
        <Text style={[volStyles.label, { color: C.muted }]}>{label}</Text>
        <Text style={[volStyles.valueText, { color: C.text }]}>{Math.round(value)}</Text>
      </View>
      {/* Track */}
      <View
        style={volStyles.trackWrap}
        accessibilityRole="adjustable"
        accessibilityLabel={`${label} volume, ${Math.round(value)} percent`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
        accessibilityHint="Drag left or right to adjust"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          setTrackWidth(w);
        }}
        {...panResponder.panHandlers}
      >
        <View style={[volStyles.trackBg, { backgroundColor: C.border }]} />
        <View style={[volStyles.trackFill, { width: `${value}%` as any, backgroundColor: C.text }]} />
        <View style={[volStyles.thumb, { left: thumbLeft, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: C.text }]} />
      </View>
    </View>
  );
}

const volStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 18,
  },
  trackWrap: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: StyleSheet.hairlineWidth,
  },
  thumb: {
    position: 'absolute',
    top: 16,
  },
});

// ─── Mixer Screen ────────────────────────────────────────────────────────────
export default function MixerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const {
    layerAId,
    layerBId,
    layerAVolume,
    layerBVolume,
    layerAPlaying,
    layerBPlaying,
    levels,
    favorites,
    timerEndTime,
    bellEnabled,
    bellIntervalMinutes,
    playLayer,
    clearLayer,
    pauseAll,
    resumeAll,
    setLevel,
    applyPreset,
    setLayerVolume,
    toggleFavorite,
    setBell,
  } = useAudioEngine();

  const [timerSheetVisible, setTimerSheetVisible] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // Controls whether the Layer B picker list is expanded
  const [layerPickerOpen, setLayerPickerOpen] = useState(false);

  const soundscape = SOUNDSCAPES.find(s => s.id === id);
  const isLayerA = layerAId === id;
  const isLayerB = layerBId === id;
  const isActive = isLayerA || isLayerB;
  const isFavorite = favorites.includes(id ?? '');

  const layerBSoundscape = layerBId ? SOUNDSCAPES.find(s => s.id === layerBId) : null;

  useKeepAwake();

  useEffect(() => {
    if (soundscape && !isActive) {
      playLayer('A', soundscape.id);
    }
  }, [soundscape?.id]);

  useEffect(() => {
    if (!timerEndTime) { setTimerRemaining(null); return; }
    const update = () => {
      const rem = timerEndTime - Date.now();
      if (rem <= 0) { setTimerRemaining(null); return; }
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setTimerRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [timerEndTime]);

  if (!soundscape) {
    return (
      <View style={[styles.container, { backgroundColor: C.bg }]}>
        <Text style={{ color: C.text, padding: 24 }}>Sound not found.</Text>
      </View>
    );
  }

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const anyPlaying = layerAPlaying || layerBPlaying;
    if (anyPlaying) pauseAll();
    else resumeAll();
  };

  const currentLevels = isLayerA ? levels : soundscape.presets[0].levels;
  const playing = layerAPlaying || layerBPlaying;

  // Sounds available to pick as Layer B (exclude the current Layer A sound)
  const layerBOptions = SOUNDSCAPES.filter(s => s.id !== id);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Top navigation bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10, borderBottomColor: C.border }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.4 }]}
        >
          <IconSymbol name="chevron.left" size={20} color={C.muted} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setTimerSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={timerRemaining ? `Sleep timer: ${timerRemaining} remaining` : 'Set sleep timer'}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.4 }]}
          >
            {timerRemaining
              ? <Text style={[styles.timerText, { color: C.text }]}>{timerRemaining}</Text>
              : <IconSymbol name="timer" size={20} color={C.muted} />
            }
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(soundscape.id);
            }}
            accessibilityRole="togglebutton"
            accessibilityLabel={isFavorite ? 'Remove from saved' : 'Save sound'}
            accessibilityState={{ checked: isFavorite }}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.4 }]}
          >
            <Text style={[styles.heartBtn, { color: isFavorite ? C.text : C.muted }]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        {/* Hero block */}
        <View style={[styles.heroBlock, { borderBottomColor: C.border }]}>
          <Text style={[styles.categoryLabel, { color: C.muted }]}>
            {soundscape.category.toUpperCase()}
          </Text>
          <Text style={[styles.soundName, { color: C.text }]} accessibilityRole="header">
            {soundscape.name}
          </Text>
          <Text style={[styles.soundDesc, { color: C.muted }]}>{soundscape.description}</Text>

          <Pressable
            onPress={handlePlayPause}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause all layers' : 'Resume all layers'}
            accessibilityState={{ selected: playing }}
            style={({ pressed }) => [
              styles.playBtn,
              { borderColor: C.border },
              playing && { backgroundColor: C.text, borderColor: C.text },
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol
              name={playing ? 'pause.fill' : 'play.fill'}
              size={16}
              color={playing ? C.bg : C.text}
            />
            <Text style={[styles.playLabel, { color: playing ? C.bg : C.text }]}>
              {playing ? 'PAUSE' : 'PLAY'}
            </Text>
          </Pressable>
        </View>

        {/* EQ Sliders */}
        <View style={[styles.sectionHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>MIX</Text>
          <Text style={[styles.sectionSub, { color: C.muted }]}>Shape the sound</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slidersRow}
          style={styles.slidersScroll}
          accessibilityRole="adjustable"
          accessibilityLabel="Sound equalizer"
        >
          {EQ_BAND_LABELS.map((label, i) => (
            <EQSlider
              key={label}
              label={label}
              value={currentLevels[i] ?? 70}
              accentColor={C.text}
              onChange={(val) => setLevel(i, val)}
            />
          ))}
        </ScrollView>

        {/* Presets */}
        <View style={[styles.sectionHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>PRESETS</Text>
        </View>
        <View style={styles.presetsRow}>
          {soundscape.presets.map((preset) => (
            <Pressable
              key={preset.name}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                applyPreset(preset);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Apply ${preset.name} preset`}
              style={({ pressed }) => [
                styles.presetChip,
                { borderColor: C.border },
                pressed && { opacity: 0.5 },
              ]}
            >
              <Text style={[styles.presetText, { color: C.text }]}>{preset.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Meditation Bell */}
        <View style={[styles.sectionHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>BELL</Text>
          <Text style={[styles.sectionSub, { color: C.muted }]}>Chimes at set intervals</Text>
        </View>

        <View style={styles.bellRow}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setBell(!bellEnabled, bellIntervalMinutes ?? 10);
            }}
            accessibilityRole="switch"
            accessibilityLabel={bellEnabled ? 'Bell enabled, tap to disable' : 'Bell disabled, tap to enable'}
            accessibilityState={{ checked: bellEnabled }}
            style={({ pressed }) => [
              styles.bellToggleBtn,
              { borderColor: C.border },
              bellEnabled && { backgroundColor: C.text, borderColor: C.text },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.bellToggleLabel, { color: bellEnabled ? C.bg : C.text }]}>
              {bellEnabled ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          {bellEnabled && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bellIntervalScroll}>
              <View style={styles.bellIntervals}>
                {[1, 5, 10, 15, 20, 30].map((mins) => (
                  <Pressable
                    key={mins}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setBell(true, mins);
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={`Bell every ${mins} minutes`}
                    accessibilityState={{ checked: bellIntervalMinutes === mins }}
                    style={({ pressed }) => [
                      styles.bellChip,
                      { borderColor: C.border },
                      bellIntervalMinutes === mins && { backgroundColor: C.text, borderColor: C.text },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={[
                      styles.bellChipText,
                      { color: bellIntervalMinutes === mins ? C.bg : C.text },
                    ]}>
                      {mins}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ─── Volume ─────────────────────────────────────────────────── */}
        {/* Layer A volume slider — label comes from inside VolumeSlider, no extra header */}
        <VolumeSlider
          label="VOLUME"
          value={isLayerA ? layerAVolume : 80}
          onChange={(v) => setLayerVolume('A', v)}
          isDark={isDark}
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
        />

        {/* Layer B volume slider — only shown when a second layer is active */}
        {layerBSoundscape && (
          <View style={styles.layerBBlock}>
            <VolumeSlider
              label={`LAYER B · ${layerBSoundscape.name.toUpperCase()}`}
              value={layerBVolume}
              onChange={(v) => setLayerVolume('B', v)}
              isDark={isDark}
              onDragStart={() => setScrollEnabled(false)}
              onDragEnd={() => setScrollEnabled(true)}
            />
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                clearLayer('B');
                setLayerPickerOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${layerBSoundscape.name} from Layer B`}
              style={({ pressed }) => [
                styles.removeLayerBtn,
                { borderColor: C.border },
                pressed && { opacity: 0.5 },
              ]}
            >
              <Text style={[styles.removeLayerText, { color: C.muted }]}>REMOVE LAYER B</Text>
            </Pressable>
          </View>
        )}

        {/* ─── Layer B Picker ──────────────────────────────────────────── */}
        {!layerBSoundscape && (
          <>
            <View style={[styles.sectionHeader, { borderBottomColor: C.border, marginTop: 8 }]}>
              <Text style={[styles.sectionLabel, { color: C.muted }]}>LAYER B</Text>
              <Text style={[styles.sectionSub, { color: C.muted }]}>Add a second sound</Text>
            </View>

            {/* Toggle button to show/hide the picker list */}
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLayerPickerOpen(prev => !prev);
              }}
              accessibilityRole="button"
              accessibilityLabel={layerPickerOpen ? 'Close sound picker' : 'Pick a second sound to layer'}
              style={({ pressed }) => [
                styles.addLayerBtn,
                { borderColor: C.border },
                layerPickerOpen && { backgroundColor: C.text, borderColor: C.text },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.addLayerText, { color: layerPickerOpen ? C.bg : C.text }]}>
                {layerPickerOpen ? 'CANCEL' : '+ ADD LAYER'}
              </Text>
            </Pressable>

            {/* Sound list */}
            {layerPickerOpen && (
              <View style={[styles.pickerList, { borderColor: C.border }]}>
                {layerBOptions.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      playLayer('B', s.id);
                      setLayerPickerOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${s.name} as Layer B`}
                    style={({ pressed }) => [
                      styles.pickerRow,
                      { borderBottomColor: C.border },
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={[styles.pickerName, { color: C.text }]}>{s.name}</Text>
                    <Text style={[styles.pickerCategory, { color: C.muted }]}>
                      {s.category.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Timer Sheet */}
      <TimerSheet
        visible={timerSheetVisible}
        onClose={() => setTimerSheetVisible(false)}
        accentColor={isDark ? '#FFFFFF' : '#000000'}
      />
    </View>
  );
}

// ─── Color tokens ──────────────────────────────────────────────────────────
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
    minWidth: 36,
    textAlign: 'center',
  },
  heartBtn: {
    fontSize: 20,
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  heroBlock: {
    paddingVertical: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  soundName: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 48,
    fontWeight: '400',
    letterSpacing: -1,
    lineHeight: 54,
  },
  soundDesc: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.1,
    marginTop: 4,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  playLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  sectionHeader: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  slidersScroll: {
    marginHorizontal: -24,
    marginBottom: 8,
  },
  slidersRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
  },
  presetText: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  bellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  bellToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  bellToggleLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  bellIntervalScroll: {
    flex: 1,
  },
  bellIntervals: {
    flexDirection: 'row',
    gap: 8,
  },
  bellChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellChipText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 18,
  },
  // Layer B
  layerBBlock: {
    marginTop: 8,
    marginBottom: 8,
  },
  removeLayerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
  },
  removeLayerText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  addLayerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 16,
  },
  addLayerText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    lineHeight: 16,
  },
  pickerList: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  pickerName: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.2,
    lineHeight: 24,
    flex: 1,
  },
  pickerCategory: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 14,
  },
});
