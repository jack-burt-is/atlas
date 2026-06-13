import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getDb, achievementDefinitions, buildEvalContext, evaluateRule } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

router.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const [definitions, unlockedRows, ctx] = await Promise.all([
    db.select().from(achievementDefinitions),
    db.execute<{ achievement_id: string; unlocked_at: string }>(sql`
      SELECT achievement_id, unlocked_at
      FROM user_achievements
      WHERE user_id = ${user.id}::uuid
    `),
    buildEvalContext(user.id, db),
  ]);

  const unlockedMap = new Map(
    unlockedRows.rows.map((r) => [r.achievement_id, r.unlocked_at]),
  );

  const achievements = definitions.map((def) => {
    const isUnlocked = unlockedMap.has(def.id);
    const { current, target } = evaluateRule(
      def.ruleType,
      def.ruleParams as Record<string, unknown>,
      ctx,
    );
    const progress = target > 0 ? Math.min(current / target, 1) : isUnlocked ? 1 : 0;

    return {
      id: def.id,
      slug: def.slug,
      name: def.name,
      description: def.description,
      tier: def.tier,
      points: def.points,
      iconName: def.iconName,
      category: def.category,
      rarity: def.rarity ? parseFloat(String(def.rarity)) : null,
      unlocked: isUnlocked,
      unlockedAt: unlockedMap.get(def.id) ?? null,
      progress,
      current,
      target,
    };
  });

  // Unlocked first (newest → oldest), then in-progress (highest pct first), then locked.
  achievements.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if (a.unlocked && b.unlocked) {
      return (
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      );
    }
    return b.progress - a.progress;
  });

  return c.json({ achievements });
});

router.get("/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const { slug } = c.req.param();
  const db = getDb();

  const defRows = await db.execute<{
    id: string;
    slug: string;
    name: string;
    description: string;
    tier: string;
    points: number;
    icon_name: string | null;
    category: string | null;
    rule_type: string;
    rule_params: Record<string, unknown>;
    rarity: string | null;
    created_at: string;
  }>(sql`
    SELECT id, slug, name, description, tier, points, icon_name, category,
           rule_type, rule_params, rarity, created_at
    FROM achievement_definitions
    WHERE slug = ${slug}
    LIMIT 1
  `);

  const def = defRows.rows[0];
  if (!def) return c.json({ error: "Not found" }, 404);

  const [unlockedRow, ctx] = await Promise.all([
    db.execute<{ unlocked_at: string; trigger_activity_id: string | null }>(sql`
      SELECT ua.unlocked_at, ua.trigger_activity_id
      FROM user_achievements ua
      WHERE ua.user_id = ${user.id}::uuid
        AND ua.achievement_id = ${def.id}::uuid
      LIMIT 1
    `),
    buildEvalContext(user.id, db),
  ]);

  const isUnlocked = unlockedRow.rows.length > 0;
  const { current, target } = evaluateRule(def.rule_type, def.rule_params, ctx);
  const progress = target > 0 ? Math.min(current / target, 1) : isUnlocked ? 1 : 0;

  return c.json({
    achievement: {
      id: def.id,
      slug: def.slug,
      name: def.name,
      description: def.description,
      tier: def.tier,
      points: def.points,
      iconName: def.icon_name,
      category: def.category,
      rarity: def.rarity ? parseFloat(def.rarity) : null,
      createdAt: def.created_at,
      unlocked: isUnlocked,
      unlockedAt: unlockedRow.rows[0]?.unlocked_at ?? null,
      triggerActivityId: unlockedRow.rows[0]?.trigger_activity_id ?? null,
      progress,
      current,
      target,
    },
  });
});

export default router;
