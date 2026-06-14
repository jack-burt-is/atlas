import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fetchProfileStats, fetchActivityHeatmap, fetchSuggestions } from "../../src/api/profile";
import { fetchCollections } from "../../src/api/collections";
import { ProgressRing } from "../../src/components/ProgressRing";
import { HeatGrid } from "../../src/components/HeatGrid";
import { StatBlock } from "../../src/components/StatBlock";
import { CollectionCard } from "../../src/components/CollectionCard";
import { colors, typography, spacing, tabbarHeight } from "../../src/theme/tokens";

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(0)}km`;
  return `${m}m`;
}

function formatElevation(m: number): string {
  return `${m.toLocaleString()}m`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profileStats"],
    queryFn: fetchProfileStats,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["activityHeatmap"],
    queryFn: fetchActivityHeatmap,
  });

  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const stats = profileData?.stats;
  const streaks = profileData?.streaks;
  const collections = collectionsData?.collections?.slice(0, 4) ?? [];
  const heatmapEntries = heatmapData?.data ?? [];

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing[5],
          paddingBottom: tabbarHeight + insets.bottom + spacing[5],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>OUTDOOR SCORE</Text>
          <Text style={styles.scoreHero}>{stats?.outdoorScore.toLocaleString() ?? "—"}</Text>
        </View>
        {stats !== undefined && (
          <ProgressRing
            progress={stats.levelProgress}
            size={80}
            strokeWidth={6}
            label={String(stats.level)}
            sublabel="LEVEL"
          />
        )}
      </View>

      {/* Stats row */}
      {stats !== undefined && (
        <View style={styles.statsRow}>
          <StatBlock label="SUMMITS" value={stats.totalSummits} />
          <View style={styles.divider} />
          <StatBlock label="ACTIVITIES" value={stats.totalActivities} />
          <View style={styles.divider} />
          <StatBlock label="DISTANCE" value={formatDistance(stats.totalDistanceM)} />
          <View style={styles.divider} />
          <StatBlock label="ELEVATION" value={formatElevation(stats.totalElevationGainM)} />
        </View>
      )}

      {/* Streak */}
      {streaks !== undefined && (
        <View style={styles.section}>
          <View style={styles.streakRow}>
            <View style={styles.streakBlock}>
              <Text style={styles.streakNumber}>{streaks.currentStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakBlock}>
              <Text style={styles.streakNumber}>{streaks.longestStreak}</Text>
              <Text style={styles.streakLabel}>BEST STREAK</Text>
            </View>
          </View>
        </View>
      )}

      {/* Activity heatmap */}
      {heatmapEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HeatGrid data={heatmapEntries} weeks={18} />
          </ScrollView>
        </View>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COLLECTIONS</Text>
          <View style={styles.collectionsGrid}>
            {collections.map((c) => (
              <CollectionCard
                key={c.id}
                collection={c}
                onPress={() => router.push(`/(tabs)/collections/${c.slug}`)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  content: {
    paddingHorizontal: spacing[5],
    gap: spacing[6],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  scoreHero: {
    fontFamily: typography.display,
    fontSize: 48,
    color: colors.accent,
    lineHeight: 52,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[4],
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSubtle,
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  streakRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[4],
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  streakBlock: {
    alignItems: "center",
    gap: 4,
  },
  streakNumber: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.accent,
    lineHeight: 36,
  },
  streakLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  collectionsGrid: {
    gap: spacing[3],
  },
});
