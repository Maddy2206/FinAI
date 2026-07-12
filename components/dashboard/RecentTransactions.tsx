"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_TINTS, CATEGORY_ICONS, type ExpenseCategory } from "@/types";
import Link from "next/link";

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: number;
  icon?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-[18px] border-2 border-ink bg-white p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-heading text-base font-bold">Recent transactions</p>
        <Link href="/expenses" className="text-[13px] font-bold text-orange hover:text-ink">
          View all →
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/50">No transactions yet</p>
      ) : (
        <div className="flex flex-col">
          {transactions.map((tx, i) => (
            <div
              key={tx._id}
              className={
                i < transactions.length - 1
                  ? "flex items-center gap-3.5 border-b-2 border-ink/[0.08] py-3"
                  : "flex items-center gap-3.5 py-3"
              }
            >
              <div
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border-2 border-ink text-base"
                style={{
                  backgroundColor:
                    CATEGORY_TINTS[tx.category as ExpenseCategory] ?? "#e8e0d0",
                }}
              >
                {tx.icon ?? CATEGORY_ICONS[tx.category as ExpenseCategory] ?? "💰"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{tx.description}</p>
                <p className="text-xs text-ink/55">
                  {tx.category} · {formatDate(tx.date)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold">
                −{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
