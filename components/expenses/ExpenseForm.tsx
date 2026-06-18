"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExpenseFormProps {
  onSuccess?: () => void;
  initial?: {
    amount?: number;
    category?: string;
    description?: string;
    date?: number;
  };
}

export function ExpenseForm({ onSuccess, initial }: ExpenseFormProps) {
  const addExpense = useMutation(api.expenses.addExpense);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: initial?.amount?.toString() ?? "",
    category: initial?.category ?? "Food",
    description: initial?.description ?? "",
    date: initial?.date != null ? format(new Date(initial.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    isRecurring: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description) return;

    setLoading(true);
    try {
      await addExpense({
        amount: parseFloat(form.amount),
        category: form.category as ExpenseCategory,
        description: form.description,
        date: new Date(form.date).getTime(),
        isRecurring: form.isRecurring,
        source: "manual",
      });
      toast.success("Expense added!");
      onSuccess?.();
      setForm({ amount: "", category: "Food", description: "", date: format(new Date(), "yyyy-MM-dd"), isRecurring: false });
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What did you spend on?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurring"
          checked={form.isRecurring}
          onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
          Recurring expense
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
