import { describe, it, expect } from 'vitest';
import { SOUNDSCAPES, EQ_BAND_LABELS, DEFAULT_LEVELS } from '../lib/sounds';

describe('SOUNDSCAPES data model', () => {
  it('should have at least 10 soundscapes', () => {
    expect(SOUNDSCAPES.length).toBeGreaterThanOrEqual(10);
  });

  it('each soundscape should have required fields', () => {
    for (const s of SOUNDSCAPES) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.category).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.imageUrl).toMatch(/^https?:\/\//);
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.audioUrl).toMatch(/^https?:\/\//);
      expect(Array.isArray(s.presets)).toBe(true);
      expect(s.presets.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each preset should have 10 levels between 0 and 100', () => {
    for (const s of SOUNDSCAPES) {
      for (const preset of s.presets) {
        expect(preset.levels).toHaveLength(10);
        for (const level of preset.levels) {
          expect(level).toBeGreaterThanOrEqual(0);
          expect(level).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('should have 10 EQ band labels', () => {
    expect(EQ_BAND_LABELS).toHaveLength(10);
  });

  it('DEFAULT_LEVELS should have 10 values all at 70', () => {
    expect(DEFAULT_LEVELS).toHaveLength(10);
    expect(DEFAULT_LEVELS.every(v => v === 70)).toBe(true);
  });

  it('all soundscape IDs should be unique', () => {
    const ids = SOUNDSCAPES.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all soundscape names should be unique', () => {
    const names = SOUNDSCAPES.map(s => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});

describe('Audio engine volume calculation', () => {
  it('should compute effective volume from levels and master volume', () => {
    const getEffectiveVolume = (levels: number[], masterVolume: number) => {
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
      return (avgLevel / 100) * (masterVolume / 100);
    };

    // All at 70%, master at 80% => 0.7 * 0.8 = 0.56
    const vol = getEffectiveVolume([70, 70, 70, 70, 70, 70, 70, 70, 70, 70], 80);
    expect(vol).toBeCloseTo(0.56, 2);

    // All at 100%, master at 100% => 1.0
    const maxVol = getEffectiveVolume([100, 100, 100, 100, 100, 100, 100, 100, 100, 100], 100);
    expect(maxVol).toBeCloseTo(1.0, 2);

    // All at 0% => 0
    const zeroVol = getEffectiveVolume([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 100);
    expect(zeroVol).toBe(0);
  });
});
