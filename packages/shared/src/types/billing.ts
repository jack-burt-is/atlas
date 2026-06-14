export interface BillingStatus {
  plan: string;
  billingStatus: string;
  planExpiresAt: string | null;
  isPro: boolean;
  limits: {
    gpxImportsPerMonth: number | null;
    gpxImportsUsedThisMonth: number;
  };
}

export interface PlanKey {
  id: string;
  code: string;
  plan: string;
  durationDays: number | null;
  note: string | null;
  redeemedAt: string | null;
  redeemedByUserId: string | null;
  redeemedByEmail: string | null;
  createdAt: string;
}
