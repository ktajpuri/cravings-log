"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Craving {
  id: string;
  intensity: number;
  trigger: string | null;
  notes: string | null;
  resisted: boolean;
  location: string | null;
  createdAt: string;
}

interface ChartDataPoint {
  date: string;
  count: number;
  avgIntensity: number;
  resisted: number;
}

interface CravingsChartProps {
  cravings: Craving[];
}

function buildChartData(cravings: Craving[], days = 14): ChartDataPoint[] {
  const today = new Date();
  const result: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dateStr = d.toISOString().slice(0, 10);

    const daysCravings = cravings.filter(
      (c) => c.createdAt.slice(0, 10) === dateStr
    );

    const count = daysCravings.length;
    const avgIntensity =
      count > 0
        ? Math.round(
            (daysCravings.reduce((sum, c) => sum + c.intensity, 0) / count) * 10
          ) / 10
        : 0;
    const resisted = daysCravings.filter((c) => c.resisted).length;

    result.push({ date: label, count, avgIntensity, resisted });
  }

  return result;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function CravingsChart({ cravings }: CravingsChartProps) {
  const data = buildChartData(cravings, 14);
  const hasData = cravings.length > 0;

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--md-shadow-1)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Last 14 days</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
            Cravings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
            Resisted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-rose-400 inline-block" />
            Avg intensity
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
          No cravings logged yet — start tracking to see your chart.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              yAxisId="count"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="intensity"
              orientation="right"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="count"
              dataKey="count"
              name="Cravings"
              fill="#818cf8"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              yAxisId="count"
              dataKey="resisted"
              name="Resisted"
              fill="#34d399"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              yAxisId="intensity"
              type="monotone"
              dataKey="avgIntensity"
              name="Avg intensity"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
