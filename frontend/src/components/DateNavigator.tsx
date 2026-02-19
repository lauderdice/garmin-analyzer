"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  date: string; // YYYY-MM-DD
  basePath: string;
}

export function DateNavigator({ date, basePath }: Props) {
  const router = useRouter();

  function navigate(days: number) {
    const d = new Date(date + "T12:00:00"); // noon avoids DST issues
    d.setDate(d.getDate() + days);
    router.push(`${basePath}?date=${d.toISOString().split("T")[0]}`);
  }

  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-slate-200 min-w-[120px] text-center">
        {isToday ? "Today" : date}
      </span>
      <button
        onClick={() => navigate(1)}
        disabled={isToday}
        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next day"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
