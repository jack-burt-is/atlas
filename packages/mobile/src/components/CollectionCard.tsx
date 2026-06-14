import { View, Text, StyleSheet, Pressable } from "react-native";
import type { Collection } from "@atlas/shared";
import { colors, typography, spacing, radius } from "../theme/tokens";

interface Props {
  collection: Collection;
  onPress?: () => void;
}

export function CollectionCard({ collection, onPress }: Props) {
  const { name, type, pct, completedCount, itemCount } = collection;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.type}>{type.toUpperCase()}</Text>
        <Text style={styles.pct}>{Math.round(pct)}%</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <View style={styles.footer}>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${Math.min(pct, 100)}%` }]} />
        </View>
        <Text style={styles.counts}>
          {completedCount} / {itemCount}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[4],
    gap: spacing[2],
  },
  cardPressed: {
    backgroundColor: colors.surfaceHover,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  pct: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.accent,
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    gap: spacing[1],
  },
  trackBg: {
    height: 3,
    backgroundColor: colors.surfaceHover,
    borderRadius: 2,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  counts: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 0.8,
  },
});
