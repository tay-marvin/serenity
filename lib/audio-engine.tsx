import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { SOUNDSCAPES, DEFAULT_LEVELS, type Soundscape, type EQPreset } from './sounds';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'serenity_state';
const FAVORITES_KEY = 'serenity_favorites';
const MIXES_KEY = 'serenity_mixes';

// App icon URL used as lock screen artwork
const APP_ARTWORK_URL =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663324303301/BrTNGmudEFZLSEsVVpNvpk/serenity-icon-GThH38iQV33v9GWNBuPiQY.png';

export type LayerSlot = 'A' | 'B';

// ─── SavedMix type ───────────────────────────────────────────────────────────
export interface SavedMix {
  id: string;          // uuid-style timestamp
  name: string;        // user-provided name
  layerAId: string;    // required — Layer A sound id
  layerBId: string | null; // optional — Layer B sound id
  layerAVolume: number; // 0-100
  layerBVolume: number; // 0-100
  createdAt: number;   // Date.now()
}

export interface AudioEngineState {
  // Layer A — primary sound
  layerAId: string | null;
  layerAVolume: number; // 0-100
  layerAPlaying: boolean;
  // Layer B — secondary sound
  layerBId: string | null;
  layerBVolume: number; // 0-100
  layerBPlaying: boolean;
  // Shared EQ levels (applied to Layer A)
  levels: number[]; // 0-100 for each of 10 bands
  favorites: string[];
  savedMixes: SavedMix[];
  timerMinutes: number | null;
  timerEndTime: number | null;
  bellIntervalMinutes: number | null;
  bellEnabled: boolean;
}

interface AudioEngineContext extends AudioEngineState {
  // Layer control
  playLayer: (slot: LayerSlot, soundscapeId: string) => void;
  clearLayer: (slot: LayerSlot) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  setLayerVolume: (slot: LayerSlot, volume: number) => void;
  // EQ (applied to Layer A)
  setLevel: (bandIndex: number, value: number) => void;
  setAllLevels: (levels: number[]) => void;
  applyPreset: (preset: EQPreset) => void;
  // Saved mixes
  saveMix: (name: string) => SavedMix | null;
  deleteMix: (id: string) => void;
  loadMix: (mix: SavedMix) => void;
  // Misc
  toggleFavorite: (id: string) => void;
  startTimer: (minutes: number, fadeOut: boolean) => void;
  cancelTimer: () => void;
  setBell: (enabled: boolean, intervalMinutes: number) => void;
  // Derived helpers
  activeSoundscape: Soundscape | null;
  isPlaying: boolean;
  activeSoundscapeId: string | null;
  masterVolume: number;
  // Legacy aliases
  play: (id: string) => void;
  pause: () => void;
  resume: () => void;
  setMasterVolume: (v: number) => void;
}

const AudioEngineCtx = createContext<AudioEngineContext | null>(null);

