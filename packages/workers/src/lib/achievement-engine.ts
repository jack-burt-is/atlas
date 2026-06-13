import { sql, eq } from "drizzle-orm";
import {
  getDb,
  achievementDefinitions,
  userAchievements,
  userStats,
  buildEvalContext,
  evaluateRule,
} from "@atlas/db";

type Db = ReturnType<typeof getDb>;

export async function evaluateAchievements(userId: string, db: Db): Promise<void> {
  const [ctx, definitions, unlockedRows] = await Promise.all([
    buildEvalContext(userId, db),
    db.select().from(achievementDefinitions),
    db.execute<{ achievement_id: string }>(sql`
      SELECT achievement_id FROM user_achievements WHERE user_id = ${userId}::uuid
    `),
  ]);

  const unlocked = new Set(unlockedRows.rows.map((r) => r.achievement_id));

  const newlyEarned: Array<{ id: string; points: number }> = [];

  for (const def of definitions) {
    if (unlocked.has(def.id)) continue;

    const { current, target } = evaluateRule(
      def.ruleType,
      def.ruleParams as Record<string, unknown>,
      ctx,
    );

    if (current >= target) {
      newlyEarned.push({ id: def.id, points: def.points });
    }
  }

  if (newlyEarned.length === 0) return;

  for (const { id } of newlyEarned) {
    await db
      .insert(userAchievements)
      .values({ userId, achievementId: id, unlockedAt: new Date() })
      .onConflictDoNothing();
  }

  const totalPoints = newlyEarned.reduce((sum, a) => sum + a.points, 0);

  // outdoor_score on the RHS uses the old pre-update value (Postgres semantics),
  // so (outdoor_score + totalPoints) correctly represents the new score in both expressions.
  await db.execute(sql`
    UPDATE user_stats SET
      outdoor_score = outdoor_score + ${totalPoints},
      level         = FLOOR(SQRT((outdoor_score + ${totalPoints}) / 100.0))::int + 1,
      updated_at    = NOW()
    WHERE user_id = ${userId}::uuid
  `);
}
