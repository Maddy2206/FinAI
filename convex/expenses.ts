import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getAuthUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  return user;
}

export const addExpense = mutation({
  args: {
    amount: v.number(),
    category: v.union(
      v.literal("Food"), v.literal("Travel"), v.literal("Shopping"),
      v.literal("Rent"), v.literal("Utilities"), v.literal("Entertainment"),
      v.literal("Healthcare"), v.literal("Subscriptions"), v.literal("Other")
    ),
    description: v.string(),
    date: v.number(),
    isRecurring: v.optional(v.boolean()),
    receiptId: v.optional(v.id("receipts")),
    source: v.optional(v.union(v.literal("manual"), v.literal("ocr"), v.literal("nlp"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return ctx.db.insert("expenses", {
      userId: user._id,
      amount: args.amount,
      category: args.category,
      description: args.description,
      date: args.date,
      isRecurring: args.isRecurring ?? false,
      receiptId: args.receiptId,
      source: args.source ?? "manual",
      createdAt: Date.now(),
    });
  },
});

export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    amount: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("Food"), v.literal("Travel"), v.literal("Shopping"),
      v.literal("Rent"), v.literal("Utilities"), v.literal("Entertainment"),
      v.literal("Healthcare"), v.literal("Subscriptions"), v.literal("Other")
    )),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== user._id) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const getExpensesByMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const [year, monthNum] = args.month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1).getTime();
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

    return ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end)
      )
      .order("desc")
      .collect();
  },
});

export const getExpenseSummaryByCategory = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const [year, monthNum] = args.month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1).getTime();
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end)
      )
      .collect();

    const summary: Record<string, number> = {};
    for (const e of expenses) {
      summary[e.category] = (summary[e.category] ?? 0) + e.amount;
    }

    return Object.entries(summary).map(([category, total]) => ({
      category,
      total,
    }));
  },
});

export const getMonthlyTotals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const now = new Date();
    const results: { month: string; total: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const start = d.getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", user._id).gte("date", start).lte("date", end)
        )
        .collect();

      results.push({
        month,
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    return results;
  },
});

export const getRecentExpenses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    return ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 5);
  },
});

export const getAllExpensesLast90Days = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const since = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", since)
      )
      .order("desc")
      .collect();
  },
});

export const getExpensesForUserInRange = internalQuery({
  args: {
    userId: v.id("users"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", args.startTime).lte("date", args.endTime)
      )
      .collect();
  },
});
