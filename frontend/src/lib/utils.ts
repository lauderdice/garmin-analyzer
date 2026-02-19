/** Format metres to a readable distance string. */
export function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${Math.round(metres)} m`;
}

/** Format seconds to HH:MM:SS. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format seconds as "Xh Ym". */
export function formatSleepDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/** Map activity typeKey to an emoji. */
export function activityEmoji(typeKey: string): string {
  const map: Record<string, string> = {
    running: "🏃",
    cycling: "🚴",
    swimming: "🏊",
    hiking: "🥾",
    walking: "🚶",
    strength_training: "🏋️",
    yoga: "🧘",
    skiing: "⛷️",
    tennis: "🎾",
    soccer: "⚽",
  };
  return map[typeKey] ?? "🏅";
}

/** Return today's date as YYYY-MM-DD. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}
