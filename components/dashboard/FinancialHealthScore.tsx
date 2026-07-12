"use client";

import { cn } from "@/lib/utils";

interface FinancialHealthScoreProps {
  score: number;
}

export function FinancialHealthScore({ score }: FinancialHealthScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));

  const color =
    clampedScore >= 80 ? "#1e9e6a" : clampedScore >= 60 ? "#d97706" : "#d92d20";
  const label =
    clampedScore >= 80
      ? "Excellent"
      : clampedScore >= 60
        ? "Good"
        : clampedScore >= 40
          ? "Fair"
          : "Needs work";

  return (
    <div className="flex flex-col items-center rounded-[18px] border-2 border-ink bg-white p-6 shadow-[4px_4px_0_var(--marigold)]">
      <p className="mb-4 self-start font-heading text-base font-bold">Financial health</p>
      <div
        className="flex h-[130px] w-[130px] items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} 0% ${clampedScore}%, #e8e0d0 ${clampedScore}% 100%)`,
        }}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-ink bg-white">
          <span className="font-heading text-[32px] font-extrabold leading-none">
            {clampedScore}
          </span>
          <span className="text-[11px] font-semibold text-ink/50">/ 100</span>
        </div>
      </div>
      <span
        className={cn(
          "mt-4 rounded-full border-2 border-ink px-4 py-1 text-[13px] font-bold",
          clampedScore >= 80 && "bg-success-tint text-success",
          clampedScore >= 60 && clampedScore < 80 && "bg-warning-tint text-warning",
          clampedScore < 60 && "bg-danger-tint text-danger"
        )}
      >
        {label} {clampedScore >= 80 && "✓"}
      </span>
    </div>
  );
}
