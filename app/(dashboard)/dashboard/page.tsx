"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SpendingPieChart } from "@/components/dashboard/SpendingPieChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { BudgetProgressBars } from "@/components/dashboard/BudgetProgressBars";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentMonth } from "@/lib/utils";

export default function DashboardPage() {
  const currentMonth = getCurrentMonth();

  const categorySummary = useQuery(api.expenses.getExpenseSummaryByCategory, { month: currentMonth });
  const monthlyTotals = useQuery(api.expenses.getMonthlyTotals);
  const budgetUtilization = useQuery(api.budgets.getBudgetUtilization, { month: currentMonth });
  const recentExpenses = useQuery(api.expenses.getRecentExpenses, { limit: 5 });
  const healthScore = useQuery(api.insights.computeHealthScore, { month: currentMonth });

  const isLoading =
    categorySummary === undefined ||
    monthlyTotals === undefined ||
    budgetUtilization === undefined ||
    recentExpenses === undefined ||
    healthScore === undefined;

  const totalSpent = categorySummary?.reduce((s, c) => s + c.total, 0) ?? 0;
  const totalBudget = budgetUtilization?.reduce((s, b) => s + b.monthlyLimit, 0) ?? 0;
  const topCategory = categorySummary?.slice().sort((a, b) => b.total - a.total)[0]?.category ?? "—";

  const currentMonthTotal = monthlyTotals?.[11]?.total ?? 0;
  const prevMonthTotal = monthlyTotals?.[10]?.total ?? 0;
  const monthOverMonthChange =
    prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex-1 space-y-5.5 overflow-y-auto p-7">
          <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[18px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-[18px] lg:col-span-2" />
            <Skeleton className="h-64 rounded-[18px]" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-5.5 overflow-y-auto p-7">
        <StatsCards
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          topCategory={topCategory}
          monthOverMonthChange={monthOverMonthChange}
          healthScore={healthScore ?? 75}
        />

        <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyTrendChart data={monthlyTotals ?? []} />
          </div>
          <FinancialHealthScore score={healthScore ?? 75} />
        </div>

        <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
          <SpendingPieChart data={categorySummary ?? []} />
          <BudgetProgressBars budgets={budgetUtilization ?? []} />
        </div>

        <RecentTransactions transactions={recentExpenses ?? []} />
      </div>
    </>
  );
}
