"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Target, Award, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const stats = [
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
      sub: "This month",
    },
    {
      label: "Budget Left",
      value: formatCurrency(Math.abs(saved)),
      icon: isOverBudget ? AlertTriangle : Target,
      color: isOverBudget ? "text-destructive" : "text-green-500",
      bg: isOverBudget ? "bg-destructive/10" : "bg-green-500/10",
      sub: isOverBudget ? "Over budget" : "Remaining",
    },
    {
      label: "Top Category",
      value: topCategory || "—",
      icon: Award,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      sub: "Highest spend",
    },
    {
      label: "vs Last Month",
      value: `${monthOverMonthChange >= 0 ? "+" : ""}${monthOverMonthChange.toFixed(1)}%`,
      icon: monthOverMonthChange >= 0 ? TrendingUp : TrendingDown,
      color: monthOverMonthChange > 10 ? "text-destructive" : monthOverMonthChange < 0 ? "text-green-500" : "text-muted-foreground",
      bg: monthOverMonthChange > 10 ? "bg-destructive/10" : monthOverMonthChange < 0 ? "bg-green-500/10" : "bg-muted",
      sub: "Month over month",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={cn("text-2xl font-bold mt-1", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
