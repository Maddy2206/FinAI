"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { NaturalLanguageInput } from "@/components/expenses/NaturalLanguageInput";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import { CATEGORY_TINTS, CATEGORY_ICONS, type ExpenseCategory } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ExpensesPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ amount?: number; category?: string; description?: string; date?: number } | null>(null);
  const expenses = useQuery(api.expenses.getExpensesByMonth, { month });
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  const total = expenses?.reduce((s: number, e: { amount: number }) => s + e.amount, 0) ?? 0;

  async function handleDelete(id: string) {
    try {
      await deleteExpense({ id: id as Id<"expenses"> });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function handleNLPParsed(data: { amount: number; category: string; description: string; date: number }) {
    setPrefill(data);
    setOpen(true);
  }

  return (
    <>
      <Header title="Expenses" />
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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setPrefill(null)}>＋ Add expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add expense</DialogTitle>
                <DialogDescription>
                  Log a purchase and pick an icon to help it stand out in your feed.
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm initial={prefill ?? undefined} onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* NLP input */}
        <NaturalLanguageInput onParsed={handleNLPParsed} />

        {/* Summary */}
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold text-ink/60">
            {format(new Date(month + "-01"), "MMMM yyyy")} · {expenses?.length ?? 0} transactions
          </p>
          <p className="font-heading text-lg font-extrabold">−{formatCurrency(total)}</p>
        </div>

        {/* Expense list */}
        {expenses === undefined ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-ink/50">
            <p>No expenses in {format(new Date(month + "-01"), "MMMM yyyy")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center gap-3.5 rounded-2xl border-2 border-ink bg-white px-4.5 py-3.5 transition-shadow hover:shadow-[3px_3px_0_var(--ink)]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-[17px]"
                  style={{
                    backgroundColor:
                      CATEGORY_TINTS[expense.category as ExpenseCategory] ?? "#e8e0d0",
                  }}
                >
                  {expense.icon ?? CATEGORY_ICONS[expense.category as ExpenseCategory] ?? "💰"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{expense.description}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 text-[11px] font-bold">
                      {expense.category}
                    </span>
                    <span className="text-xs text-ink/55">{formatDate(expense.date)}</span>
                    {expense.isRecurring && (
                      <span className="rounded-full border-2 border-orange px-2.5 py-0.5 text-[11px] font-bold text-orange">
                        Recurring
                      </span>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-[15px] font-bold">
                  −{formatCurrency(expense.amount)}
                </span>

                <button
                  onClick={() => handleDelete(expense._id)}
                  className="ml-1 shrink-0 text-ink/40 transition-colors hover:text-danger"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
