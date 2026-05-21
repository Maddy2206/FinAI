import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWeeklyReports = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    return ctx.db
      .query("weekly_reports")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const saveReport = internalMutation({
  args: {
    userId: v.id("users"),
    weekStart: v.string(),
    weekEnd: v.string(),
    reportContent: v.string(),
    totalSpent: v.number(),
    topCategory: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("weekly_reports", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deleteReport = mutation({
  args: { id: v.id("weekly_reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");
    const report = await ctx.db.get(args.id);
    if (!report || report.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
