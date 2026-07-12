"use client";

import { formatCurrency, cn, budgetUsageLevel, stripeGradient } from "@/lib/utils";
import { CATEGORY_ICONS, type ExpenseCategory } from "@/types";

interface BudgetItem {
  _id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  percentage: number;
  icon?: string;
}

interface BudgetProgressBarsProps {
  budgets: BudgetItem[];
}

export function BudgetProgressBars({ budgets }: BudgetProgressBarsProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="rounded-[18px] border-2 border-ink bg-white p-6">
        <p className="mb-3 font-heading text-base font-bold">Budget progress</p>
        <div className="py-6 text-center text-sm text-ink/60">
          No budgets set for this month.{" "}
          <a href="/budgets" className="font-bold text-orange underline">
            Add budgets →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border-2 border-ink bg-white p-6">
      <p className="mb-5 font-heading text-base font-bold">Budget progress</p>
      <div className="flex flex-col gap-4">
        {budgets.map((b) => {
          const pct = Math.min(100, b.percentage);
          const level = budgetUsageLevel(pct);
          return (
            <div key={b._id}>
              <div className="mb-1.5 flex justify-between text-[13px] font-semibold">
                <span>
                  {b.icon ?? CATEGORY_ICONS[b.category as ExpenseCategory] ?? "💰"} {b.category}
                </span>
                <span
                  className={cn(
                    level === "danger"
                      ? "text-danger"
                      : level === "warning"
                        ? "text-warning"
                        : "text-success"
                  )}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
                <div
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundImage: stripeGradient(level) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
