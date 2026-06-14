export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  plan: string;
  billingStatus: string;
  planExpiresAt: string | null;
  createdAt: string;
}
