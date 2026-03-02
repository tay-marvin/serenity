import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { MiniPlayer } from "@/components/mini-player";
import { useAudioEngine } from "@/lib/audio-engine";

function TabBarBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(8,8,16,0.95)',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.08)',
      }}
    />
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSoundscape } = useAudioEngine();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;
  // Extra space for mini player
  const miniPlayerHeight = activeSoundscape ? 64 : 0;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight + miniPlayerHeight,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Sounds",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="waveform" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="heart.fill" color={color} />
            ),
          }}
        />
      </Tabs>
      {/* Mini player sits above the tab bar */}
      {activeSoundscape && (
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
