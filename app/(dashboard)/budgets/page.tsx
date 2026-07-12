"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { formatCurrency, getCurrentMonth, cn, budgetUsageLevel, stripeGradient } from "@/lib/utils";
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, type ExpenseCategory } from "@/types";
import { Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Food", limit: "" });
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const budgets = useQuery(api.budgets.getBudgetUtilization, { month });
  const setBudget = useMutation(api.budgets.setBudget);
  const deleteBudget = useMutation(api.budgets.deleteBudget);

  const formIcon = customIcon ?? CATEGORY_ICONS[form.category as ExpenseCategory] ?? "💰";

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    if (!form.limit) return;
    try {
      await setBudget({
        category: form.category as ExpenseCategory,
        monthlyLimit: parseFloat(form.limit),
        month,
        icon: formIcon,
      });
      toast.success("Budget saved!");
      setOpen(false);
      setForm({ category: "Food", limit: "" });
      setCustomIcon(null);
    } catch {
      toast.error("Failed to save budget");
    }
  }

  const totalBudget = budgets?.reduce((s, b) => s + b.monthlyLimit, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overallLevel = budgetUsageLevel(overallPct);

  return (
    <>
      <Header title="Budgets" />
      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold">
            <CalendarDays className="h-4 w-4" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent outline-none"
            />
          </label>

          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) {
                setForm({ category: "Food", limit: "" });
                setCustomIcon(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>＋ Set budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set monthly budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a category and give it a memorable icon.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSet} className="mt-2 space-y-4.5">
                <div className="flex gap-3.5">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <EmojiPicker value={formIcon} onChange={setCustomIcon} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Category</Label>
                    <select
                      value={form.category}
                      onChange={(e) => {
                        setForm({ ...form, category: e.target.value });
                        setCustomIcon(null);
                      }}
                      className="h-14 w-full rounded-[14px] border-2 border-ink bg-white px-3.5 font-sans text-sm text-ink outline-none focus-visible:shadow-[3px_3px_0_var(--marigold)]"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_ICONS[c as keyof typeof CATEGORY_ICONS]} {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly limit (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 10000"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Save budget →
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overall summary */}
        {budgets && budgets.length > 0 && (
          <div className="rounded-[18px] border-2 border-ink bg-ink px-6 py-6 text-cream shadow-[4px_4px_0_var(--orange)]">
            <div className="mb-3.5 flex items-baseline justify-between">
              <p className="font-heading text-base font-bold">Overall budget</p>
              <p className="font-heading text-xl font-extrabold">
                {formatCurrency(totalSpent)}{" "}
                <span className="text-sm font-semibold text-cream/60">
                  / {formatCurrency(totalBudget)}
                </span>
              </p>
            </div>
            <div className="h-4 overflow-hidden rounded-full border-2 border-cream bg-cream/10">
              <div
                className="h-full"
                style={{
                  width: `${Math.min(overallPct, 100)}%`,
                  backgroundImage: stripeGradient(overallLevel),
                }}
              />
            </div>
            <p className="mt-2.5 text-xs font-semibold text-cream/60">
              {overallPct}% of budget used in {format(new Date(month + "-01"), "MMMM yyyy")} ·{" "}
              {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining
            </p>
          </div>
        )}

        {/* Budget cards */}
        {budgets === undefined ? (
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-[18px]" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="py-16 text-center text-ink/50">
            <p>No budgets set for {format(new Date(month + "-01"), "MMMM yyyy")}</p>
            <p className="mt-1 text-sm">Click &quot;Set budget&quot; to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const pct = Math.min(100, b.percentage);
              const level = budgetUsageLevel(pct);
              const isDanger = level === "danger";

              return (
                <div
                  key={b._id}
                  className={cn(
                    "rounded-[18px] border-2 bg-white p-5.5",
                    isDanger
                      ? "border-danger shadow-[3px_3px_0_var(--danger)]"
                      : "border-ink"
                  )}
                >
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="text-[15px] font-bold">
                      {b.icon ?? CATEGORY_ICONS[b.category as keyof typeof CATEGORY_ICONS] ?? "💰"}{" "}
                      {b.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border-2 border-ink px-3 py-0.5 text-xs font-bold",
                          isDanger
                            ? "bg-danger text-cream"
                            : level === "warning"
                              ? "bg-warning-tint text-warning"
                              : "bg-success-tint text-success"
                        )}
                      >
                        {pct}% used{isDanger && "!"}
                      </span>
                      <button
                        onClick={() => deleteBudget({ id: b._id })}
                        className="text-ink/40 transition-colors hover:text-danger"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundImage: stripeGradient(level) }}
                    />
                  </div>

                  <p className="text-[13px] font-semibold text-ink/65">
                    Spent {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-semibold",
                      isDanger ? "text-danger" : "text-ink/50"
                    )}
                  >
                    {isDanger
                      ? `Only ${formatCurrency(Math.max(0, b.monthlyLimit - b.spent))} left ⚠`
                      : `${formatCurrency(Math.max(0, b.monthlyLimit - b.spent))} left`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
