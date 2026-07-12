"use client";

import { CATEGORY_COLORS } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SpendingPieChartProps {
  data: { category: string; total: number }[];
}

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-[18px] border-2 border-ink bg-white p-6">
        <p className="mb-5 font-heading text-base font-bold">Spending by category</p>
        <div className="flex h-[140px] items-center justify-center text-sm text-ink/50">
          No expenses this month
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const total = sorted.reduce((s, d) => s + d.total, 0) || 1;

  let cursor = 0;
  const stops = sorted.map((d) => {
    const pct = (d.total / total) * 100;
    const color = CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS] ?? "#a89f8a";
    const stop = `${color} ${cursor}% ${cursor + pct}%`;
    cursor += pct;
    return stop;
  });

  return (
    <div className="rounded-[18px] border-2 border-ink bg-white p-6">
      <p className="mb-5 font-heading text-base font-bold">Spending by category</p>
      <div className="flex items-center gap-7">
        <div
          className="relative h-[140px] w-[140px] shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        >
          <div className="absolute inset-[34px] rounded-full border-2 border-ink bg-white" />
        </div>
        <div className="flex flex-1 flex-col gap-2.5 text-[13px] font-semibold">
          {sorted.map((d) => (
            <div key={d.category} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-[4px] border-2 border-ink"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS] ?? "#a89f8a",
                }}
              />
              {d.category}
              <span className="ml-auto">{formatCurrency(d.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
