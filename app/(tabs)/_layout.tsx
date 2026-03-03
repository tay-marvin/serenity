import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, StyleSheet, Text, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MiniPlayer } from "@/components/mini-player";
import { useThemeContext } from "@/lib/theme-provider";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#222222' : '#E0E0E0';
  const activeColor = isDark ? '#FFFFFF' : '#000000';
  const inactiveColor = isDark ? '#666666' : '#999999';

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 52 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => (
        <View style={{ backgroundColor: bg }}>
          <MiniPlayer />
          <View
            style={[
              styles.tabBar,
              {
                paddingBottom: bottomPadding,
                height: tabBarHeight,
                backgroundColor: bg,
                borderTopColor: borderColor,
              },
            ]}
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
              const tabLabel = options.title ?? route.name;
              return (
                <View
                  key={route.key}
                  style={styles.tabItem}
                  accessibilityRole="tab"
                  accessibilityLabel={tabLabel}
                  accessibilityState={{ selected: isFocused }}
                >
                  <HapticTab
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityLabel={tabLabel}
                    style={styles.tabBtn}
                  >
                    {options.tabBarIcon?.({
                      focused: isFocused,
                      color: isFocused ? activeColor : inactiveColor,
                      size: 20,
                    })}
                    {/* Co-Star uses tiny text labels */}
                    <Text style={[
                      styles.tabLabel,
                      { color: isFocused ? activeColor : inactiveColor },
                    ]}>
                      {tabLabel.toUpperCase()}
                    </Text>
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

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 44,
    gap: 2,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 10,
  },
});
