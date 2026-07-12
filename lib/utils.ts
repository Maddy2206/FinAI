import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy")
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  return format(new Date(Number(year), Number(month) - 1), "MMMM yyyy")
}

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM")
}

export function getMonthRange(monthStr: string): { start: number; end: number } {
  const [year, month] = monthStr.split("-").map(Number)
  const start = new Date(year, month - 1, 1).getTime()
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime()
  return { start, end }
}

export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score))
}

export function budgetUsageLevel(pct: number): "success" | "warning" | "danger" {
  if (pct >= 90) return "danger"
  if (pct >= 70) return "warning"
  return "success"
}

export function stripeGradient(level: "success" | "warning" | "danger"): string {
  if (level === "danger") {
    return "repeating-linear-gradient(45deg, #d92d20, #d92d20 7px, #f4650c 7px, #f4650c 14px)"
  }
  if (level === "warning") {
    return "repeating-linear-gradient(45deg, #d97706, #d97706 7px, #ffb02e 7px, #ffb02e 14px)"
  }
  return "repeating-linear-gradient(45deg, #1e9e6a, #1e9e6a 7px, #6cc9a1 7px, #6cc9a1 14px)"
}
