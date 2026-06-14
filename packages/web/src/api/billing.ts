import type { BillingStatus, PlanKey } from "@atlas/shared";
import { apiGet, apiPost, apiDelete } from "../lib/api-client";

export type { BillingStatus, PlanKey } from "@atlas/shared";

export function fetchBillingStatus(): Promise<BillingStatus> {
  return apiGet("/billing");
}

export function startCheckout(): Promise<{ url: string }> {
  return apiPost("/billing/checkout");
}

export function openBillingPortal(): Promise<{ url: string }> {
  return apiPost("/billing/portal");
}

export function redeemKey(
  code: string,
): Promise<{ ok: boolean; plan: string; expiresAt: string | null }> {
  return apiPost("/billing/redeem-key", { code });
}

export function fetchAdminPlanKeys(): Promise<{ keys: PlanKey[] }> {
  return apiGet("/admin/plan-keys");
}

export function createPlanKey(data: {
  plan?: string;
  durationDays?: number;
  note?: string;
}): Promise<{ key: PlanKey }> {
  return apiPost("/admin/plan-keys", data);
}

export function deletePlanKey(keyId: string): Promise<{ ok: boolean }> {
  return apiDelete(`/admin/plan-keys/${keyId}`);
}
