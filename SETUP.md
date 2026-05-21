# FinanceAI — Setup Guide

## Prerequisites

- Node.js 20+ (install via: `nvm install 20 && nvm use 20`)
- Accounts needed: Clerk, Convex, Anthropic, Google Cloud, UploadThing, Resend

---

## Step 1: Get Your API Keys

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com) → Create app → Enable Google OAuth
2. Copy: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Convex (Backend)
1. Go to [convex.dev](https://convex.dev) → Create project
2. Run: `npx convex dev` → Follow login prompt → Copy the `NEXT_PUBLIC_CONVEX_URL`

### Anthropic (AI)
1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys
2. Copy: `ANTHROPIC_API_KEY`

### OCR.space (Free OCR)
1. Go to [ocr.space](https://ocr.space/OCRAPI) → Register for a free API key
2. Free tier: **25,000 requests/month**, no credit card needed
3. Copy: `OCR_SPACE_API_KEY`
> **Testing without signup:** The demo key `helloworld` works immediately with low rate limits.

### UploadThing (File Uploads)
1. Go to [uploadthing.com](https://uploadthing.com) → Create app
2. Copy: `UPLOADTHING_TOKEN`

### Resend (Email)
1. Go to [resend.com](https://resend.com) → API Keys → Create
2. Copy: `RESEND_API_KEY`

---

## Step 2: Configure Environment Variables

Edit `.env.local` and fill in all values:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OCR.space (free)
OCR_SPACE_API_KEY=your_key_here   # or leave blank to use "helloworld" demo key

# UploadThing
UPLOADTHING_TOKEN=...

# Resend
RESEND_API_KEY=re_...
```

---

## Step 3: Initialize Convex

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
npx convex dev
```

- Follow the login prompt (opens browser)
- It will create a new Convex project and generate `convex/_generated/`
- Keep this terminal running while developing

---

## Step 4: Run the App

Open a second terminal:

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Step 5: Configure Clerk for Convex JWT

In the Clerk Dashboard:
1. Go to **JWT Templates** → Create template → Select **Convex**
2. Copy the issuer URL

In the Convex Dashboard:
1. Go to **Settings** → **Authentication**
2. Add Clerk as a provider with the issuer URL

---

## Project Structure

```
app/
  (auth)/         → Sign in/up pages
  (dashboard)/    → Protected dashboard pages
    dashboard/    → Main overview with charts
    expenses/     → Add/view/delete expenses
    budgets/      → Set and track budgets
    receipts/     → Upload receipts (AI OCR)
    analytics/    → Detailed charts
    assistant/    → AI chat interface
    reports/      → Weekly AI reports

convex/
  schema.ts       → Database tables
  expenses.ts     → Expense CRUD
  budgets.ts      → Budget management
  receipts.ts     → Receipt storage
  receiptActions.ts → OCR pipeline
  assistant.ts    → AI chat
  nlp.ts          → Natural language parsing
  reports.ts      → Weekly report generation
  insights.ts     → Health score + anomaly detection
  scheduler.ts    → Cron jobs

components/
  shared/         → Sidebar, Header, ThemeToggle
  dashboard/      → Charts and stat cards
  expenses/       → Expense form + NLP input
  receipts/       → Upload component
  assistant/      → Chat interface
```

---

## Key Features

| Feature | How it works |
|---------|-------------|
| Receipt scanning | UploadThing → OCR.space (free OCR) → Claude extracts data |
| NLP expense entry | "Spent ₹450 on pizza" → Claude parses → auto-fills form |
| AI Assistant | Claude gets your last 90 days of data as context |
| Weekly reports | Convex cron every Monday → Claude summary → Resend email |
| Anomaly detection | Transactions >3× category average flagged |
| Health score | Algorithm based on budget adherence + spending trends |

---

## Deployment (Vercel)

```bash
npx convex deploy  # Deploy backend to production
```

Then connect to Vercel, add all env vars from `.env.local`, and deploy.
