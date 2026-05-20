import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getChatHistory = query({
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
      .query("chat_messages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc")
      .take(50);
  },
});

export const saveMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    return ctx.db.insert("chat_messages", {
      userId: user._id,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const clearChatHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const messages = await ctx.db
      .query("chat_messages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
  },
});
