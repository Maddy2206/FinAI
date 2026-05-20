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
