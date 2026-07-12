"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const VALID_CATEGORIES = [
  "Food", "Travel", "Shopping", "Rent", "Utilities",
  "Entertainment", "Healthcare", "Subscriptions", "Other",
] as const;
type ValidCategory = (typeof VALID_CATEGORIES)[number];

function normalizeCategory(raw: unknown): ValidCategory {
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === String(raw).toLowerCase()
  );
  return match ?? "Other";
}

export const processReceiptOCR = action({
  args: {
    receiptId: v.id("receipts"),
    fileUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: OCR.space OCR (free tier: 25,000 req/month at ocr.space)
    if (!process.env.OCR_SPACE_API_KEY) {
      console.warn(
        "[processReceiptOCR] OCR_SPACE_API_KEY is not set in the Convex deployment env — falling back to the shared 'helloworld' demo key, which is heavily rate-limited and will fail unpredictably. Set it with `npx convex env set OCR_SPACE_API_KEY <key>`."
      );
    }
    let rawOcrText = "";
    try {
      // OCR.space has a single endpoint (/parse/image) for both file and
      // URL-based OCR — which mode it runs depends on whether `url`, `file`,
      // or `base64Image` is present in the body, not the URL path.
      const ocrRes = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          "apikey": process.env.OCR_SPACE_API_KEY ?? "helloworld",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "FinAI/1.0 (+https://finai.app)",
          "Accept": "application/json",
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

      const rawBody = await ocrRes.text();
      let ocrData: {
        IsErroredOnProcessing?: boolean;
        ParsedResults?: { ParsedText?: string }[];
      } | null = null;
      try {
        ocrData = JSON.parse(rawBody);
      } catch {
        // not JSON at all — fall through, logged below via bodyPreview
      }

      if (!ocrRes.ok || !ocrData || ocrData.IsErroredOnProcessing) {
        console.error(
          "[processReceiptOCR] OCR.space request failed",
          JSON.stringify({
            httpStatus: ocrRes.status,
            contentType: ocrRes.headers.get("content-type"),
            // Full raw body, not cherry-picked fields — OCR.space's error
            // shape varies (auth errors, quota errors, and processing
            // errors all look different), so log everything and read it.
            bodyPreview: rawBody.slice(0, 1000),
            fileUrl: args.fileUrl,
          })
        );
      }
      rawOcrText = ocrData?.ParsedResults?.[0]?.ParsedText ?? "";
    } catch (err) {
      console.error("[processReceiptOCR] OCR.space fetch threw:", err);
      rawOcrText = "";
    }

    if (!rawOcrText) {
      console.error(
        "[processReceiptOCR] No text extracted from receipt; marking failed.",
        { receiptId: args.receiptId, fileUrl: args.fileUrl }
      );
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
    if (!process.env.GROQ_API_KEY) {
      console.warn(
        "[processReceiptOCR] GROQ_API_KEY is not set in the Convex deployment env — Groq calls will fail. Set it with `npx convex env set GROQ_API_KEY <key>`."
      );
    }
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

    let extractedData: {
      merchant: string;
      totalAmount: number;
      date: string;
      items: { name: string; price: number }[];
      category: ValidCategory;
    } = {
      merchant: "Unknown",
      totalAmount: 0,
      date: new Date().toISOString().split("T")[0],
      items: [],
      category: "Other",
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
          items: Array.isArray(parsed.items) ? parsed.items : [],
          category: normalizeCategory(parsed.category),
        };
      }
    } catch (err) {
      console.error("[processReceiptOCR] Groq call/parse failed, using defaults:", err);
    }

    try {
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
    } catch (err) {
      console.error("[processReceiptOCR] Failed to save extracted data / create expense:", err);
      await ctx.runMutation(api.receipts.updateReceiptData, {
        id: args.receiptId,
        rawOcrText,
        extractedData,
        status: "failed",
      });
    }
  },
});
