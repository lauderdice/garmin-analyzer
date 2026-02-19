import type { Activity } from "@/lib/api";
import { activityEmoji, formatDistance, formatDuration } from "@/lib/utils";

export function ActivityCard({ activity }: { activity: Activity }) {
  const typeKey = activity.activityType?.typeKey ?? "unknown";
  const dateStr = new Date(activity.startTimeLocal).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4 items-start">
      <span className="text-3xl">{activityEmoji(typeKey)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{activity.activityName}</p>
        <p className="text-xs text-slate-400 capitalize">
          {typeKey.replace(/_/g, " ")} · {dateStr}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-300">
          {activity.distance > 0 && (
            <span>{formatDistance(activity.distance)}</span>
          )}
          <span>{formatDuration(activity.duration)}</span>
          {activity.calories > 0 && <span>{Math.round(activity.calories)} kcal</span>}
          {activity.averageHR > 0 && <span>❤️ {Math.round(activity.averageHR)} bpm</span>}
        </div>
      </div>
    </div>
  );
}
