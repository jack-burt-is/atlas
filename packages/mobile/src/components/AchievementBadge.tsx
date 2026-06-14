import { View, Text, StyleSheet } from "react-native";
import { Trophy, Lock } from "lucide-react-native";
import type { Achievement } from "@atlas/shared";
import { colors, typography, spacing, radius } from "../theme/tokens";

const TIER_COLORS = {
  bronze: colors.tiers.bronze,
  silver: colors.tiers.silver,
  gold: colors.tiers.gold,
  platinum: colors.tiers.platinum,
};

interface Props {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: Props) {
  const { name, description, tier, points, unlocked, progress } = achievement;
  const tierColor = TIER_COLORS[tier];

  return (
    <View style={[styles.card, !unlocked && styles.locked]}>
      <View
        style={[
          styles.iconWrapper,
          {
            borderColor: unlocked ? `${tierColor}55` : colors.borderSubtle,
            backgroundColor: unlocked ? `${tierColor}14` : colors.surfaceSunken,
          },
        ]}
      >
        {unlocked ? (
          <Trophy size={18} color={tierColor} strokeWidth={2} />
        ) : (
          <Lock size={15} color={colors.ink[500]} strokeWidth={2} />
        )}
      </View>
      <Text style={[styles.name, !unlocked && styles.lockedText]} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      {progress !== null && !unlocked && (
        <View style={styles.progressWrapper}>
          <View style={styles.trackBg}>
            <View
              style={[
                styles.trackFill,
                {
                  width: `${(progress.value / progress.max) * 100}%`,
                  backgroundColor: tierColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.value} / {progress.max}
          </Text>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={[styles.tier, { color: unlocked ? tierColor : colors.textFaint }]}>
          {tier.toUpperCase()}
        </Text>
        <Text style={styles.points}>{points} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[3],
    gap: spacing[1] + 2,
    flex: 1,
  },
  locked: {
    opacity: 0.5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[1],
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 17,
  },
  lockedText: {
    color: colors.textMuted,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
  progressWrapper: {
    gap: 3,
    marginTop: spacing[1],
  },
  trackBg: {
    height: 2,
    backgroundColor: colors.surfaceHover,
    borderRadius: 1,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 1,
  },
  progressText: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textFaint,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing[1],
  },
  tier: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  points: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.8,
  },
});
