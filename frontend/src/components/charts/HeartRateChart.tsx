"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HeartRateData } from "@/lib/api";

interface Props {
  data: HeartRateData;
}

export function HeartRateChart({ data }: Props) {
  // heartRateValues is an array of [timestamp_ms, bpm | null]
  const chartData = (data.heartRateValues ?? [])
    .filter(([, bpm]) => bpm !== null)
    .map(([ts, bpm]) => ({
      time: new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      bpm,
    }))
    // Downsample to ~120 points so the chart is readable
    .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 120)) === 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
          width={40}
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#e2e8f0" }}
          itemStyle={{ color: "#f87171" }}
          formatter={(v: number) => [`${v} bpm`, "Heart Rate"]}
        />
        <Area
          type="monotone"
          dataKey="bpm"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#hrGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
