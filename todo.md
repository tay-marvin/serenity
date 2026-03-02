# Serenity — Project TODO

- [x] Configure theme colors (dark violet/teal palette)
- [x] Update app.config.ts with app name and branding
- [x] Generate app icon/logo (violet/teal waveform ripple)
- [x] Install required packages (expo-blur, expo-linear-gradient)
- [x] Define sound data model and soundscape library (12 soundscapes)
- [x] Build Home screen with 2-column soundscape grid and category filter
- [x] Build SoundCard component with image + gradient overlay + playing indicator
- [x] Build MiniPlayer persistent bar above tab bar
- [x] Build Mixer screen with full-bleed background image
- [x] Build EQSlider vertical slider component (10 bands)
- [x] Build PresetChip component on mixer screen
- [x] Implement audio engine with single looping track + EQ volume shaping
- [x] Wire EQ sliders to audio volume in real-time
- [x] Implement preset snap (apply preset levels)
- [x] Build Timer bottom sheet modal
- [x] Implement sleep timer with fade-out
- [x] Implement meditation bell with interval
- [x] Build Favorites tab screen
- [x] Add keep-awake during playback
- [x] Add haptic feedback on interactions
- [x] Icon symbol mappings for all needed SF Symbols
- [x] Unit tests for sounds data model and volume calculation
- [ ] Polish: animated waveform bars in MiniPlayer
- [ ] Polish: Ken Burns background animation on mixer screen

## Multi-Layer Sound Mixer Upgrade

- [ ] Redesign data model: each soundscape has multiple named audio layers
- [ ] Source and verify individual layer audio URLs (rain drizzle, heavy rain, thunder, wind, etc.)
- [ ] Build multi-layer audio engine: one AudioPlayer per layer, per-layer volume
- [ ] Build new mixer UI: vertical slider per layer with label and icon
- [ ] Home screen: show soundscape as a "scene" you enter, not just play
- [ ] Persist per-layer volumes in AsyncStorage
- [ ] Presets snap all layer volumes at once
- [ ] Unit tests for multi-layer engine logic

## Pillowtalk UI Redesign

- [x] Update theme: pure black bg, warm cream/sand accent, soft white text
- [x] Redesign Home screen: large full-width cards, minimal chrome, uppercase spaced title
- [x] Redesign tab bar: minimal icons, no labels, pure black
- [x] Redesign Mixer screen: clean EQ sliders, warm cream accent, intimate dark feel
- [x] Redesign MiniPlayer: slim frosted dark bar, warm accent dot
- [x] Update SoundCard: full-bleed image, heavy gradient overlay, large light-weight name text

## Remove Images — Pure Gradient Design

- [x] Add gradient color pairs to each soundscape in sounds.ts
- [x] Replace Image + LinearGradient overlay in Home screen cards with pure gradient
- [x] Replace Image background in Mixer screen with pure gradient
- [x] Remove expo-image imports from Home, Favorites, and Mixer screens

## Deep Pillowtalk Redesign

- [x] New color palette: black bg, sage green, dusty rose, warm teal, muted lavender accents
- [x] Home screen: no cards, full-width list rows with large colored sound name text
- [x] Remove category pills from header — use a clean minimal top bar
- [x] Mixer screen: full-screen dark with large sound name, minimal EQ sliders
- [x] Tab bar: two tabs, no labels, ultra-minimal icons, pure black
- [x] MiniPlayer: slim bar, no borders, just colored name + status
- [x] Generous whitespace and breathing room on all screens

## Accessibility & Contrast Improvements

- [x] Boost muted/secondary text from #333-#444 to #888+ (WCAG AA on black)
- [x] Ensure all accent colors meet 3:1 contrast ratio on black background
- [x] Increase category label contrast on Home screen
- [x] Fix separator/divider visibility
- [x] Add accessibilityLabel to all Pressable buttons
- [x] Add accessibilityRole to interactive elements
- [x] Ensure minimum 44x44pt touch targets on all buttons
- [x] Brighten EQ slider labels and value text
- [x] Improve MiniPlayer status text contrast
- [x] Improve TimerSheet option chip text contrast

## Meditation Bell

- [x] Find and verify real meditation bell MP3 URL
- [x] Fix audio engine bell to use real audio file (not generated tone)
- [x] Add bell toggle + interval selector directly on the Mixer screen
- [x] Bell plays at selected interval while ambient audio is running
- [x] Bell state persists across sessions
