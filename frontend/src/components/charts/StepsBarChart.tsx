"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyStats } from "@/lib/api";

interface Props {
  data: DailyStats[];
}

export function StepsBarChart({ data }: Props) {
  const chartData = data.map((d) => ({
    date: d.calendarDate?.slice(5) ?? "",
    steps: d.totalSteps ?? 0,
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
          width={50}
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#60a5fa" }}
          formatter={(v: number) => [v.toLocaleString(), "Steps"]}
        />
        <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={i === chartData.length - 1 ? "#3b82f6" : "#1d4ed8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
