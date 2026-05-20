"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/types";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const categorySummary = useQuery(api.expenses.getExpenseSummaryByCategory, { month });
  const monthlyTotals = useQuery(api.expenses.getMonthlyTotals);
  const allExpenses = useQuery(api.expenses.getAllExpensesLast90Days);

  // Day-of-week breakdown
  const dayOfWeekData = (() => {
    if (!allExpenses) return [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals: number[] = new Array(7).fill(0);
    for (const e of allExpenses) {
      totals[new Date(e.date).getDay()] += e.amount;
    }
    return days.map((d, i) => ({ day: d, total: totals[i] }));
  })();

  // Subscription detection
  const subscriptions = allExpenses?.filter((e: any) => e.category === "Subscriptions") ?? [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />

        {/* Category bar chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown — {format(new Date(month + "-01"), "MMMM yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categorySummary ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
                <Bar
                  dataKey="total"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day of week */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Spending by Day of Week (Last 90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayOfWeekData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 12-month line trend */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">12-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTotals ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v) => { const [, m] = v.split("-"); return format(new Date(2024, Number(m) - 1), "MMM"); }}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Subscription Tracker (Last 90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions found</p>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((s: any) => (
                  <div key={s._id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{s.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(s.date), "MMM d, yyyy")}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
