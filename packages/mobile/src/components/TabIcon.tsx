import { Pressable, Text, StyleSheet, View } from "react-native";
import { Home, Map, LayoutGrid, Trophy, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors, typography } from "../theme/tokens";

const ICON_MAP: Record<string, LucideIcon> = {
  index: Home,
  explore: Map,
  collections: LayoutGrid,
  achievements: Trophy,
  profile: User,
};

interface Props {
  name: string;
  label: string;
  focused: boolean;
  onPress: () => void;
}

export function TabIcon({ name, label, focused, onPress }: Props) {
  const Icon = ICON_MAP[name];

  return (
    <Pressable style={styles.tab} onPress={onPress} accessibilityRole="tab">
      {Icon !== undefined && (
        <Icon
          size={22}
          color={focused ? colors.accent : colors.textFaint}
          strokeWidth={focused ? 2.2 : 1.8}
        />
      )}
      <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
      {focused && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 4,
    gap: 3,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  labelFocused: {
    color: colors.accent,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    position: "absolute",
    bottom: 0,
  },
});
