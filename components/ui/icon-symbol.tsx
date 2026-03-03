// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "xmark": "close",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",

  // Playback
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "forward.fill": "skip-next",
  "backward.fill": "skip-previous",

  // Audio
  "waveform": "graphic-eq",
  "speaker.wave.1.fill": "volume-down",
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "music.note": "music-note",

  // UI
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "star.fill": "star",
  "star": "star-border",
  "timer": "timer",
  "bell.fill": "notifications",
  "bell": "notifications-none",
  "gearshape.fill": "settings",
  "moon.fill": "nightlight-round",
  "moon": "nightlight",
  "sun.max.fill": "wb-sunny",
  "sun.max": "wb-sunny",
  "magnifyingglass": "search",
  "plus": "add",
  "minus": "remove",
  "checkmark": "check",
  "shuffle": "shuffle",
  "repeat": "repeat",
  "list.bullet": "list",
  "square.grid.2x2.fill": "grid-view",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "info.circle": "info",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-vert",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
