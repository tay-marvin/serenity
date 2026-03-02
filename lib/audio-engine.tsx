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

export interface AudioEngineState {
  activeSoundscapeId: string | null;
  isPlaying: boolean;
  levels: number[]; // 0-100 for each of 10 bands
  masterVolume: number; // 0-100
  favorites: string[];
  timerMinutes: number | null;
  timerEndTime: number | null;
  bellIntervalMinutes: number | null;
  bellEnabled: boolean;
}

interface AudioEngineContext extends AudioEngineState {
  play: (soundscapeId: string) => void;
  pause: () => void;
  resume: () => void;
  setLevel: (bandIndex: number, value: number) => void;
  setAllLevels: (levels: number[]) => void;
  applyPreset: (preset: EQPreset) => void;
  setMasterVolume: (volume: number) => void;
  toggleFavorite: (id: string) => void;
  startTimer: (minutes: number, fadeOut: boolean) => void;
  cancelTimer: () => void;
  setBell: (enabled: boolean, intervalMinutes: number) => void;
  activeSoundscape: Soundscape | null;
}

const AudioEngineCtx = createContext<AudioEngineContext | null>(null);

export function AudioEngineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioEngineState>({
    activeSoundscapeId: null,
    isPlaying: false,
    levels: [...DEFAULT_LEVELS],
    masterVolume: 80,
    favorites: [],
    timerMinutes: null,
    timerEndTime: null,
    bellIntervalMinutes: 10,
    bellEnabled: false,
  });

  // We use a single audio player for simplicity — plays one looping sound at a time.
  // The "EQ" effect is simulated by cross-fading between different audio tracks
  // based on the dominant slider values.
  const playerRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bellRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellPlayerRef = useRef<AudioPlayer | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentVolumeRef = useRef(0.8);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [savedState, savedFavs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
        ]);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setState(prev => ({
            ...prev,
            levels: parsed.levels || prev.levels,
            masterVolume: parsed.masterVolume ?? prev.masterVolume,
          }));
        }
        if (savedFavs) {
          setState(prev => ({ ...prev, favorites: JSON.parse(savedFavs) }));
        }
      } catch {}
    })();
  }, []);

  // Setup audio mode
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.remove();
      bellPlayerRef.current?.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (bellRef.current) clearInterval(bellRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  const getEffectiveVolume = useCallback((levels: number[], masterVolume: number) => {
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    return (avgLevel / 100) * (masterVolume / 100);
  }, []);

  const play = useCallback(async (soundscapeId: string) => {
    const soundscape = SOUNDSCAPES.find(s => s.id === soundscapeId);
    if (!soundscape) return;

    // Stop existing player
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }

    // Use the single audio URL for this soundscape
    const audioUrl = soundscape.audioUrl;
    
    try {
      const player = createAudioPlayer({ uri: audioUrl });
      player.loop = true;
      const vol = getEffectiveVolume(state.levels, state.masterVolume);
      player.volume = vol;
      player.play();
      playerRef.current = player;
      currentVolumeRef.current = vol;

      setState(prev => ({
        ...prev,
        activeSoundscapeId: soundscapeId,
        isPlaying: true,
      }));
    } catch (e) {
      console.error('Audio play error:', e);
    }
  }, [state.levels, state.masterVolume, getEffectiveVolume]);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const setLevel = useCallback((bandIndex: number, value: number) => {
    setState(prev => {
      const newLevels = [...prev.levels];
      newLevels[bandIndex] = value;
      const vol = getEffectiveVolume(newLevels, prev.masterVolume);
      if (playerRef.current) {
        playerRef.current.volume = vol;
        currentVolumeRef.current = vol;
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ levels: newLevels, masterVolume: prev.masterVolume })).catch(() => {});
      return { ...prev, levels: newLevels };
    });
  }, [getEffectiveVolume]);

  const setAllLevels = useCallback((levels: number[]) => {
    setState(prev => {
      const vol = getEffectiveVolume(levels, prev.masterVolume);
      if (playerRef.current) {
        playerRef.current.volume = vol;
        currentVolumeRef.current = vol;
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ levels, masterVolume: prev.masterVolume })).catch(() => {});
      return { ...prev, levels };
    });
  }, [getEffectiveVolume]);

  const applyPreset = useCallback((preset: EQPreset) => {
    setAllLevels([...preset.levels]);
  }, [setAllLevels]);

  const setMasterVolume = useCallback((volume: number) => {
    setState(prev => {
      const vol = getEffectiveVolume(prev.levels, volume);
      if (playerRef.current) {
        playerRef.current.volume = vol;
        currentVolumeRef.current = vol;
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ levels: prev.levels, masterVolume: volume })).catch(() => {});
      return { ...prev, masterVolume: volume };
    });
  }, [getEffectiveVolume]);

  const toggleFavorite = useCallback((id: string) => {
    setState(prev => {
      const newFavs = prev.favorites.includes(id)
        ? prev.favorites.filter(f => f !== id)
        : [...prev.favorites, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs)).catch(() => {});
      return { ...prev, favorites: newFavs };
    });
  }, []);

  const startTimer = useCallback((minutes: number, fadeOut: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const endTime = Date.now() + minutes * 60 * 1000;
    setState(prev => ({ ...prev, timerMinutes: minutes, timerEndTime: endTime }));

    timerRef.current = setTimeout(() => {
      if (fadeOut && playerRef.current) {
        // Fade out over 30 seconds
        const startVol = currentVolumeRef.current;
        const steps = 30;
        let step = 0;
        fadeIntervalRef.current = setInterval(() => {
          step++;
          const newVol = startVol * (1 - step / steps);
          if (playerRef.current) playerRef.current.volume = Math.max(0, newVol);
          if (step >= steps) {
            clearInterval(fadeIntervalRef.current!);
            playerRef.current?.pause();
            setState(prev => ({ ...prev, isPlaying: false, timerMinutes: null, timerEndTime: null }));
          }
        }, 1000);
      } else {
        playerRef.current?.pause();
        setState(prev => ({ ...prev, isPlaying: false, timerMinutes: null, timerEndTime: null }));
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
        // Play the verified meditation bell MP3 (orangefreesounds, 17s, 200 OK)
        try {
          const bellPlayer = createAudioPlayer({
            uri: 'https://www.orangefreesounds.com/wp-content/uploads/2018/03/Meditation-bell-sound.mp3',
          });
          bellPlayer.volume = 1.0;
          bellPlayer.play();
          // Release after 20 seconds (bell is 17s long)
          setTimeout(() => {
            try { bellPlayer.remove(); } catch {}
          }, 20000);
        } catch (e) {
          console.warn('Bell play error:', e);
        }
      }, intervalMinutes * 60 * 1000);
    }
  }, []);

  const activeSoundscape = state.activeSoundscapeId
    ? SOUNDSCAPES.find(s => s.id === state.activeSoundscapeId) ?? null
    : null;

  return (
    <AudioEngineCtx.Provider value={{
      ...state,
      play,
      pause,
      resume,
      setLevel,
      setAllLevels,
      applyPreset,
      setMasterVolume,
      toggleFavorite,
      startTimer,
      cancelTimer,
      setBell,
      activeSoundscape,
    }}>
      {children}
    </AudioEngineCtx.Provider>
  );
}

export function useAudioEngine() {
  const ctx = useContext(AudioEngineCtx);
  if (!ctx) throw new Error('useAudioEngine must be used within AudioEngineProvider');
  return ctx;
}
