"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, type ExpenseCategory } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Food", limit: "" });
  const budgets = useQuery(api.budgets.getBudgetUtilization, { month });
  const setBudget = useMutation(api.budgets.setBudget);
  const deleteBudget = useMutation(api.budgets.deleteBudget);

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    if (!form.limit) return;
    try {
      await setBudget({ category: form.category as ExpenseCategory, monthlyLimit: parseFloat(form.limit), month });
      toast.success("Budget saved!");
      setOpen(false);
      setForm({ category: "Food", limit: "" });
    } catch {
      toast.error("Failed to save budget");
    }
  }

  const totalBudget = budgets?.reduce((s, b) => s + b.monthlyLimit, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <>
      <Header title="Budgets" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Set Budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Monthly Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSet} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c as keyof typeof CATEGORY_ICONS]} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Monthly Limit (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 10000"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Save Budget</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overall summary */}
        {budgets && budgets.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-foreground">Overall Budget</p>
                <span className={cn(
                  "text-sm font-semibold",
                  overallPct >= 90 ? "text-destructive" : overallPct >= 70 ? "text-yellow-500" : "text-green-500"
                )}>
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <Progress
                value={Math.min(overallPct, 100)}
                className={cn(
                  "h-3",
                  overallPct >= 90 && "[&>div]:bg-destructive",
                  overallPct >= 70 && overallPct < 90 && "[&>div]:bg-yellow-500",
                  overallPct < 70 && "[&>div]:bg-green-500"
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">{overallPct}% of budget used in {format(new Date(month + "-01"), "MMMM yyyy")}</p>
            </CardContent>
          </Card>
        )}

        {/* Budget cards */}
        {budgets === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No budgets set for {format(new Date(month + "-01"), "MMMM yyyy")}</p>
            <p className="text-sm mt-1">Click &quot;Set Budget&quot; to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const pct = Math.min(100, b.percentage);
              const isDanger = pct >= 90;
              const isWarning = pct >= 70 && pct < 90;

              return (
                <Card key={b._id} className={cn(
                  "border-border/50 hover:border-border transition-colors",
                  isDanger && "border-destructive/30"
                )}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[b.category as keyof typeof CATEGORY_ICONS] ?? "💰"}</span>
                        <span className="font-semibold text-sm">{b.category}</span>
                      </div>
                      <button
                        onClick={() => deleteBudget({ id: b._id })}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Progress
                      value={pct}
                      className={cn(
                        "h-2",
                        isDanger && "[&>div]:bg-destructive",
                        isWarning && "[&>div]:bg-yellow-500",
                        !isDanger && !isWarning && "[&>div]:bg-green-500"
                      )}
                    />

                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Spent: {formatCurrency(b.spent)}</span>
                      <span className={cn(
                        "font-medium",
                        isDanger ? "text-destructive" : isWarning ? "text-yellow-500" : "text-green-500"
                      )}>
                        {pct}% used
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Limit: {formatCurrency(b.monthlyLimit)} · Left: {formatCurrency(Math.max(0, b.monthlyLimit - b.spent))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
