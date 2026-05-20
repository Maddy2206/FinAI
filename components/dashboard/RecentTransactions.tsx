"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";
import Link from "next/link";

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        <Link href="/expenses" className="text-xs text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS]}20`,
                  }}
                >
                  {CATEGORY_ICONS[tx.category as keyof typeof CATEGORY_ICONS] ?? "💰"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} • {formatDate(tx.date)}</p>
                </div>
                <span className="text-sm font-semibold text-destructive shrink-0">
                  -{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
