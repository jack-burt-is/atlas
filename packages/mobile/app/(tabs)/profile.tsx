import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LogOut, User } from "lucide-react-native";
import { fetchProfileStats } from "../../src/api/profile";
import { StatBlock } from "../../src/components/StatBlock";
import { ProgressRing } from "../../src/components/ProgressRing";
import { useAuth } from "../../src/hooks/useAuth";
import { colors, typography, spacing, radius, tabbarHeight } from "../../src/theme/tokens";
import { queryClient } from "../../src/api/query-client";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["profileStats"],
    queryFn: fetchProfileStats,
  });

  const stats = data?.stats;

  async function handleLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing[5],
          paddingBottom: tabbarHeight + insets.bottom + spacing[6],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile hero */}
      <View style={styles.hero}>
        <View style={styles.avatarWrapper}>
          {user?.name ? (
            <Text style={styles.avatarInitials}>
              {user.name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()}
            </Text>
          ) : (
            <User size={24} color={colors.accent} strokeWidth={1.8} />
          )}
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{user?.name ?? "Explorer"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        {stats !== undefined && (
          <ProgressRing
            progress={stats.levelProgress}
            size={64}
            strokeWidth={5}
            label={String(stats.level)}
            sublabel="LVL"
          />
        )}
      </View>

      {/* Plan badge */}
      <View style={styles.planRow}>
        <View style={[styles.planBadge, user?.plan === "pro" && styles.planBadgePro]}>
          <Text style={[styles.planText, user?.plan === "pro" && styles.planTextPro]}>
            {(user?.plan ?? "FREE").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing[5] }} />
      ) : stats !== undefined ? (
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <StatBlock label="SCORE" value={stats.outdoorScore.toLocaleString()} />
            <StatBlock label="SUMMITS" value={stats.totalSummits} />
            <StatBlock label="DAYS OUT" value={stats.totalDaysOut} />
            <StatBlock label="COUNTRIES" value={stats.totalCountries} />
          </View>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.actionText}>Sign out</Text>
          <LogOut size={16} color={colors.coral[400]} strokeWidth={2} />
        </Pressable>
      </View>
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
    gap: spacing[5],
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: typography.displaySemiBold,
    fontSize: 20,
    color: colors.accent,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: typography.displaySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  planRow: {
    flexDirection: "row",
  },
  planBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  planBadgePro: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderGold,
  },
  planText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  planTextPro: {
    color: colors.accent,
  },
  statsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[5],
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing[5],
  },
  actions: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing[4],
  },
  actionPressed: {
    backgroundColor: colors.surfaceHover,
  },
  actionText: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.coral[400],
  },
});
