export interface Activity {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  distanceM: number | null;
  elevationGainM: number | null;
  durationSeconds: number | null;
  processedAt: string | null;
  sourceType: string;
}

export interface ActivityDetail {
  activity: Activity;
  matchedPeaks: Array<{ peakId: string }>;
  matchedSections: Array<{ sectionId: string }>;
  matchedLandmarks: Array<{ landmarkId: string }>;
}

export interface ActivitiesListResponse {
  activities: Activity[];
}