export function AudioEngineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioEngineState>({
    layerAId: null,
    layerAVolume: 80,
    layerAPlaying: false,
    layerBId: null,
    layerBVolume: 60,
    layerBPlaying: false,
    levels: [...DEFAULT_LEVELS],
    favorites: [],
    savedMixes: [],
    timerMinutes: null,
    timerEndTime: null,
    bellIntervalMinutes: 10,
    bellEnabled: false,
  });

  const playerARef = useRef<AudioPlayer | null>(null);
  const playerBRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bellRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellPlayerRef = useRef<AudioPlayer | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentVolumeARef = useRef(0.8);
  const currentVolumeBRef = useRef(0.6);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [savedState, savedFavs, savedMixesRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(MIXES_KEY),
        ]);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setState(prev => ({
            ...prev,
            levels: parsed.levels || prev.levels,
            layerAVolume: parsed.layerAVolume ?? parsed.masterVolume ?? prev.layerAVolume,
            layerBVolume: parsed.layerBVolume ?? prev.layerBVolume,
          }));
        }
        if (savedFavs) {
          setState(prev => ({ ...prev, favorites: JSON.parse(savedFavs) }));
        }
        if (savedMixesRaw) {
          setState(prev => ({ ...prev, savedMixes: JSON.parse(savedMixesRaw) }));
        }
      } catch {}
    })();
  }, []);

  // Setup audio mode
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      }).catch(() => {});
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerARef.current && Platform.OS !== 'web') {
        try { playerARef.current.setActiveForLockScreen(false); } catch {}
      }
      playerARef.current?.remove();
      playerBRef.current?.remove();
      bellPlayerRef.current?.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (bellRef.current) clearInterval(bellRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  const getEffectiveVolume = useCallback((levels: number[], volume: number) => {
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    return (avgLevel / 100) * (volume / 100);
  }, []);

  const activateLockScreen = useCallback((player: AudioPlayer, soundscape: Soundscape) => {
    if (Platform.OS === 'web') return;
    try {
      player.setActiveForLockScreen(true, {
        title: soundscape.name,
        artist: 'Serenity',
        albumTitle: soundscape.category,
        artworkUrl: APP_ARTWORK_URL,
      });
    } catch (e) {
      console.warn('Lock screen activation failed:', e);
    }
  }, []);

  const playLayer = useCallback(async (slot: LayerSlot, soundscapeId: string) => {
    const soundscape = SOUNDSCAPES.find(s => s.id === soundscapeId);
    if (!soundscape) return;

    const playerRef = slot === 'A' ? playerARef : playerBRef;
    const volumeRef = slot === 'A' ? currentVolumeARef : currentVolumeBRef;

    if (playerRef.current && Platform.OS !== 'web') {
      try { playerRef.current.setActiveForLockScreen(false); } catch {}
    }
    playerRef.current?.remove();
    playerRef.current = null;

    try {
      const player = createAudioPlayer({ uri: soundscape.audioUrl });
      player.loop = true;

      const vol = slot === 'A'
        ? getEffectiveVolume(state.levels, state.layerAVolume)
        : state.layerBVolume / 100;

      player.volume = vol;
      player.play();
      playerRef.current = player;
      volumeRef.current = vol;

      if (slot === 'A') {
        activateLockScreen(player, soundscape);
      }

      setState(prev => ({
        ...prev,
        ...(slot === 'A'
          ? { layerAId: soundscapeId, layerAPlaying: true }
          : { layerBId: soundscapeId, layerBPlaying: true }),
      }));
    } catch (e) {
      console.error('Audio play error:', e);
    }
  }, [state.levels, state.layerAVolume, state.layerBVolume, getEffectiveVolume, activateLockScreen]);

  const clearLayer = useCallback((slot: LayerSlot) => {
    const playerRef = slot === 'A' ? playerARef : playerBRef;
    if (playerRef.current && Platform.OS !== 'web' && slot === 'A') {
      try { playerRef.current.setActiveForLockScreen(false); } catch {}
    }
    playerRef.current?.remove();
    playerRef.current = null;
    setState(prev => ({
      ...prev,
      ...(slot === 'A'
        ? { layerAId: null, layerAPlaying: false }
        : { layerBId: null, layerBPlaying: false }),
    }));
  }, []);

  const pauseAll = useCallback(() => {
    playerARef.current?.pause();
    playerBRef.current?.pause();
    setState(prev => ({ ...prev, layerAPlaying: false, layerBPlaying: false }));
  }, []);

  const resumeAll = useCallback(() => {
    if (playerARef.current) {
      playerARef.current.play();
      const id = state.layerAId;
      if (id && Platform.OS !== 'web') {
        const soundscape = SOUNDSCAPES.find(s => s.id === id);
        if (soundscape && playerARef.current) {
          activateLockScreen(playerARef.current, soundscape);
        }
      }
    }
    if (playerBRef.current) playerBRef.current.play();
    setState(prev => ({
      ...prev,
      layerAPlaying: !!playerARef.current,
      layerBPlaying: !!playerBRef.current,
    }));
  }, [state.layerAId, activateLockScreen]);

  const setLayerVolume = useCallback((slot: LayerSlot, volume: number) => {
    setState(prev => {
      const newState = { ...prev };
      if (slot === 'A') {
        newState.layerAVolume = volume;
        const vol = getEffectiveVolume(prev.levels, volume);
        if (playerARef.current) {
          playerARef.current.volume = vol;
          currentVolumeARef.current = vol;
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          levels: prev.levels,
          layerAVolume: volume,
          layerBVolume: prev.layerBVolume,
        })).catch(() => {});
      } else {
        newState.layerBVolume = volume;
        const vol = volume / 100;
        if (playerBRef.current) {
          playerBRef.current.volume = vol;
          currentVolumeBRef.current = vol;
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          levels: prev.levels,
          layerAVolume: prev.layerAVolume,
          layerBVolume: volume,
        })).catch(() => {});
      }
      return newState;
    });
  }, [getEffectiveVolume]);

  const setLevel = useCallback((bandIndex: number, value: number) => {
    setState(prev => {
      const newLevels = [...prev.levels];
      newLevels[bandIndex] = value;
      const vol = getEffectiveVolume(newLevels, prev.layerAVolume);
      if (playerARef.current) {
        playerARef.current.volume = vol;
        currentVolumeARef.current = vol;
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        levels: newLevels,
        layerAVolume: prev.layerAVolume,
        layerBVolume: prev.layerBVolume,
      })).catch(() => {});
      return { ...prev, levels: newLevels };
    });
  }, [getEffectiveVolume]);

  const setAllLevels = useCallback((levels: number[]) => {
    setState(prev => {
      const vol = getEffectiveVolume(levels, prev.layerAVolume);
      if (playerARef.current) {
        playerARef.current.volume = vol;
        currentVolumeARef.current = vol;
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        levels,
        layerAVolume: prev.layerAVolume,
        layerBVolume: prev.layerBVolume,
      })).catch(() => {});
      return { ...prev, levels };
    });
  }, [getEffectiveVolume]);

  const applyPreset = useCallback((preset: EQPreset) => {
    setAllLevels([...preset.levels]);
  }, [setAllLevels]);

  const toggleFavorite = useCallback((id: string) => {
    setState(prev => {
      const newFavs = prev.favorites.includes(id)
        ? prev.favorites.filter(f => f !== id)
        : [...prev.favorites, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs)).catch(() => {});
      return { ...prev, favorites: newFavs };
    });
  }, []);

  // ─── Saved Mixes ───────────────────────────────────────────────────────────

  const saveMix = useCallback((name: string): SavedMix | null => {
    // Require at least Layer A to be loaded
    if (!state.layerAId) return null;
    const mix: SavedMix = {
      id: `mix_${Date.now()}`,
      name: name.trim() || 'My Mix',
      layerAId: state.layerAId,
      layerBId: state.layerBId,
      layerAVolume: state.layerAVolume,
      layerBVolume: state.layerBVolume,
      createdAt: Date.now(),
    };
    setState(prev => {
      const newMixes = [mix, ...prev.savedMixes];
      AsyncStorage.setItem(MIXES_KEY, JSON.stringify(newMixes)).catch(() => {});
      return { ...prev, savedMixes: newMixes };
    });
    return mix;
  }, [state.layerAId, state.layerBId, state.layerAVolume, state.layerBVolume]);

  const deleteMix = useCallback((id: string) => {
    setState(prev => {
      const newMixes = prev.savedMixes.filter(m => m.id !== id);
      AsyncStorage.setItem(MIXES_KEY, JSON.stringify(newMixes)).catch(() => {});
      return { ...prev, savedMixes: newMixes };
    });
  }, []);

  // loadMix plays both layers and sets volumes — does NOT navigate
  const loadMix = useCallback((mix: SavedMix) => {
    playLayer('A', mix.layerAId);
    if (mix.layerBId) {
      playLayer('B', mix.layerBId);
    } else {
      clearLayer('B');
    }
    // Volumes are set after a short delay so players are initialised
    setTimeout(() => {
      setLayerVolume('A', mix.layerAVolume);
      setLayerVolume('B', mix.layerBVolume);
    }, 300);
  }, [playLayer, clearLayer, setLayerVolume]);

  // ─── Timer / Bell ─────────────────────────────────────────────────────────

  const startTimer = useCallback((minutes: number, fadeOut: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const endTime = Date.now() + minutes * 60 * 1000;
    setState(prev => ({ ...prev, timerMinutes: minutes, timerEndTime: endTime }));

    timerRef.current = setTimeout(() => {
      if (fadeOut) {
        const startVolA = currentVolumeARef.current;
        const startVolB = currentVolumeBRef.current;
        const steps = 30;
        let step = 0;
        fadeIntervalRef.current = setInterval(() => {
          step++;
          const factor = Math.max(0, 1 - step / steps);
          if (playerARef.current) playerARef.current.volume = startVolA * factor;
          if (playerBRef.current) playerBRef.current.volume = startVolB * factor;
          if (step >= steps) {
            clearInterval(fadeIntervalRef.current!);
            if (playerARef.current && Platform.OS !== 'web') {
              try { playerARef.current.setActiveForLockScreen(false); } catch {}
            }
            playerARef.current?.pause();
            playerBRef.current?.pause();
            setState(prev => ({
              ...prev,
              layerAPlaying: false,
              layerBPlaying: false,
              timerMinutes: null,
              timerEndTime: null,
            }));
          }
        }, 1000);
      } else {
        if (playerARef.current && Platform.OS !== 'web') {
          try { playerARef.current.setActiveForLockScreen(false); } catch {}
        }
        playerARef.current?.pause();
        playerBRef.current?.pause();
        setState(prev => ({
          ...prev,
          layerAPlaying: false,
          layerBPlaying: false,
          timerMinutes: null,
          timerEndTime: null,
        }));
      }
    }, minutes * 60 * 1000);
  }, []);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    setState(prev => ({ ...prev, timerMinutes: null, timerEndTime: null }));
  }, []);

  const setBell = useCallback((enabled: boolean, intervalMinutes: number) => {
    if (bellRef.current) clearInterval(bellRef.current);
    setState(prev => ({ ...prev, bellEnabled: enabled, bellIntervalMinutes: intervalMinutes }));

    if (enabled) {
      bellRef.current = setInterval(() => {
        try {
          const bellPlayer = createAudioPlayer({
            uri: 'https://www.orangefreesounds.com/wp-content/uploads/2018/03/Meditation-bell-sound.mp3',
          });
          bellPlayer.volume = 1.0;
          bellPlayer.play();
          setTimeout(() => {
            try { bellPlayer.remove(); } catch {}
          }, 20000);
        } catch (e) {
          console.warn('Bell play error:', e);
        }
      }, intervalMinutes * 60 * 1000);
    }
  }, []);

  // Derived backward-compat values
  const activeSoundscape = state.layerAId
    ? SOUNDSCAPES.find(s => s.id === state.layerAId) ?? null
    : null;
  const isPlaying = state.layerAPlaying || state.layerBPlaying;

  return (
    <AudioEngineCtx.Provider value={{
      ...state,
      playLayer,
      clearLayer,
      pauseAll,
      resumeAll,
      setLayerVolume,
      setLevel,
      setAllLevels,
      applyPreset,
      saveMix,
      deleteMix,
      loadMix,
      toggleFavorite,
      startTimer,
      cancelTimer,
      setBell,
      activeSoundscape,
      isPlaying,
      activeSoundscapeId: state.layerAId,
      masterVolume: state.layerAVolume,
      play: (id: string) => playLayer('A', id),
      pause: pauseAll,
      resume: resumeAll,
      setMasterVolume: (v: number) => setLayerVolume('A', v),
    } as any}>
      {children}
    </AudioEngineCtx.Provider>
  );
}

export function useAudioEngine() {
  const ctx = useContext(AudioEngineCtx);
  if (!ctx) throw new Error('useAudioEngine must be used within AudioEngineProvider');
  return ctx;
}
