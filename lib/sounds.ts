// Sound data model for Serenity app
// Each soundscape has a single looping audio track.
// The EQ sliders control a 10-band simulated mix (volume shaping).

export interface EQPreset {
  name: string;
  // 10 values, each 0-100 representing volume percentage for each band
  levels: [number, number, number, number, number, number, number, number, number, number];
}

export interface Soundscape {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  color: string;       // bright calming accent color (Pillowtalk-style)
  gradient: [string, string, string]; // subtle dark gradient for bg
  audioUrl: string;
  presets: EQPreset[];
}

// EQ band labels (10 bands)
export const EQ_BAND_LABELS = [
  'Sub', 'Bass', 'Lo', 'Mid-Lo', 'Mid',
  'Mid-Hi', 'Hi', 'Air', 'Bright', 'Shimmer',
];

// Default flat preset
export const DEFAULT_LEVELS: EQPreset['levels'] = [70, 70, 70, 70, 70, 70, 70, 70, 70, 70];

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    category: 'Rain',
    description: 'Soft rainfall on leaves and pavement.',
    imageUrl: '',
    color: '#7EC8E3',   // sky blue
    gradient: ['#050d12', '#071520', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2018/04/Gentle-rain-loop.mp3',
    presets: [
      { name: 'Drizzle',  levels: [20, 30, 50, 60, 65, 60, 55, 45, 35, 25] },
      { name: 'Steady',   levels: [40, 55, 65, 70, 70, 68, 62, 55, 45, 35] },
      { name: 'Downpour', levels: [70, 80, 85, 80, 75, 70, 65, 60, 55, 50] },
      { name: 'Focus',    levels: [30, 45, 60, 75, 80, 75, 65, 55, 40, 30] },
    ],
  },
  {
    id: 'heavy-rain',
    name: 'Heavy Rain',
    category: 'Rain',
    description: 'Intense rainfall with deep rumbling undertones.',
    imageUrl: '',
    color: '#A8C4E0',   // steel blue
    gradient: ['#060a12', '#0a1020', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2022/03/Heavy-rain-sound-effect-loop.mp3',
    presets: [
      { name: 'Storm',    levels: [85, 90, 85, 75, 65, 55, 45, 35, 30, 25] },
      { name: 'Monsoon',  levels: [70, 80, 80, 75, 70, 65, 60, 55, 50, 45] },
      { name: 'Muffled',  levels: [80, 85, 75, 60, 50, 40, 30, 25, 20, 15] },
      { name: 'Balanced', levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
  {
    id: 'thunder-rain',
    name: 'Thunderstorm',
    category: 'Storm',
    description: 'Rain and rolling thunder. Deep and dramatic.',
    imageUrl: '',
    color: '#C3A8E0',   // soft lavender
    gradient: ['#0a0612', '#100a20', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2021/01/Rain-and-thunder-sound-effect-loop.mp3',
    presets: [
      { name: 'Distant',  levels: [60, 65, 60, 55, 50, 45, 40, 35, 30, 25] },
      { name: 'Close',    levels: [90, 85, 75, 65, 55, 50, 45, 40, 35, 30] },
      { name: 'Rumble',   levels: [95, 90, 80, 65, 50, 40, 30, 25, 20, 15] },
      { name: 'Balanced', levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'Water',
    description: 'Rhythmic waves washing ashore. Calming and meditative.',
    imageUrl: '',
    color: '#7ED4C8',   // seafoam teal
    gradient: ['#041210', '#061e1a', '#000000'],
    audioUrl: 'https://orangefreesounds.com/wp-content/uploads/2022/07/Ocean-waves-sound-effect.mp3',
    presets: [
      { name: 'Calm Sea', levels: [30, 40, 55, 65, 70, 68, 62, 55, 45, 35] },
      { name: 'Surf',     levels: [50, 60, 70, 75, 72, 68, 62, 55, 48, 40] },
      { name: 'Deep',     levels: [80, 75, 65, 55, 45, 38, 30, 25, 20, 15] },
      { name: 'Shore',    levels: [25, 35, 50, 65, 75, 72, 65, 58, 50, 42] },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'Nature',
    description: 'Lush forest ambience with rustling leaves and birds.',
    imageUrl: '',
    color: '#A8D5A2',   // sage green
    gradient: ['#060e06', '#0a1a0a', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2017/09/Forest-ambience.mp3',
    presets: [
      { name: 'Dawn',    levels: [20, 30, 45, 60, 70, 75, 72, 65, 55, 45] },
      { name: 'Midday',  levels: [25, 35, 50, 65, 72, 75, 70, 65, 55, 45] },
      { name: 'Dusk',    levels: [35, 45, 58, 68, 70, 68, 62, 55, 45, 35] },
      { name: 'Deep',    levels: [45, 55, 65, 68, 65, 60, 55, 48, 40, 30] },
    ],
  },
  {
    id: 'birds',
    name: 'Birdsong',
    category: 'Nature',
    description: 'Cheerful birdsong in a peaceful outdoor setting.',
    imageUrl: '',
    color: '#F5D87A',   // warm yellow
    gradient: ['#120e02', '#1e1604', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2018/10/Birds-chirping-sound-effect.mp3',
    presets: [
      { name: 'Morning',  levels: [15, 20, 35, 55, 72, 80, 78, 72, 62, 52] },
      { name: 'Garden',   levels: [10, 18, 30, 50, 68, 78, 80, 75, 65, 55] },
      { name: 'Forest',   levels: [20, 28, 42, 58, 68, 72, 70, 65, 55, 45] },
      { name: 'Balanced', levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
  {
    id: 'campfire',
    name: 'Campfire',
    category: 'Fire',
    description: 'Crackling campfire with warm, enveloping tones.',
    imageUrl: '',
    color: '#F5A87A',   // warm peach/coral
    gradient: ['#120802', '#1e1004', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2017/10/Campfire-sound.mp3',
    presets: [
      { name: 'Embers',    levels: [55, 60, 65, 62, 58, 52, 45, 38, 30, 22] },
      { name: 'Crackling', levels: [40, 48, 58, 65, 68, 65, 60, 55, 48, 40] },
      { name: 'Roaring',   levels: [70, 75, 72, 68, 62, 55, 48, 42, 35, 28] },
      { name: 'Cozy',      levels: [60, 65, 68, 65, 60, 55, 50, 45, 38, 30] },
    ],
  },
  {
    id: 'wind',
    name: 'Wind',
    category: 'Wind',
    description: 'Gentle wind flowing through trees and open spaces.',
    imageUrl: '',
    color: '#D0E8C8',   // pale mint
    gradient: ['#0a0e0a', '#101610', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2014/11/Wind-sound.mp3',
    presets: [
      { name: 'Breeze',   levels: [15, 25, 40, 55, 65, 70, 68, 62, 52, 42] },
      { name: 'Gust',     levels: [35, 50, 62, 68, 65, 60, 55, 50, 42, 35] },
      { name: 'Howl',     levels: [55, 65, 70, 68, 62, 55, 48, 42, 35, 28] },
      { name: 'Balanced', levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
  {
    id: 'creek',
    name: 'Creek',
    category: 'Water',
    description: 'Babbling brook flowing over smooth stones.',
    imageUrl: '',
    color: '#7EDCE8',   // bright cyan
    gradient: ['#041214', '#061e20', '#000000'],
    audioUrl: 'https://orangefreesounds.com/wp-content/uploads/2024/08/Creek-sound-effect.mp3',
    presets: [
      { name: 'Trickle',  levels: [15, 22, 38, 55, 68, 75, 72, 65, 55, 45] },
      { name: 'Babble',   levels: [25, 35, 50, 65, 72, 75, 70, 62, 52, 42] },
      { name: 'Rush',     levels: [45, 55, 65, 70, 68, 62, 55, 48, 40, 32] },
      { name: 'Balanced', levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    category: 'Noise',
    description: 'Pure white noise for deep focus and blocking distractions.',
    imageUrl: '',
    color: '#E8E8E0',   // soft off-white
    gradient: ['#0e0e0e', '#141414', '#000000'],
    audioUrl: 'https://orangefreesounds.com/wp-content/uploads/2023/07/Free-white-noise.mp3',
    presets: [
      { name: 'Pure',     levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
      { name: 'Warm',     levels: [85, 80, 75, 70, 65, 60, 55, 50, 45, 40] },
      { name: 'Bright',   levels: [40, 45, 55, 65, 72, 78, 82, 85, 82, 78] },
      { name: 'Focus',    levels: [60, 65, 70, 75, 75, 72, 68, 62, 55, 48] },
    ],
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    category: 'Noise',
    description: 'Deep, warm brown noise. Richer and lower than white noise.',
    imageUrl: '',
    color: '#E8C87A',   // warm amber
    gradient: ['#120c02', '#1a1204', '#000000'],
    audioUrl: 'https://www.orangefreesounds.com/wp-content/uploads/2014/11/Brown-noise.mp3',
    presets: [
      { name: 'Deep',     levels: [95, 88, 78, 65, 52, 42, 32, 25, 20, 15] },
      { name: 'Warm',     levels: [85, 80, 72, 62, 52, 45, 38, 32, 28, 22] },
      { name: 'Balanced', levels: [75, 72, 68, 65, 62, 58, 55, 52, 48, 45] },
      { name: 'Sleep',    levels: [90, 85, 75, 62, 50, 40, 30, 22, 18, 12] },
    ],
  },
  {
    id: 'forest-stream',
    name: 'Forest Stream',
    category: 'Nature',
    description: 'Birds singing alongside a gentle forest stream.',
    imageUrl: '',
    color: '#B8E8A8',   // light green
    gradient: ['#081206', '#0e1e0a', '#000000'],
    audioUrl: 'https://orangefreesounds.com/wp-content/uploads/2026/02/Bird-calls-forest-stream-sound-effect.mp3',
    presets: [
      { name: 'Morning',   levels: [20, 30, 45, 60, 70, 75, 72, 68, 60, 50] },
      { name: 'Peaceful',  levels: [25, 35, 50, 62, 68, 70, 68, 62, 55, 45] },
      { name: 'Immersive', levels: [35, 45, 58, 68, 72, 70, 65, 58, 50, 40] },
      { name: 'Balanced',  levels: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70] },
    ],
  },
];
