"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const parseNaturalLanguageExpense = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const today = new Date().toISOString().split("T")[0];
    const prompt = `Parse this natural language expense entry into structured JSON. Return ONLY valid JSON.

Input: "${args.text}"
Today's date: ${today}

Return:
{
  "amount": 0,
  "category": "Food",
  "description": "brief description",
  "date": "YYYY-MM-DD"
}

Category must be: Food, Travel, Shopping, Rent, Utilities, Entertainment, Healthcare, Subscriptions, Other
Amount must be a number (in Indian Rupees).
Date should be today unless specified otherwise.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        amount: Number(parsed.amount) || 0,
        category: parsed.category ?? "Other",
        description: parsed.description ?? args.text,
        date: new Date(parsed.date ?? today).getTime(),
      };
    } catch {
      return null;
    }
  },
});
