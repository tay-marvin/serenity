import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MiniPlayer } from "@/components/mini-player";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 52 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F5F5F0',
        tabBarInactiveTintColor: '#2A2A2A',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: '#000000',
          borderTopColor: '#111111',
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
      tabBar={(props) => (
        <View style={{ backgroundColor: '#000000' }}>
          <MiniPlayer />
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 10,
              paddingBottom: bottomPadding,
              height: tabBarHeight,
              backgroundColor: '#000000',
              borderTopWidth: 0.5,
              borderTopColor: '#111111',
            }}
          >
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === index;
              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };
              return (
                <View
                  key={route.key}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <HapticTab onPress={onPress} style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
                    {options.tabBarIcon?.({ focused: isFocused, color: isFocused ? '#F5F5F0' : '#2A2A2A', size: 22 })}
                  </HapticTab>
                </View>
              );
            })}
          </View>
        </View>
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sounds",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="waveform" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Need StyleSheet for hairlineWidth
import { StyleSheet } from 'react-native';
