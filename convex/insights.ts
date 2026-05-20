import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const getInsightsForMonth = query({
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
      .query("ai_insights")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("month", args.month)
      )
      .filter((q) => q.neq(q.field("dismissed"), true))
      .order("desc")
      .take(5);
  },
});

export const dismissInsight = mutation({
  args: { id: v.id("ai_insights") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const insight = await ctx.db.get(args.id);
    if (!insight || insight.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(args.id, { dismissed: true });
  },
});

export const saveInsight = mutation({
  args: {
    type: v.union(
      v.literal("weekly_summary"),
      v.literal("overspending_alert"),
      v.literal("savings_tip"),
      v.literal("anomaly")
    ),
    content: v.string(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return ctx.db.insert("ai_insights", {
      userId: user._id,
      type: args.type,
      content: args.content,
      month: args.month,
      dismissed: false,
      createdAt: Date.now(),
    });
  },
});

export const computeHealthScore = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 75;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return 75;

    const [year, monthNum] = args.month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1).getTime();
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end)
      )
      .collect();

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", user._id).eq("month", args.month)
      )
      .collect();

    let score = 100;

    // Deduct for overspent budgets
    if (budgets.length > 0) {
      const spentByCategory: Record<string, number> = {};
      for (const e of expenses) {
        spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount;
      }
      let overspentCount = 0;
      for (const b of budgets) {
        const spent = spentByCategory[b.category] ?? 0;
        if (spent > b.monthlyLimit) overspentCount++;
      }
      score -= Math.min(30, overspentCount * 10);
    }

    // Deduct for subscriptions > 3
    const subscriptions = expenses.filter((e) => e.category === "Subscriptions");
    if (subscriptions.length > 3) score -= Math.min(10, (subscriptions.length - 3) * 3);

    // Deduct if no budgets set
    if (budgets.length === 0) score -= 15;

    // Bonus for having budgets and staying within
    if (budgets.length >= 3) score += 5;

    return Math.min(100, Math.max(0, score));
  },
});

export const checkOverspending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [year, monthNum] = currentMonth.split("-").map(Number);
    const monthStart = new Date(year, monthNum - 1, 1).getTime();
    const nowTs = Date.now();

    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      const budgets = await ctx.db
        .query("budgets")
        .withIndex("by_user_month", (q) => q.eq("userId", user._id).eq("month", currentMonth))
        .collect();

      if (budgets.length === 0) continue;

      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", user._id).gte("date", monthStart).lte("date", nowTs)
        )
        .collect();

      const spentByCategory: Record<string, number> = {};
      for (const e of expenses) {
        spentByCategory[e.category] = (spentByCategory[e.category] ?? 0) + e.amount;
      }

      for (const budget of budgets) {
        const spent = spentByCategory[budget.category] ?? 0;
        const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
        if (percentage < 80) continue;

        const alertContent = JSON.stringify({ category: budget.category });
        const existing = await ctx.db
          .query("ai_insights")
          .withIndex("by_user_month", (q) => q.eq("userId", user._id).eq("month", currentMonth))
          .filter((q) =>
            q.and(
              q.eq(q.field("type"), "overspending_alert"),
              q.eq(q.field("content"), alertContent)
            )
          )
          .first();

        if (!existing) {
          await ctx.db.insert("ai_insights", {
            userId: user._id,
            type: "overspending_alert",
            content: JSON.stringify({
              category: budget.category,
              spent: Math.round(spent),
              limit: budget.monthlyLimit,
              percentage: Math.round(percentage),
            }),
            month: currentMonth,
            dismissed: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});
