/**
 * Server-side API client.
 * BACKEND_URL is only available server-side (no NEXT_PUBLIC_ prefix).
 * All functions here run inside Server Components or Route Handlers.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ActivityType {
  typeKey: string;
  typeId: number;
}

export interface Activity {
  activityId: number;
  activityName: string;
  startTimeLocal: string;
  activityType: ActivityType;
  distance: number;       // metres
  duration: number;       // seconds
  movingDuration: number; // seconds
  calories: number;
  averageHR: number;
  maxHR: number;
  averageSpeed: number;
  elevationGain: number;
  steps?: number;
}

export interface DailyStats {
  calendarDate: string;
  totalKilocalories: number;
  activeKilocalories: number;
  bmrKilocalories: number;
  totalSteps: number;
  restingHeartRate: number;
  averageStressLevel: number;
  maxStressLevel: number;
  sleepingSeconds: number;
  bodyBatteryHighestValue: number;
  bodyBatteryLowestValue: number;
  bodyBatteryChargedValue: number;
  bodyBatteryDrainedValue: number;
}

export interface HeartRateData {
  calendarDate: string;
  restingHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  heartRateValues: [number, number | null][];
}

export interface SleepData {
  dailySleepDTO: {
    calendarDate: string;
    sleepTimeSeconds: number;
    deepSleepSeconds: number;
    lightSleepSeconds: number;
    remSleepSeconds: number;
    awakeSleepSeconds: number;
  };
}

// ── API calls ─────────────────────────────────────────────────────────────

export async function getActivities(params?: {
  limit?: number;
  start?: number;
  type?: string;
  from_date?: string;
  to_date?: string;
}) {
  const q = new URLSearchParams();
  if (params?.limit)     q.set("limit", String(params.limit));
  if (params?.start)     q.set("start", String(params.start));
  if (params?.type)      q.set("type", params.type);
  if (params?.from_date) q.set("from_date", params.from_date);
  if (params?.to_date)   q.set("to_date", params.to_date);

  return get<{ activities: Activity[]; count: number; offset: number }>(
    `/api/activities?${q}`
  );
}

export async function getActivity(id: number) {
  return get<Activity>(`/api/activities/${id}`);
}

export async function getDailyStats(date?: string) {
  return get<DailyStats>(`/api/health/stats${date ? `?cdate=${date}` : ""}`);
}

export async function getHeartRate(date?: string) {
  return get<HeartRateData>(
    `/api/health/heartrate${date ? `?cdate=${date}` : ""}`
  );
}

export async function getSleep(date?: string) {
  return get<SleepData>(`/api/health/sleep${date ? `?cdate=${date}` : ""}`);
}

export async function getHealthSummary(days = 7) {
  return get<{ summary: DailyStats[] }>(`/api/health/summary?days=${days}`);
}
