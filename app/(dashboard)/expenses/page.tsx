"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { NaturalLanguageInput } from "@/components/expenses/NaturalLanguageInput";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ExpensesPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<any>(null);
  const expenses = useQuery(api.expenses.getExpensesByMonth, { month });
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  const total = expenses?.reduce((s: number, e: { amount: number }) => s + e.amount, 0) ?? 0;

  async function handleDelete(id: string) {
    try {
      await deleteExpense({ id: id as any });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function handleNLPParsed(data: any) {
    setPrefill(data);
    setOpen(true);
  }

  return (
    <>
      <Header title="Expenses" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setPrefill(null)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm initial={prefill} onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* NLP input */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            AI Quick Entry
          </p>
          <NaturalLanguageInput onParsed={handleNLPParsed} />
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {format(new Date(month + "-01"), "MMMM yyyy")} · {expenses?.length ?? 0} transactions
          </h2>
          <span className="text-sm font-semibold text-destructive">-{formatCurrency(total)}</span>
        </div>

        {/* Expense list */}
        {expenses === undefined ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No expenses in {format(new Date(month + "-01"), "MMMM yyyy")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense: any) => (
              <div
                key={expense._id}
                className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-4 hover:border-border transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]}20`,
                  }}
                >
                  {CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS] ?? "💰"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs py-0">
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                    {expense.isRecurring && (
                      <Badge variant="outline" className="text-xs py-0">Recurring</Badge>
                    )}
                  </div>
                </div>

                <span className="text-sm font-semibold text-destructive shrink-0">
                  -{formatCurrency(expense.amount)}
                </span>

                <button
                  onClick={() => handleDelete(expense._id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-1"
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
