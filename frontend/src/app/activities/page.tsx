import { getActivities } from "@/lib/api";
import { ActivityCard } from "@/components/ActivityCard";
import Link from "next/link";

const ACTIVITY_TYPES = [
  { key: "", label: "All" },
  { key: "running", label: "Running" },
  { key: "cycling", label: "Cycling" },
  { key: "swimming", label: "Swimming" },
  { key: "hiking", label: "Hiking" },
  { key: "walking", label: "Walking" },
  { key: "strength_training", label: "Strength" },
];

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{
    type?: string;
    from_date?: string;
    to_date?: string;
    page?: string;
  }>;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { type, from_date, to_date, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? "1"));
  const start = (page - 1) * PAGE_SIZE;

  const result = await getActivities({
    limit: PAGE_SIZE,
    start,
    type: type || undefined,
    from_date: from_date || undefined,
    to_date: to_date || undefined,
  }).catch(() => ({ activities: [], count: 0, offset: 0 }));

  const { activities, count } = result;
  const hasNextPage = count === PAGE_SIZE; // Garmin doesn't return total, so check if page is full

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { type, from_date, to_date, page: "1", ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `/activities?${params}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Activities</h2>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
        {/* Type filter */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Activity type</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(({ key, label }) => (
              <Link
                key={key}
                href={buildHref({ type: key || undefined, page: "1" })}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  (type ?? "") === key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Date range filter */}
        <form method="GET" action="/activities" className="flex flex-wrap gap-3 items-end">
          {type && <input type="hidden" name="type" value={type} />}
          <div>
            <label className="block text-xs text-slate-400 mb-1">From</label>
            <input
              type="date"
              name="from_date"
              defaultValue={from_date ?? ""}
              className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To</label>
            <input
              type="date"
              name="to_date"
              defaultValue={to_date ?? ""}
              className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            Filter
          </button>
          {(from_date || to_date) && (
            <Link
              href={buildHref({ from_date: undefined, to_date: undefined })}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Activity list */}
      {activities.length > 0 ? (
        <div className="flex flex-col gap-3">
          {activities.map((a) => (
            <ActivityCard key={a.activityId} activity={a} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
          No activities found for the selected filters.
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || hasNextPage) && (
        <div className="flex justify-between items-center pt-2">
          {page > 1 ? (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded-lg transition-colors"
            >
              ← Previous
            </Link>
          ) : (
            <div />
          )}
          <span className="text-sm text-slate-400">Page {page}</span>
          {hasNextPage && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded-lg transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
