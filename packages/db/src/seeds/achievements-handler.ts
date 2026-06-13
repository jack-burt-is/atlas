import { seed } from "./achievements.js";

export const handler = async () => {
  await seed();
  return { ok: true };
};
