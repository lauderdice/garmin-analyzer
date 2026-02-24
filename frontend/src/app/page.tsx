import { getDailyStats, getActivities, getHealthSummary } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { StepsBarChart } from "@/components/charts/StepsBarChart";
import { SleepChart } from "@/components/charts/SleepChart";
import { formatSleepDuration } from "@/lib/utils";

export default async function OverviewPage() {
  const [statsResult, activitiesResult, summaryResult] = await Promise.allSettled([
    getDailyStats(),
    getActivities({ limit: 5 }),
    getHealthSummary(7),
  ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const activities =
    activitiesResult.status === "fulfilled" ? activitiesResult.value.activities : [];
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value.summary : [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-slate-400 text-sm mt-1">{today}</p>
      </div>

      {/* Today's stats */}
      {stats ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Today
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Steps"
              value={(stats.totalSteps ?? 0).toLocaleString()}
              accent="blue"
            />
            <StatCard
              label="Active kcal"
              value={Math.round(stats.activeKilocalories ?? 0)}
              unit="kcal"
              accent="orange"
            />
            <StatCard
              label="Resting HR"
              value={stats.restingHeartRate ?? "–"}
              unit="bpm"
              accent="red"
            />
            <StatCard
              label="Sleep"
              value={formatSleepDuration(stats.sleepingSeconds ?? 0)}
              accent="green"
            />
          </div>
          {(stats.bodyBatteryHighestValue || stats.averageStressLevel) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {stats.bodyBatteryHighestValue != null && (
                <StatCard
                  label="Body Battery (peak)"
                  value={stats.bodyBatteryHighestValue}
                  sub={`Low: ${stats.bodyBatteryLowestValue}`}
                  accent="green"
                />
              )}
              {stats.averageStressLevel != null && (
                <StatCard
                  label="Avg Stress"
                  value={stats.averageStressLevel}
                  sub={`Max: ${stats.maxStressLevel}`}
                  accent="orange"
                />
              )}
            </div>
          )}
        </section>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-slate-400 text-sm">
          Could not load today&apos;s stats. Check that the backend is running and Garmin
          credentials are set.
        </div>
      )}

      {/* 7-day trend charts */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Steps – last 7 days</h3>
            <StepsBarChart data={summary} />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Sleep – last 7 days</h3>
            <SleepChart data={summary} />
          </div>
        </div>
      )}

      {/* Recent activities */}
      {activities.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Recent Activities
          </h3>
          <div className="flex flex-col gap-3">
            {activities.map((a) => (
              <ActivityCard key={a.activityId} activity={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
