import { action, mutation, query } from "./_generated/server";
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

export const createReceiptRecord = mutation({
  args: {
    fileUrl: v.string(),
    uploadThingKey: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return ctx.db.insert("receipts", {
      userId: user._id,
      fileUrl: args.fileUrl,
      uploadThingKey: args.uploadThingKey,
      status: "processing",
      createdAt: Date.now(),
    });
  },
});

export const updateReceiptData = mutation({
  args: {
    id: v.id("receipts"),
    rawOcrText: v.string(),
    extractedData: v.object({
      merchant: v.string(),
      totalAmount: v.number(),
      date: v.string(),
      items: v.array(v.object({ name: v.string(), price: v.number() })),
      category: v.union(
        v.literal("Food"), v.literal("Travel"), v.literal("Shopping"),
        v.literal("Rent"), v.literal("Utilities"), v.literal("Entertainment"),
        v.literal("Healthcare"), v.literal("Subscriptions"), v.literal("Other")
      ),
    }),
    status: v.union(v.literal("done"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const getReceiptsByUser = query({
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
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});
