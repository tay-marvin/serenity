import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MiniPlayer } from "@/components/mini-player";
import { useAudioEngine } from "@/lib/audio-engine";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { activeSoundscapeId } = useAudioEngine();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 6);
  const tabBarHeight = 48 + bottomPadding;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#C8B89A',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.25)',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: '#000000',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: StyleSheet_hairlineWidth,
            position: 'absolute',
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={22} name="waveform" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            tabBarIcon: ({ color }) => (
              <IconSymbol size={22} name="heart.fill" color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Mini player sits just above the tab bar */}
      {activeSoundscapeId && (
        <View style={{
          position: 'absolute',
          bottom: tabBarHeight,
          left: 0,
          right: 0,
          zIndex: 50,
        }}>
          <MiniPlayer />
        </View>
      )}
    </View>
  );
}

// Inline constant to avoid import
const StyleSheet_hairlineWidth = 0.5;
