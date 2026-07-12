"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS, type ExpenseCategory } from "@/types";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const categorySummary = useQuery(api.expenses.getExpenseSummaryByCategory, { month });
  const monthlyTotals = useQuery(api.expenses.getMonthlyTotals);
  const allExpenses = useQuery(api.expenses.getAllExpensesLast90Days);

  // Day-of-week breakdown
  const dayOfWeekData = (() => {
    if (!allExpenses) return [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals: number[] = new Array(7).fill(0);
    for (const e of allExpenses) {
      totals[new Date(e.date).getDay()] += e.amount;
    }
    return days.map((d, i) => ({ day: d, total: totals[i] }));
  })();
  const dayMax = Math.max(...dayOfWeekData.map((d) => d.total), 1);

  const categoryBreakdown = [...(categorySummary ?? [])].sort((a, b) => b.total - a.total);
  const categoryMax = Math.max(...categoryBreakdown.map((c) => c.total), 1);

  const subscriptions = allExpenses?.filter((e) => e.category === "Subscriptions") ?? [];

  // 12-month trend polyline
  const trend = monthlyTotals ?? [];
  const trendMax = Math.max(...trend.map((d) => d.total), 1);
  const trendMin = Math.min(...trend.map((d) => d.total), 0);
  const chartW = 720;
  const chartH = 170;
  const padY = 20;
  const points = trend.map((d, i) => {
    const x = trend.length > 1 ? (i / (trend.length - 1)) * chartW : 0;
    const range = trendMax - trendMin || 1;
    const y = chartH - padY - ((d.total - trendMin) / range) * (chartH - padY * 2);
    return { x, y, month: d.month, total: d.total };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        <label className="flex w-fit items-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold">
          <CalendarDays className="h-4 w-4" />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
          {/* Category breakdown */}
          <div className="rounded-[18px] border-2 border-ink bg-white p-6">
            <p className="mb-5 font-heading text-base font-bold">
              Category breakdown — {format(new Date(month + "-01"), "MMMM yyyy")}
            </p>
            {categoryBreakdown.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/50">No expenses this month</p>
            ) : (
              <div className="flex flex-col gap-3">
                {categoryBreakdown.map((c) => (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span>
                        {c.category}
                      </span>
                      <span>{formatCurrency(c.total)}</span>
                    </div>
                    <div className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-cream">
                      <div
                        className="h-full"
                        style={{
                          width: `${(c.total / categoryMax) * 100}%`,
                          backgroundColor:
                            CATEGORY_COLORS[c.category as ExpenseCategory] ?? "#a89f8a",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day of week */}
          <div className="rounded-[18px] border-2 border-ink bg-white p-6">
            <p className="mb-5 font-heading text-base font-bold">
              Spending by day of week{" "}
              <span className="text-xs font-semibold text-ink/50">(last 90 days)</span>
            </p>
            <div className="flex h-[180px] items-end gap-3">
              {dayOfWeekData.map((d) => {
                const isTop = d.total === dayMax && dayMax > 0;
                const isElevated = !isTop && d.total >= dayMax * 0.55;
                return (
                  <div
                    key={d.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <div
                      className="w-full rounded-t-[8px] border-2 border-b-0 border-ink"
                      style={{
                        height: `${Math.max(4, (d.total / dayMax) * 100)}%`,
                        backgroundColor: isTop ? "#f4650c" : isElevated ? "#ffb02e" : "#e8e0d0",
                      }}
                    />
                    <span className={isTop ? "text-[11px] font-extrabold" : "text-[11px] font-bold"}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 12-month trend */}
        <div className="rounded-[18px] border-2 border-ink bg-white p-6">
          <p className="mb-4 font-heading text-base font-bold">12-month trend</p>
          {trend.length > 0 && (
            <>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="block w-full">
                <line x1={0} y1={chartH - padY} x2={chartW} y2={chartH - padY} stroke="#1c1b2e" strokeWidth={2} />
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#f4650c"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, i) => (
                  <circle
                    key={p.month}
                    cx={p.x}
                    cy={p.y}
                    r={i === points.length - 1 ? 6 : 5}
                    fill={i === points.length - 1 ? "#f4650c" : "#ffb02e"}
                    stroke="#1c1b2e"
                    strokeWidth={2}
                  >
                    <title>
                      {format(new Date(2024, Number(p.month.split("-")[1]) - 1), "MMM")}:{" "}
                      {formatCurrency(p.total)}
                    </title>
                  </circle>
                ))}
              </svg>
              <div className="mt-2 flex justify-between text-[11px] font-bold text-ink/50">
                {trend.map((d, i) => (
                  <span
                    key={d.month}
                    className={i === trend.length - 1 ? "text-orange" : undefined}
                  >
                    {format(new Date(2024, Number(d.month.split("-")[1]) - 1), "MMM")}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Subscriptions */}
        <div className="rounded-[18px] border-2 border-ink bg-white p-6">
          <p className="mb-3.5 font-heading text-base font-bold">
            Subscription tracker{" "}
            <span className="text-xs font-semibold text-ink/50">(last 90 days)</span>
          </p>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-ink/50">No subscriptions found</p>
          ) : (
            <div className="flex flex-col">
              {subscriptions.map((s, i) => (
                <div
                  key={s._id}
                  className={
                    i < subscriptions.length - 1
                      ? "flex items-center justify-between border-b-2 border-ink/[0.08] py-3"
                      : "flex items-center justify-between py-3"
                  }
                >
                  <div>
                    <p className="text-sm font-bold">{s.description}</p>
                    <p className="text-xs font-semibold text-ink/55">
                      {format(new Date(s.date), "MMM d, yyyy")} · monthly
                    </p>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
