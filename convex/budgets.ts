import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

const categoryValidator = v.union(
  v.literal("Food"), v.literal("Travel"), v.literal("Shopping"),
  v.literal("Rent"), v.literal("Utilities"), v.literal("Entertainment"),
  v.literal("Healthcare"), v.literal("Subscriptions"), v.literal("Other")
);

async function getAuthUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  return user;
}

export const setBudget = mutation({
  args: {
    category: categoryValidator,
    monthlyLimit: v.number(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q: any) => q.eq("userId", user._id).eq("month", args.month))
      .filter((q: any) => q.eq(q.field("category"), args.category))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { monthlyLimit: args.monthlyLimit });
      return existing._id;
    }

    return ctx.db.insert("budgets", {
      userId: user._id,
      category: args.category,
      monthlyLimit: args.monthlyLimit,
      month: args.month,
      createdAt: Date.now(),
    });
  },
});

export const deleteBudget = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const getBudgetsForMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    return ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("month", args.month)
      )
      .collect();
  },
});

export const getBudgetUtilization = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("month", args.month)
      )
      .collect();

    const [year, monthNum] = args.month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1).getTime();
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end)
      )
      .collect();

    const spentByCategory: Record<string, number> = {};
    for (const e of expenses) {
      spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount;
    }

    return budgets.map((b) => ({
      ...b,
      spent: spentByCategory[b.category] ?? 0,
      percentage: Math.round(((spentByCategory[b.category] ?? 0) / b.monthlyLimit) * 100),
    }));
  },
});

export const getBudgetsForUser = internalQuery({
  args: { userId: v.id("users"), month: v.string() },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const [year, monthNum] = args.month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1).getTime();
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", start).lte("date", end)
      )
      .collect();
    const spentByCategory: Record<string, number> = {};
    for (const e of expenses) {
      spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount;
    }
    return budgets.map((b) => ({
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent: spentByCategory[b.category] ?? 0,
    }));
  },
});
