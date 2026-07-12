"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface MonthlyTrendChartProps {
  data: { month: string; total: number }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="rounded-[18px] border-2 border-ink bg-white p-6">
      <p className="mb-5 font-heading text-base font-bold">Monthly trend</p>
      <div className="relative flex h-[150px] items-end gap-2.5">
        {data.map((d, i) => {
          const isCurrent = i === data.length - 1;
          const [, m] = d.month.split("-");
          const heightPct = Math.max(4, (d.total / max) * 100);
          return (
            <div
              key={d.month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              {hovered === i && (
                <div className="absolute -translate-y-8 rounded-[10px] border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0_var(--ink)]">
                  {formatCurrency(d.total)}
                </div>
              )}
              <div
                className="w-full rounded-t-[6px] border-2 border-b-0 border-ink"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isCurrent ? "#f4650c" : "#e8e0d0",
                }}
              />
              <span
                className={
                  isCurrent
                    ? "text-[10px] font-extrabold text-ink"
                    : "text-[10px] font-bold text-ink/50"
                }
              >
                {format(new Date(2024, Number(m) - 1), "MMM")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
