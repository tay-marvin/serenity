# Serenity — Design Document

## Overview

Serenity is a dark, minimal iOS ambient sound tuner for meditation and sleep. The visual language draws from the Pillowtalk aesthetic: deep near-black backgrounds, soft glowing accents, frosted glass surfaces, and smooth spring animations. Every screen is designed for one-handed use in portrait orientation.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#080810` | Full-screen base |
| Surface | `#12121E` | Cards, bottom sheets |
| Surface Elevated | `#1C1C2E` | Sliders, controls |
| Primary (Violet) | `#7C3AED` | Active states, play button |
| Primary Light | `#A78BFA` | Slider fills, accent text |
| Teal Accent | `#06B6D4` | Secondary highlights |
| Foreground | `#F0F0FF` | Primary text |
| Muted | `#6B7280` | Secondary text, labels |
| Border | `#1E1E30` | Dividers |

---

## Screen List

### 1. Home / Sound Library Screen
The entry point. Shows a curated grid of soundscape cards. Each card features a full-bleed nature image, the soundscape name, and a subtle play indicator.

**Content:**
- App title "Serenity" at the top with a soft glow
- 2-column grid of soundscape cards (Rain, Forest, Ocean, Fire, Wind, Thunder, River, Jungle, Cafe, Space)
- Each card: background image + frosted glass label + category tag
- Currently playing mini-player bar at the bottom (persistent)

**Functionality:**
- Tap card → navigates to Mixer screen for that soundscape
- Mini-player shows current sound name + play/pause toggle

### 2. Mixer Screen (Main Feature)
The core experience. Full-screen immersive view with the soundscape's background image, 10 vertical EQ sliders, and preset buttons.

**Content:**
- Full-bleed background image (blurred, darkened)
- Soundscape name + category in large type
- 10 vertical sliders labeled: Sub, Bass, Lo-Mid, Mid, Hi-Mid, Treble, Air, Presence, Body, Shimmer
- Slider fill color glows from violet to teal based on value
- Preset chips row: Light, Steady, Heavy, Distant, Custom
- Master volume knob (circular, bottom center)
- Play/Pause button (large, glowing)
- Timer button (top right)
- Back button (top left)

**Functionality:**
- Drag sliders up/down to adjust each frequency band volume
- Tap preset chips to snap sliders to preset configurations
- Long-press preset to save current slider state as "Custom"
- Tap timer → opens Timer Sheet
- Audio plays/pauses with haptic feedback

### 3. Timer Sheet (Bottom Sheet Modal)
A slide-up modal for setting a sleep/meditation timer.

**Content:**
- Duration picker: 5 min, 10 min, 15 min, 30 min, 45 min, 60 min, 90 min, Custom
- Fade out toggle (gradually reduces volume before stopping)
- Meditation bell toggle with interval selector (5, 10, 15, 20, 30 min)
- Start / Cancel buttons

**Functionality:**
- Sets a countdown timer; audio fades out over 30 seconds when timer ends
- Bell plays a soft chime at the selected interval during meditation

### 4. Now Playing / Mixer (Landscape-aware)
The mixer screen adapts when the soundscape is playing — background image animates subtly (slow Ken Burns effect).

---

## Key User Flows

**Flow 1: Play a soundscape**
Home → tap soundscape card → Mixer screen loads → tap Play → audio starts looping

**Flow 2: Tune the sound**
Mixer screen → drag EQ sliders → sound adjusts in real-time → tap a preset chip → sliders animate to preset values

**Flow 3: Set a sleep timer**
Mixer screen → tap Timer icon (top right) → Timer Sheet slides up → select 30 min + Fade Out → tap Start → sheet dismisses → timer countdown begins → audio fades at end

**Flow 4: Meditation bell**
Timer Sheet → enable Bell toggle → set interval to 10 min → Start → bell chimes every 10 minutes

---

## Navigation Structure

```
Tab Bar (2 tabs):
├── Sounds (house.fill) → Home Screen
└── Favorites (heart.fill) → Saved/Favorited soundscapes

Modal Stack:
└── Mixer Screen (pushed from Home, full screen)
    └── Timer Sheet (bottom sheet modal)
```

---

## Component Library

| Component | Description |
|-----------|-------------|
| `SoundCard` | 2-col grid card with image, blur overlay, title |
| `EQSlider` | Vertical draggable slider with glow fill |
| `PresetChip` | Pill-shaped preset selector button |
| `MiniPlayer` | Persistent bottom bar with sound name + controls |
| `TimerSheet` | Bottom sheet modal for timer/bell settings |
| `GlowButton` | Circular play/pause button with radial glow |
| `VolumeKnob` | Circular volume control (rotary gesture) |

---

## Typography

- **Display**: SF Pro Display Bold, 34pt — screen titles
- **Title**: SF Pro Display Semibold, 22pt — soundscape names
- **Body**: SF Pro Text Regular, 16pt — descriptions
- **Label**: SF Pro Text Medium, 12pt — slider labels, chips

---

## Sound Library

| ID | Name | Category | Description |
|----|------|----------|-------------|
| rain_tent | Rain on Tent | Rain | Gentle patter on canvas |
| rain_heavy | Heavy Rain | Rain | Intense downpour |
| forest | Forest | Nature | Birds, leaves, breeze |
| ocean | Ocean Waves | Water | Rolling surf |
| river | River | Water | Babbling brook |
| fire | Fireplace | Fire | Crackling logs |
| thunder | Distant Thunder | Storm | Rumbling storm |
| wind | Mountain Wind | Wind | High-altitude breeze |
| cafe | Coffee Shop | Urban | Ambient chatter |
| space | Deep Space | Cosmic | Ethereal drone |

Each soundscape has 10 audio layers (one per EQ band), each a looping audio file. The EQ slider controls the volume of each layer independently.
