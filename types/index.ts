export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Rent"
  | "Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Subscriptions"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Shopping",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Subscriptions",
  "Other",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#6366f1",
  Travel: "#22c55e",
  Shopping: "#f59e0b",
  Rent: "#ef4444",
  Utilities: "#06b6d4",
  Entertainment: "#a855f7",
  Healthcare: "#ec4899",
  Subscriptions: "#f97316",
  Other: "#64748b",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: "🍽️",
  Travel: "✈️",
  Shopping: "🛍️",
  Rent: "🏠",
  Utilities: "💡",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Subscriptions: "📱",
  Other: "💰",
};

export type InsightType =
  | "weekly_summary"
  | "overspending_alert"
  | "savings_tip"
  | "anomaly";
