export interface StravaStatus {
  connected: boolean;
  lastSyncAt?: string | null;
  activityCount?: number;
  isSyncing?: boolean;
}
