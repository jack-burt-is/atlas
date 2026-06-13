import type { users, sessions } from "@atlas/db";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;

export type AppEnv = {
  Variables: {
    user: User;
    session: Session;
  };
};
