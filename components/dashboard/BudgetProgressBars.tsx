"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/types";

interface BudgetItem {
  _id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  percentage: number;
}

interface BudgetProgressBarsProps {
  budgets: BudgetItem[];
}

export function BudgetProgressBars({ budgets }: BudgetProgressBarsProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground py-6 text-center">
          No budgets set for this month.{" "}
          <a href="/budgets" className="text-primary underline">Add budgets →</a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Budget Utilization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((b) => {
          const pct = Math.min(100, b.percentage);
          const isWarning = pct >= 70 && pct < 90;
          const isDanger = pct >= 90;

          return (
            <div key={b._id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <span>{CATEGORY_ICONS[b.category as keyof typeof CATEGORY_ICONS] ?? "💰"}</span>
                  {b.category}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  isDanger ? "text-destructive" : isWarning ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={pct}
                  className={cn(
                    "h-2",
                    isDanger && "[&>div]:bg-destructive",
                    isWarning && "[&>div]:bg-yellow-500",
                    !isDanger && !isWarning && "[&>div]:bg-primary"
                  )}
                />
              </div>
              <div className="flex justify-end">
                <span className={cn(
                  "text-xs",
                  isDanger ? "text-destructive" : isWarning ? "text-yellow-500" : "text-green-500"
                )}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
