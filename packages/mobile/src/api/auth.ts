import type { User } from "@atlas/shared";
import { apiClient } from "./client";
import { saveSessionToken, clearSessionToken } from "./auth-store";

export type { User };

export async function mobileLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: User; sessionToken: string }> {
  return apiClient.post("/auth/mobile/login", data);
}

export async function mobileSignup(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: User; sessionToken: string }> {
  return apiClient.post("/auth/mobile/signup", data);
}

export async function login(data: { email: string; password: string }): Promise<User> {
  const res = await mobileLogin(data);
  await saveSessionToken(res.sessionToken);
  return res.user;
}

export async function signup(data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const res = await mobileSignup(data);
  await saveSessionToken(res.sessionToken);
  return res.user;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    await clearSessionToken();
  }
}

export function fetchMe(): Promise<{ user: User }> {
  return apiClient.get("/auth/me");
}
