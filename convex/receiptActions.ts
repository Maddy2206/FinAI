"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const processReceiptOCR = action({
  args: {
    receiptId: v.id("receipts"),
    fileUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: OCR.space OCR (free tier: 25,000 req/month at ocr.space)
    let rawOcrText = "";
    try {
      const ocrRes = await fetch("https://api.ocr.space/parse/imageurl", {
        method: "POST",
        headers: {
          "apikey": process.env.OCR_SPACE_API_KEY ?? "helloworld",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          url: args.fileUrl,
          language: "eng",
          isOverlayRequired: "false",
          detectOrientation: "true",
          scale: "true",
          OCREngine: "2",
        }).toString(),
      });
      const ocrData = await ocrRes.json();
      rawOcrText =
        ocrData?.ParsedResults?.[0]?.ParsedText ?? "";
    } catch {
      rawOcrText = "";
    }

    if (!rawOcrText) {
      await ctx.runMutation(api.receipts.updateReceiptData, {
        id: args.receiptId,
        rawOcrText: "",
        extractedData: {
          merchant: "Unknown",
          totalAmount: 0,
          date: new Date().toISOString().split("T")[0],
          items: [],
          category: "Other",
        },
        status: "failed",
      });
      return;
    }

    // Step 2: Groq structures the OCR text
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Extract structured data from this receipt OCR text. Return ONLY valid JSON, no explanation.

OCR Text:
${rawOcrText}

Return this exact JSON format:
{
  "merchant": "store name",
  "totalAmount": 0,
  "date": "YYYY-MM-DD",
  "items": [{"name": "item", "price": 0}],
  "category": "Food"
}

Category must be one of: Food, Travel, Shopping, Rent, Utilities, Entertainment, Healthcare, Subscriptions, Other
For totalAmount, extract the final total in numbers only (Indian Rupees).
If date is unclear, use today's date.`;

    let extractedData = {
      merchant: "Unknown",
      totalAmount: 0,
      date: new Date().toISOString().split("T")[0],
      items: [] as { name: string; price: number }[],
      category: "Other" as const,
    };

    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });
      const text = response.choices[0]?.message?.content ?? "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedData = {
          merchant: parsed.merchant ?? "Unknown",
          totalAmount: Number(parsed.totalAmount) || 0,
          date: parsed.date ?? new Date().toISOString().split("T")[0],
          items: parsed.items ?? [],
          category: parsed.category ?? "Other",
        };
      }
    } catch {
      // keep defaults
    }

    await ctx.runMutation(api.receipts.updateReceiptData, {
      id: args.receiptId,
      rawOcrText,
      extractedData,
      status: "done",
    });

    // Auto-create expense from receipt
    if (extractedData.totalAmount > 0) {
      await ctx.runMutation(api.expenses.addExpense, {
        amount: extractedData.totalAmount,
        category: extractedData.category,
        description: extractedData.merchant,
        date: new Date(extractedData.date).getTime(),
        isRecurring: false,
        receiptId: args.receiptId,
        source: "ocr",
      });
    }
  },
});
