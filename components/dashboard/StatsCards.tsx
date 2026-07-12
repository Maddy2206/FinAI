"use client";

import { Wallet, CircleCheckBig, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { CATEGORY_ICONS, type ExpenseCategory } from "@/types";

interface StatsCardsProps {
  totalSpent: number;
  totalBudget: number;
  topCategory: string;
  monthOverMonthChange: number;
  healthScore: number;
}

export function StatsCards({
  totalSpent,
  totalBudget,
  topCategory,
  monthOverMonthChange,
}: StatsCardsProps) {
  const saved = totalBudget > 0 ? totalBudget - totalSpent : 0;
  const isOverBudget = saved < 0;
  const isUp = monthOverMonthChange >= 0;
  const categoryEmoji = CATEGORY_ICONS[topCategory as ExpenseCategory] ?? "💰";

  const stats = [
    {
      label: "Total spent",
      value: formatCurrency(totalSpent),
      icon: Wallet,
      chipBg: "bg-marigold",
      iconColor: "#1c1b2e",
      valueColor: "text-ink",
      sub: "This month",
    },
    {
      label: "Budget left",
      value: formatCurrency(Math.abs(saved)),
      icon: isOverBudget ? AlertTriangle : CircleCheckBig,
      chipBg: isOverBudget ? "bg-danger-tint" : "bg-success-tint",
      iconColor: isOverBudget ? "#d92d20" : "#1e9e6a",
      valueColor: isOverBudget ? "text-danger" : "text-success",
      sub: isOverBudget ? "Over budget" : "Remaining",
    },
    {
      label: "Top category",
      value: topCategory || "—",
      emoji: categoryEmoji,
      valueColor: "text-ink",
      sub: "Highest spend",
    },
    {
      label: "vs last month",
      value: `${isUp ? "+" : ""}${monthOverMonthChange.toFixed(1)}%`,
      icon: isUp ? TrendingUp : TrendingDown,
      chipBg: "bg-tint-food",
      iconColor: "#f4650c",
      valueColor: "text-orange",
      sub: "Month over month",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[18px] border-2 border-ink bg-white p-5 shadow-[4px_4px_0_var(--ink)]"
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/55">
              {stat.label}
            </p>
            {stat.emoji ? (
              <span className="text-[17px]">{stat.emoji}</span>
            ) : (
              stat.icon && (
                <div
                  className={cn(
                    "flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border-2 border-ink",
                    stat.chipBg
                  )}
                >
                  <stat.icon
                    style={{ height: 13, width: 13 }}
                    stroke={stat.iconColor}
                    strokeWidth={2.5}
                  />
                </div>
              )
            )}
          </div>
          <p className={cn("mt-2 font-heading text-[28px] font-extrabold tracking-[-0.01em]", stat.valueColor)}>
            {stat.value}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink/55">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
