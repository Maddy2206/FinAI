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
  Food: "#f4650c",
  Shopping: "#ffb02e",
  Utilities: "#1c1b2e",
  Travel: "#1e9e6a",
  Subscriptions: "#8d86c9",
  Rent: "#d92d20",
  Entertainment: "#d97706",
  Healthcare: "#6cc9a1",
  Other: "#a89f8a",
};

export const CATEGORY_TINTS: Record<ExpenseCategory, string> = {
  Food: "#fde3d3",
  Shopping: "#ffedc7",
  Utilities: "#e8e0d0",
  Travel: "#d9f2e5",
  Subscriptions: "#e3e0f2",
  Rent: "#fbdcd6",
  Entertainment: "#fff3d6",
  Healthcare: "#d9f2e5",
  Other: "#e8e0d0",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: "🍕",
  Travel: "🚗",
  Shopping: "🛒",
  Rent: "🏠",
  Utilities: "⚡",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Subscriptions: "📺",
  Other: "💰",
};

export type InsightType =
  | "weekly_summary"
  | "overspending_alert"
  | "savings_tip"
  | "anomaly";
