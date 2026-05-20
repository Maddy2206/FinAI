"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";

async function buildReport(ctx: any, user: any): Promise<string> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subDays(weekStart, 7);
  const lastWeekEnd = subDays(weekEnd, 7);

  const thisWeekExpenses = await ctx.runQuery(internal.expenses.getExpensesForUserInRange, {
    userId: user._id,
    startTime: weekStart.getTime(),
    endTime: weekEnd.getTime(),
  });
  const lastWeekExpenses = await ctx.runQuery(internal.expenses.getExpensesForUserInRange, {
    userId: user._id,
    startTime: lastWeekStart.getTime(),
    endTime: lastWeekEnd.getTime(),
  });

  const thisWeekTotal = thisWeekExpenses.reduce((s: number, e: any) => s + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((s: number, e: any) => s + e.amount, 0);

  const categoryTotals: Record<string, number> = {};
  for (const e of thisWeekExpenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  }
  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const biggestExpense = [...thisWeekExpenses].sort((a: any, b: any) => b.amount - a.amount)[0];
  const changePercent = lastWeekTotal > 0
    ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(1)
    : "0";

  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `Generate a concise weekly financial report for an Indian user.

Week: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}
Total spent this week: ₹${thisWeekTotal.toLocaleString("en-IN")}
Total spent last week: ₹${lastWeekTotal.toLocaleString("en-IN")} (${changePercent}% change)

Top 3 categories:
${topCategories.map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString("en-IN")}`).join("\n")}

Biggest expense: ${biggestExpense ? `₹${biggestExpense.amount.toLocaleString("en-IN")} on ${biggestExpense.description}` : "None"}

Write a friendly, insightful 3-paragraph report. Under 200 words. Use ₹ for currency.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });
  const reportContent = response.choices[0]?.message?.content ?? "Report unavailable.";

  await ctx.runMutation(internal.reports.saveReport, {
    userId: user._id,
    weekStart: format(weekStart, "yyyy-MM-dd"),
    weekEnd: format(weekEnd, "yyyy-MM-dd"),
    reportContent,
    totalSpent: thisWeekTotal,
    topCategory: topCategories[0]?.[0] ?? "N/A",
  });

  if (user.email) {
    await ctx.runAction(internal.reportsActions.sendReportEmail, {
      email: user.email,
      name: user.name,
      reportContent,
      weekStart: format(weekStart, "MMM d"),
      weekEnd: format(weekEnd, "MMM d, yyyy"),
      totalSpent: thisWeekTotal,
    });
  }

  return reportContent;
}

export const sendReportEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    reportContent: v.string(),
    weekStart: v.string(),
    weekEnd: v.string(),
    totalSpent: v.number(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
<!DOCTYPE html>
<html>
<head><style>
body { font-family: -apple-system, sans-serif; background: #0a0a0f; color: #e5e7eb; margin: 0; padding: 20px; }
.container { max-width: 600px; margin: 0 auto; background: #111118; border-radius: 12px; padding: 32px; }
h1 { color: #818cf8; font-size: 24px; margin: 0 0 8px; }
.subtitle { color: #6b7280; font-size: 14px; margin: 0 0 24px; }
.stat { background: #1a1a27; border-radius: 8px; padding: 16px; margin: 16px 0; }
.stat-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.stat-value { color: #818cf8; font-size: 28px; font-weight: 700; margin-top: 4px; }
.report { line-height: 1.7; color: #d1d5db; white-space: pre-wrap; }
.footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f2937; color: #4b5563; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <h1>Weekly Financial Report</h1>
  <p class="subtitle">${args.weekStart} – ${args.weekEnd}</p>
  <div class="stat">
    <div class="stat-label">Total Spent This Week</div>
    <div class="stat-value">₹${args.totalSpent.toLocaleString("en-IN")}</div>
  </div>
  <div class="report">${args.reportContent}</div>
  <div class="footer">FinanceAI — Your AI-powered finance companion</div>
</div>
</body>
</html>`;

    await resend.emails.send({
      from: "FinanceAI <reports@financeai.app>",
      to: args.email,
      subject: `Weekly Report: ${args.weekStart} – ${args.weekEnd} | ₹${args.totalSpent.toLocaleString("en-IN")} spent`,
      html,
    });
  },
});

export const generateWeeklyReport = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not found");
    return buildReport(ctx, user);
  },
});

export const sendReportsToAllUsers = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const users = await ctx.runQuery(internal.users.getAllUsers);
    for (const user of users) {
      try {
        await buildReport(ctx, user);
      } catch (e) {
        console.error(`Weekly report failed for user ${user._id}:`, e);
      }
    }
  },
});
