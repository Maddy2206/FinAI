"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface MonthlyTrendChartProps {
  data: { month: string; total: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const [year, month] = label.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
        <p className="text-sm font-semibold text-primary">{formatCurrency(payload[0]?.value ?? 0)}</p>
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5), // "MM" portion
  }));

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">12-Month Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(v) => {
                const [, m] = v.split("-");
                return format(new Date(2024, Number(m) - 1), "MMM");
              }}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
