"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";

// ─── Colour palette used throughout the PDF ───────────────────────────────────
const C = {
  bg:        "#0f0f22",
  panel:     "#1a1a30",
  accent:    "#7c6ef5",
  accentLight: "#a89cf7",
  white:     "#ffffff",
  offWhite:  "#e8e8f0",
  muted:     "#8888aa",
  green:     "#34d399",
  red:       "#f87171",
  border:    "#2a2a45",
};

function inr(n: number) {
  return "Rs." + n.toLocaleString("en-IN");
}

// ─── PDF builder (pdf-lib — no disk fonts needed) ────────────────────────────
async function generatePDF(data: {
  weekStart: string; weekEnd: string;
  thisWeekTotal: number; lastWeekTotal: number; changePercent: string;
  categoryTotals: Record<string, number>;
  topExpenses: { description: string; category: string; amount: number; date: string }[];
  budgets: { category: string; monthlyLimit: number; spent: number }[];
  reportContent: string;
  userName: string;
}): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PDFDocument, StandardFonts, rgb } = require("pdf-lib") as typeof import("pdf-lib");

  // Strip any character that WinAnsi can't encode (control chars, emoji, etc.)
  function sanitize(s: string) {
    return s.replace(/[^\x20-\x7E\xA0-\xFF]/g, " ").replace(/\s+/g, " ").trim();
  }

  function hex(h: string) {
    const n = h.replace("#", "");
    return rgb(
      parseInt(n.slice(0, 2), 16) / 255,
      parseInt(n.slice(2, 4), 16) / 255,
      parseInt(n.slice(4, 6), 16) / 255,
    );
  }

  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const W = 595, H = 842, M = 40;

  // pdf-lib: y=0 is bottom-left. Helper: top-down y
  function addPage() {
    const p = pdfDoc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(C.bg) });
    return p;
  }

  let page = addPage();
  // cursor tracking from top
  let cy = H; // current y from top; translate to pdf-lib: H - cy

  function ty(y: number) { return H - y; } // top-origin y → pdf-lib y

  // ── Header band ────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: ty(110), width: W, height: 110, color: hex(C.bg) });
  page.drawRectangle({ x: 0, y: ty(114), width: W, height: 4,   color: hex(C.accent) });

  // Logo circle
  page.drawCircle({ x: M + 18, y: ty(46), size: 18, color: hex(C.accent) });
  page.drawText("Fi", { x: M + 11, y: ty(42), font: bold, size: 11, color: hex(C.white) });

  page.drawText("FinAI",                  { x: M + 46, y: ty(38),  font: bold,    size: 22, color: hex(C.white) });
  page.drawText("Weekly Financial Report",{ x: M + 46, y: ty(56),  font: regular, size: 9,  color: hex(C.muted) });

  const dateStr = `${data.weekStart}  -  ${data.weekEnd}`;
  page.drawText(dateStr, { x: W - M - regular.widthOfTextAtSize(dateStr, 9), y: ty(40), font: bold, size: 9, color: hex(C.accentLight) });
  const forStr = sanitize(`Prepared for ${data.userName || "you"}`);
  page.drawText(forStr,  { x: W - M - regular.widthOfTextAtSize(forStr, 8), y: ty(56), font: regular, size: 8, color: hex(C.muted) });

  cy = 130;

  // ── Metric cards ───────────────────────────────────────────────────────────
  const cardH = 70, cardW = Math.floor((W - M * 2 - 16) / 3);
  const changeVal = parseFloat(data.changePercent);
  const cards = [
    { label: "TOTAL SPENT", value: inr(data.thisWeekTotal), sub: "This week",     color: C.accent },
    { label: "LAST WEEK",   value: inr(data.lastWeekTotal), sub: "Previous week", color: C.muted  },
    { label: "CHANGE",      value: (changeVal >= 0 ? "+" : "") + data.changePercent + "%",
      sub: changeVal < 0 ? "Improvement" : "Increase", color: changeVal < 0 ? C.green : C.red },
  ];

  cards.forEach((card, i) => {
    const cx = M + i * (cardW + 8);
    page.drawRectangle({ x: cx, y: ty(cy + cardH), width: cardW, height: cardH, color: hex(C.panel) });
    page.drawRectangle({ x: cx, y: ty(cy + cardH), width: 3,     height: cardH, color: hex(card.color) });
    page.drawText(card.label, { x: cx + 12, y: ty(cy + 16), font: regular, size: 7,  color: hex(C.muted) });
    page.drawText(card.value, { x: cx + 12, y: ty(cy + 34), font: bold,    size: 14, color: hex(card.color) });
    page.drawText(card.sub,   { x: cx + 12, y: ty(cy + 55), font: regular, size: 8,  color: hex(C.muted) });
  });
  cy += cardH + 20;

  // ── Category breakdown ─────────────────────────────────────────────────────
  const catEntries = Object.entries(data.categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (catEntries.length) {
    page.drawRectangle({ x: M, y: ty(cy + 14), width: 3, height: 14, color: hex(C.accent) });
    page.drawText("Spending by Category", { x: M + 10, y: ty(cy + 12), font: bold, size: 11, color: hex(C.white) });
    cy += 22;

    const maxAmt  = catEntries[0][1];
    const barMaxW = W - M * 2 - 120;
    for (const [cat, amt] of catEntries) {
      const bw = Math.max(4, barMaxW * (amt / maxAmt));
      page.drawText(cat.slice(0, 14), { x: M, y: ty(cy + 11), font: regular, size: 8, color: hex(C.muted) });
      page.drawRectangle({ x: M + 104, y: ty(cy + 14), width: barMaxW, height: 14, color: hex(C.panel) });
      page.drawRectangle({ x: M + 104, y: ty(cy + 14), width: bw,       height: 14, color: hex(C.accent) });
      const amtStr = inr(amt);
      page.drawText(amtStr, { x: M + 104 + barMaxW + 6, y: ty(cy + 11), font: bold, size: 8, color: hex(C.offWhite) });
      cy += 20;
    }
    cy += 8;
  }

  // ── Top expenses ───────────────────────────────────────────────────────────
  if (data.topExpenses.length) {
    if (cy > H - 160) { page = addPage(); cy = M; }

    page.drawRectangle({ x: M, y: ty(cy + 14), width: 3, height: 14, color: hex(C.accentLight) });
    page.drawText("Top Expenses", { x: M + 10, y: ty(cy + 12), font: bold, size: 11, color: hex(C.white) });
    cy += 20;

    // header row
    page.drawRectangle({ x: M, y: ty(cy + 18), width: W - M * 2, height: 18, color: hex(C.panel) });
    page.drawText("DESCRIPTION", { x: M + 8,   y: ty(cy + 12), font: bold, size: 7, color: hex(C.muted) });
    page.drawText("CATEGORY",    { x: M + 215,  y: ty(cy + 12), font: bold, size: 7, color: hex(C.muted) });
    page.drawText("DATE",        { x: M + 350,  y: ty(cy + 12), font: bold, size: 7, color: hex(C.muted) });
    page.drawText("AMOUNT",      { x: M + 430,  y: ty(cy + 12), font: bold, size: 7, color: hex(C.muted) });
    cy += 18;

    for (let i = 0; i < Math.min(data.topExpenses.length, 7); i++) {
      const exp = data.topExpenses[i];
      if (i % 2 === 0) page.drawRectangle({ x: M, y: ty(cy + 17), width: W - M * 2, height: 17, color: hex("#14142a") });
      page.drawText(sanitize(exp.description).slice(0, 30), { x: M + 8,  y: ty(cy + 11), font: regular, size: 8, color: hex(C.offWhite) });
      page.drawText(exp.category,                  { x: M + 215, y: ty(cy + 11), font: regular, size: 8, color: hex(C.muted) });
      page.drawText(String(exp.date).slice(0, 10), { x: M + 350, y: ty(cy + 11), font: regular, size: 8, color: hex(C.muted) });
      const amtS = "-" + inr(exp.amount);
      page.drawText(amtS, { x: M + 430, y: ty(cy + 11), font: bold, size: 8, color: hex(C.red) });
      cy += 17;
    }
    cy += 12;
  }

  // ── Budget utilisation ─────────────────────────────────────────────────────
  const budgetsWithData = data.budgets.filter(b => b.monthlyLimit > 0);
  if (budgetsWithData.length) {
    if (cy > H - 160) { page = addPage(); cy = M; }
    page.drawRectangle({ x: M, y: ty(cy + 14), width: 3, height: 14, color: hex(C.green) });
    page.drawText("Budget Utilisation (This Month)", { x: M + 10, y: ty(cy + 12), font: bold, size: 11, color: hex(C.white) });
    cy += 22;

    const bW = Math.floor((W - M * 2 - 20) / 2);
    for (let i = 0; i < budgetsWithData.length; i++) {
      const b   = budgetsWithData[i];
      const col = i % 2 === 0 ? M : M + bW + 20;
      if (i > 0 && i % 2 === 0) cy += 44;
      const pct      = Math.min(b.spent / b.monthlyLimit, 1);
      const over     = b.spent > b.monthlyLimit;
      const barColor = over ? C.red : pct > 0.8 ? "#f59e0b" : C.green;

      page.drawRectangle({ x: col, y: ty(cy + 36), width: bW, height: 36, color: hex(C.panel) });
      page.drawText(b.category, { x: col + 8, y: ty(cy + 12), font: regular, size: 7, color: hex(C.muted) });
      page.drawText(`${inr(b.spent)} / ${inr(b.monthlyLimit)}`, {
        x: col + 8, y: ty(cy + 22), font: bold, size: 8, color: hex(over ? C.red : C.offWhite),
      });
      page.drawRectangle({ x: col + 8, y: ty(cy + 33), width: bW - 16, height: 5, color: hex(C.border) });
      page.drawRectangle({ x: col + 8, y: ty(cy + 33), width: Math.max(4, (bW - 16) * pct), height: 5, color: hex(barColor) });
    }
    cy += 44 + 12;
  }

  // ── AI Insights ────────────────────────────────────────────────────────────
  if (cy > H - 140) { page = addPage(); cy = M; }

  page.drawRectangle({ x: M, y: ty(cy + 14), width: 3, height: 14, color: hex(C.accentLight) });
  page.drawText("AI Insights", { x: M + 10, y: ty(cy + 12), font: bold, size: 11, color: hex(C.white) });
  cy += 20;

  const paragraphs = data.reportContent.split(/\r?\n/).map(sanitize).filter(Boolean);
  const flatText   = paragraphs.join("  ");
  const maxLineW   = W - M * 2 - 28;
  const lines: string[] = [];
  let line = "";
  for (const word of flatText.split(" ")) {
    if (!word) continue;
    const test = line ? line + " " + word : word;
    if (regular.widthOfTextAtSize(test, 8.5) > maxLineW) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);

  const insightBoxH = Math.min(180, lines.length * 13 + 24);
  page.drawRectangle({ x: M, y: ty(cy + insightBoxH), width: W - M * 2, height: insightBoxH, color: hex(C.panel) });
  page.drawRectangle({ x: M, y: ty(cy + insightBoxH), width: 3, height: insightBoxH, color: hex(C.accent) });
  lines.slice(0, 12).forEach((l, i) => {
    page.drawText(l, { x: M + 12, y: ty(cy + 14 + i * 13), font: regular, size: 8.5, color: hex(C.offWhite) });
  });
  cy += insightBoxH + 12;

  // ── Footer ─────────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: hex(C.bg) });
  page.drawRectangle({ x: 0, y: 30, width: W, height: 1,  color: hex(C.border) });
  page.drawText("FinAI - Smart Money Management  |  Generated automatically",
    { x: M, y: 12, font: regular, size: 7.5, color: hex(C.muted) });
  page.drawText(`${data.weekStart} - ${data.weekEnd}`,
    { x: W - M - 120, y: 12, font: regular, size: 7.5, color: hex(C.muted) });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

// ─── Core report builder ──────────────────────────────────────────────────────
async function buildReport(ctx: any, user: any): Promise<string> {
  const now = new Date();
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd    = endOfWeek(now,   { weekStartsOn: 1 });
  const lastWeekStart = subDays(weekStart, 7);
  const lastWeekEnd   = subDays(weekEnd,   7);

  const [thisWeekExpenses, lastWeekExpenses, budgets] = await Promise.all([
    ctx.runQuery(internal.expenses.getExpensesForUserInRange, {
      userId: user._id, startTime: weekStart.getTime(), endTime: weekEnd.getTime(),
    }),
    ctx.runQuery(internal.expenses.getExpensesForUserInRange, {
      userId: user._id, startTime: lastWeekStart.getTime(), endTime: lastWeekEnd.getTime(),
    }),
    ctx.runQuery(internal.budgets.getBudgetsForUser, {
      userId: user._id,
      month: format(now, "yyyy-MM"),
    }),
  ]);

  const thisWeekTotal = thisWeekExpenses.reduce((s: number, e: any) => s + e.amount, 0);
  const lastWeekTotal = lastWeekExpenses.reduce((s: number, e: any) => s + e.amount, 0);

  const categoryTotals: Record<string, number> = {};
  for (const e of thisWeekExpenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  }

  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topExpenses   = [...thisWeekExpenses]
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 7)
    .map((e: any) => ({
      description: e.description,
      category:    e.category,
      amount:      e.amount,
      date:        e.date,
    }));
  const biggestExpense = topExpenses[0];

  const changePercent = lastWeekTotal > 0
    ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(1)
    : "0";

  // ── AI narrative ──
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `Generate a concise weekly financial report for an Indian user.

Week: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}
Total spent this week: Rs.${thisWeekTotal.toLocaleString("en-IN")}
Total spent last week: Rs.${lastWeekTotal.toLocaleString("en-IN")} (${changePercent}% change)

Top 3 categories:
${topCategories.map(([cat, amt]) => `- ${cat}: Rs.${amt.toLocaleString("en-IN")}`).join("\n")}

Biggest expense: ${biggestExpense ? `Rs.${biggestExpense.amount.toLocaleString("en-IN")} on ${biggestExpense.description}` : "None"}

Write a friendly, insightful 3-paragraph report. Under 200 words. Use Rs. for currency.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });
  const reportContent = response.choices[0]?.message?.content ?? "Report unavailable.";

  // ── Save to DB ──
  await ctx.runMutation(internal.reports.saveReport, {
    userId:        user._id,
    weekStart:     format(weekStart, "yyyy-MM-dd"),
    weekEnd:       format(weekEnd,   "yyyy-MM-dd"),
    reportContent,
    totalSpent:    thisWeekTotal,
    topCategory:   topCategories[0]?.[0] ?? "N/A",
  });

  // ── Email with PDF attachment ──
  if (user.email) {
    await ctx.runAction(internal.reportsActions.sendReportEmail, {
      email:         user.email,
      name:          user.name ?? "",
      reportContent,
      weekStart:     format(weekStart, "MMM d"),
      weekEnd:       format(weekEnd,   "MMM d, yyyy"),
      totalSpent:    thisWeekTotal,
      lastWeekTotal,
      changePercent,
      categoryTotals,
      topExpenses,
      budgets,
    });
  }

  return reportContent;
}

// ─── Email action ─────────────────────────────────────────────────────────────
export const sendReportEmail = internalAction({
  args: {
    email:         v.string(),
    name:          v.string(),
    reportContent: v.string(),
    weekStart:     v.string(),
    weekEnd:       v.string(),
    totalSpent:    v.number(),
    lastWeekTotal: v.number(),
    changePercent: v.string(),
    categoryTotals: v.any(),
    topExpenses:   v.any(),
    budgets:       v.any(),
  },
  handler: async (_ctx, args): Promise<void> => {
    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured — skipping email for", args.email);
      return;
    }

    const pdfBuffer = await generatePDF({
      weekStart:      args.weekStart,
      weekEnd:        args.weekEnd,
      thisWeekTotal:  args.totalSpent,
      lastWeekTotal:  args.lastWeekTotal,
      changePercent:  args.changePercent,
      categoryTotals: args.categoryTotals,
      topExpenses:    args.topExpenses,
      budgets:        args.budgets,
      reportContent:  args.reportContent,
      userName:       args.name,
    });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
<!DOCTYPE html>
<html>
<head><style>
body { font-family: -apple-system, sans-serif; background: #0a0a0f; color: #e5e7eb; margin: 0; padding: 20px; }
.container { max-width: 600px; margin: 0 auto; background: #111118; border-radius: 12px; padding: 32px; }
h1 { color: #818cf8; font-size: 22px; margin: 0 0 6px; }
.subtitle { color: #6b7280; font-size: 13px; margin: 0 0 20px; }
.stat { background: #1a1a27; border-radius: 8px; padding: 16px; margin: 12px 0; }
.stat-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
.stat-value { color: #818cf8; font-size: 26px; font-weight: 700; margin-top: 4px; }
.report { line-height: 1.7; color: #d1d5db; white-space: pre-wrap; font-size: 14px; }
.pdf-note { background: #1a2a1a; border: 1px solid #2a4a2a; border-radius: 8px; padding: 12px 16px; margin: 20px 0; color: #86efac; font-size: 13px; }
.footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f2937; color: #4b5563; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <h1>Weekly Financial Report</h1>
  <p class="subtitle">${args.weekStart} – ${args.weekEnd}</p>
  <div class="stat">
    <div class="stat-label">Total Spent This Week</div>
    <div class="stat-value">Rs.${args.totalSpent.toLocaleString("en-IN")}</div>
  </div>
  <div class="pdf-note">📎 Your detailed analytics report (PDF) is attached to this email.</div>
  <div class="report">${args.reportContent}</div>
  <div class="footer">FinAI — Your smart finance companion</div>
</div>
</body>
</html>`;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from:    "FinAI Reports <onboarding@resend.dev>",
      to:      args.email,
      subject: `Weekly Report: ${args.weekStart} - ${args.weekEnd} | Rs.${args.totalSpent.toLocaleString("en-IN")} spent`,
      html,
      attachments: [{
        filename: `FinAI-Report-${args.weekStart.replace(/ /g, "-")}-${args.weekEnd.replace(/ /g, "-")}.pdf`,
        content:  pdfBuffer.toString("base64"),
      }],
    });

    if (sendError) {
      console.error("Resend error:", JSON.stringify(sendError));
      throw new Error(`Email failed: ${sendError.message}`);
    }
    console.log("Email sent successfully, id:", sendData?.id);
  },
});

// ─── Public actions ───────────────────────────────────────────────────────────
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
