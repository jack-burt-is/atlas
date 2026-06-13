import { run } from "./geographic-data.js";

export const handler = async () => {
  await run();
  return { ok: true };
};
