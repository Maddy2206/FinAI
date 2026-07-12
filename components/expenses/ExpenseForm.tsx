"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, type ExpenseCategory } from "@/types";
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
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [form, setForm] = useState({
    amount: initial?.amount?.toString() ?? "",
    category: initial?.category ?? "Food",
    description: initial?.description ?? "",
    date: initial?.date != null ? format(new Date(initial.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    isRecurring: false,
  });

  const category = form.category as ExpenseCategory;
  const icon = customIcon ?? CATEGORY_ICONS[category] ?? "💰";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description) return;

    setLoading(true);
    try {
      await addExpense({
        amount: parseFloat(form.amount),
        category,
        description: form.description,
        date: new Date(form.date).getTime(),
        isRecurring: form.isRecurring,
        icon,
        source: "manual",
      });
      toast.success("Expense added!");
      onSuccess?.();
      setForm({ amount: "", category: "Food", description: "", date: format(new Date(), "yyyy-MM-dd"), isRecurring: false });
      setCustomIcon(null);
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4.5">
      <div className="flex gap-3.5">
        <div className="space-y-2">
          <Label>Icon</Label>
          <EmojiPicker value={icon} onChange={setCustomIcon} />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              setCustomIcon(null);
            }}
            className="h-14 w-full rounded-[14px] border-2 border-ink bg-white px-3.5 font-sans text-sm text-ink outline-none focus-visible:shadow-[3px_3px_0_var(--marigold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What did you spend on?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="recurring"
          checked={form.isRecurring}
          onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
          className="h-4 w-4 rounded border-2 border-ink accent-orange"
        />
        <Label htmlFor="recurring" className="cursor-pointer text-sm font-medium">
          Recurring expense
        </Label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Adding…" : "Add expense →"}
      </Button>
    </form>
  );
}
