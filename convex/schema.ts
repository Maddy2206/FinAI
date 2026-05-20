import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const expenseCategory = v.union(
  v.literal("Food"),
  v.literal("Travel"),
  v.literal("Shopping"),
  v.literal("Rent"),
  v.literal("Utilities"),
  v.literal("Entertainment"),
  v.literal("Healthcare"),
  v.literal("Subscriptions"),
  v.literal("Other")
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    currency: v.string(),
    financialHealthScore: v.number(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  expenses: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: expenseCategory,
    description: v.string(),
    date: v.number(),
    isRecurring: v.boolean(),
    receiptId: v.optional(v.id("receipts")),
    source: v.union(v.literal("manual"), v.literal("ocr"), v.literal("nlp")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  budgets: defineTable({
    userId: v.id("users"),
    category: expenseCategory,
    monthlyLimit: v.number(),
    month: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "month"]),

  receipts: defineTable({
    userId: v.id("users"),
    fileUrl: v.string(),
    uploadThingKey: v.string(),
    rawOcrText: v.optional(v.string()),
    extractedData: v.optional(
      v.object({
        merchant: v.string(),
        totalAmount: v.number(),
        date: v.string(),
        items: v.array(v.object({ name: v.string(), price: v.number() })),
        category: expenseCategory,
      })
    ),
    status: v.union(
      v.literal("processing"),
      v.literal("done"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  ai_insights: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("weekly_summary"),
      v.literal("overspending_alert"),
      v.literal("savings_tip"),
      v.literal("anomaly")
    ),
    content: v.string(),
    month: v.string(),
    dismissed: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "month"]),

  chat_messages: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  weekly_reports: defineTable({
    userId: v.id("users"),
    weekStart: v.string(),
    weekEnd: v.string(),
    reportContent: v.string(),
    totalSpent: v.number(),
    topCategory: v.string(),
    emailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
