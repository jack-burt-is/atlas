import { apiGet, apiPost } from "../lib/api-client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export function fetchMe(): Promise<{ user: User }> {
  return apiGet("/auth/me");
}

export function login(data: { email: string; password: string }): Promise<{ user: User }> {
  return apiPost("/auth/login", data);
}

export function signup(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: User }> {
  return apiPost("/auth/signup", data);
}

export function logout(): Promise<{ ok: boolean }> {
  return apiPost("/auth/logout");
}
