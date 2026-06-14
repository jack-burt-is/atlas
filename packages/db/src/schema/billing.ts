import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const planKeys = pgTable(
  "plan_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    plan: text("plan").notNull(),
    durationDays: integer("duration_days"),
    note: text("note"),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    redeemedByUserId: uuid("redeemed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    codeIdx: index("plan_keys_code_idx").on(table.code),
    createdByIdx: index("plan_keys_created_by_idx").on(table.createdByUserId),
  }),
);
