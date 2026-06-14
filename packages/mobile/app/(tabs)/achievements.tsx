import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy } from "lucide-react-native";
import type { AchievementTier } from "@atlas/shared";
import { fetchAchievements } from "../../src/api/achievements";
import { AchievementBadge } from "../../src/components/AchievementBadge";
import { colors, typography, spacing, radius, tabbarHeight } from "../../src/theme/tokens";

const TIERS: Array<{ key: AchievementTier | "all"; label: string }> = [
  { key: "all", label: "ALL" },
  { key: "platinum", label: "PLATINUM" },
  { key: "gold", label: "GOLD" },
  { key: "silver", label: "SILVER" },
  { key: "bronze", label: "BRONZE" },
];

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: colors.tiers.bronze,
  silver: colors.tiers.silver,
  gold: colors.tiers.gold,
  platinum: colors.tiers.platinum,
};

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const [tier, setTier] = useState<AchievementTier | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });

  const filtered =
    tier === "all"
      ? (data?.achievements ?? [])
      : (data?.achievements ?? []).filter((a) => a.tier === tier);

  const unlocked = (data?.achievements ?? []).filter((a) => a.unlocked).length;
  const total = (data?.achievements ?? []).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <Trophy size={22} color={colors.accent} strokeWidth={2} />
          <Text style={styles.title}>Achievements</Text>
        </View>
        {data !== undefined && (
          <Text style={styles.subtitle}>
            {unlocked} / {total} unlocked
          </Text>
        )}
      </View>

      {/* Tier filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {TIERS.map((t) => {
          const active = tier === t.key;
          const tierColor = t.key !== "all" ? TIER_COLORS[t.key] : colors.accent;
          return (
            <Pressable
              key={t.key}
              style={[
                styles.chip,
                active && { backgroundColor: `${tierColor}20`, borderColor: `${tierColor}60` },
              ]}
              onPress={() => setTier(t.key)}
            >
              <Text
                style={[styles.chipText, active && { color: tierColor }]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabbarHeight + insets.bottom + spacing[5] },
          ]}
          renderItem={({ item }) => <AchievementBadge achievement={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  pageHeader: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  chip: {
    height: 32,
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  row: {
    gap: spacing[3],
  },
});
