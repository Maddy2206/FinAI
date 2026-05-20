"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const sendMessage = action({
  args: { userMessage: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.runMutation(api.assistant.saveMessage, {
      role: "user",
      content: args.userMessage,
    });

    const expenses = await ctx.runQuery(api.expenses.getAllExpensesLast90Days);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const budgetUtilization = await ctx.runQuery(api.budgets.getBudgetUtilization, { month: currentMonth });
    const monthlySummary = await ctx.runQuery(api.expenses.getExpenseSummaryByCategory, { month: currentMonth });
    const healthScore = await ctx.runQuery(api.insights.computeHealthScore, { month: currentMonth });

    const totalThisMonth = monthlySummary.reduce((s: number, c: any) => s + c.total, 0);
    const topCategory = [...monthlySummary].sort((a: any, b: any) => b.total - a.total)[0];

    const systemPrompt = `You are a personal AI financial advisor for an Indian user.
Currency is Indian Rupees (₹). Be specific, data-driven, and actionable.

Current month: ${currentMonth}
Financial Health Score: ${healthScore}/100
Total spent this month: ₹${totalThisMonth.toLocaleString("en-IN")}
Top spending category: ${topCategory?.category ?? "N/A"} (₹${topCategory?.total?.toLocaleString("en-IN") ?? 0})

Category breakdown this month:
${monthlySummary.map((c: any) => `- ${c.category}: ₹${c.total.toLocaleString("en-IN")}`).join("\n")}

Budget utilization:
${budgetUtilization.map((b: any) => `- ${b.category}: ₹${b.spent.toLocaleString("en-IN")} / ₹${b.monthlyLimit.toLocaleString("en-IN")} (${b.percentage}%)`).join("\n") || "No budgets set"}

Recent 90-day total: ₹${expenses.reduce((s: number, e: any) => s + e.amount, 0).toLocaleString("en-IN")}

Answer the user's question using their actual data. Be concise and helpful.`;

    const history = await ctx.runQuery(api.assistant.getChatHistory);
    const recentHistory = history.slice(-10);

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: args.userMessage },
      ],
    });

    const assistantMessage = response.choices[0]?.message?.content ?? "I couldn't process that request.";

    await ctx.runMutation(api.assistant.saveMessage, {
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  },
});
