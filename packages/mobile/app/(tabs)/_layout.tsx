import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, tabbarHeight } from "../../src/theme/tokens";
import { useAuth } from "../../src/hooks/useAuth";
import { TabIcon } from "../../src/components/TabIcon";

function AtlasTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabHeight = tabbarHeight + insets.bottom;

  return (
    <View style={[styles.tabBarOuter, { height: tabHeight }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.tabBarInner, { paddingBottom: insets.bottom }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate({ name: route.name, merge: true });
            }
          }

          return (
            <TabIcon
              key={route.key}
              name={route.name}
              label={String(label)}
              focused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/login");
    }
  }, [user, loading]);

  if (loading || user === null) return null;

  return (
    <Tabs
      tabBar={(props) => <AtlasTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="collections" options={{ title: "Collections" }} />
      <Tabs.Screen name="achievements" options={{ title: "Achievements" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    overflow: "hidden",
  },
  tabBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});
