import { getDailyStats, getHeartRate, getSleep, getHealthSummary } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { HeartRateChart } from "@/components/charts/HeartRateChart";
import { StepsBarChart } from "@/components/charts/StepsBarChart";
import { SleepChart } from "@/components/charts/SleepChart";
import { DateNavigator } from "@/components/DateNavigator";
import { formatSleepDuration } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HealthPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? new Date().toISOString().split("T")[0];

  const [statsResult, hrResult, sleepResult, summaryResult] = await Promise.allSettled([
    getDailyStats(date),
    getHeartRate(date),
    getSleep(date),
    getHealthSummary(7),
  ]);

  const stats   = statsResult.status   === "fulfilled" ? statsResult.value   : null;
  const hr      = hrResult.status      === "fulfilled" ? hrResult.value      : null;
  const sleep   = sleepResult.status   === "fulfilled" ? sleepResult.value   : null;
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value.summary : [];

  const sleepDTO = sleep?.dailySleepDTO;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header + date nav */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Health</h2>
        <DateNavigator date={date} basePath="/health" />
      </div>

      {/* Daily stats */}
      {stats ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
            {date}
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

          {(stats.bodyBatteryHighestValue != null || stats.averageStressLevel != null) && (
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
          No data available for {date}.
        </div>
      )}

      {/* Heart rate chart */}
      {hr && (hr.heartRateValues?.length ?? 0) > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Heart Rate</h3>
            {hr.restingHeartRate && (
              <span className="text-xs text-slate-400">
                Resting: {hr.restingHeartRate} bpm · Min: {hr.minHeartRate} · Max:{" "}
                {hr.maxHeartRate}
              </span>
            )}
          </div>
          <HeartRateChart data={hr} />
        </div>
      )}

      {/* Sleep breakdown */}
      {sleepDTO && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Sleep Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Deep", value: sleepDTO.deepSleepSeconds, color: "text-blue-400" },
              { label: "Light", value: sleepDTO.lightSleepSeconds, color: "text-indigo-400" },
              { label: "REM", value: sleepDTO.remSleepSeconds, color: "text-purple-400" },
              { label: "Awake", value: sleepDTO.awakeSleepSeconds, color: "text-slate-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>
                  {formatSleepDuration(value ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-day trends */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Steps – 7 days</h3>
            <StepsBarChart data={summary} />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Sleep – 7 days</h3>
            <SleepChart data={summary} />
          </div>
        </div>
      )}
    </div>
  );
}
