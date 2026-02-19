"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DailyStats } from "@/lib/api";

interface Props {
  data: DailyStats[];
}

function toHours(seconds: number) {
  return Math.round((seconds / 3600) * 10) / 10;
}

export function SleepChart({ data }: Props) {
  const chartData = data.map((d) => ({
    date: d.calendarDate?.slice(5) ?? "",
    sleep: toHours(d.sleepingSeconds ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={40}
          unit="h"
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#a78bfa" }}
          formatter={(v: number) => [`${v}h`, "Sleep"]}
        />
        <Bar dataKey="sleep" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
