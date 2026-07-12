# Handoff: FinAI — Landing, Auth & App

## Overview
FinAI is an AI-powered personal finance app for the Indian market (₹ / INR). This package covers three product surfaces:
1. **Landing page** — marketing site that sells the product and drives sign-ups.
2. **Auth** — combined sign in / sign up screen.
3. **App** — the signed-in product: a 7-screen dashboard (Dashboard, Expenses, Budgets, Receipts, Analytics, AI Assistant, Reports).

Together they form one continuous flow: Landing → Auth → App.

## About the Design Files
The three `.dc.html` files in this bundle are **design references created in HTML** — prototypes showing the intended look, layout, and behavior. They are **not** production code to copy directly. They rely on a small proprietary runtime (`support.js`, the `<x-dc>` wrapper, `{{ }}` template holes, `<sc-if>` conditionals) that you should **ignore** — it is only a preview harness.

Your task is to **recreate these designs in the target codebase's environment** (React, Next.js, Vue, etc.) using its established patterns, component library, and conventions. If no frontend exists yet, choose the most appropriate modern framework (React + Vite or Next.js recommended) and implement there. Reproduce the *markup structure, inline styles, copy, and interactions* — not the `.dc.html` mechanics.

### How to read the files
- Everything between `<x-dc>` and `</x-dc>` is the markup. All styling is **inline `style="..."`** — read those literally.
- `style-hover="..."`, `style-focus="..."`, `style-active="..."` are pseudo-state styles → implement as `:hover` / `:focus` / `:active`.
- `<sc-if value="{{ isDashboard }}">…</sc-if>` = conditional render. The logic class at the bottom (`class Component extends DCLogic`) shows the state model and which flag controls what.
- `{{ handler }}` on `onClick` = an event handler defined in the logic class.
- `data-screen-label` / `data-label` attributes are just labels for the preview; drop them.

## Fidelity
**High-fidelity (hifi).** These are pixel-accurate mockups with final colors, typography, spacing, radii, shadows, and interactions. Recreate the UI faithfully, mapping the inline styles onto the codebase's styling system (CSS modules, Tailwind, styled-components, etc.).

---

## Design Tokens

### Color palette (neo-brutalist, warm)
| Token | Hex | Usage |
|---|---|---|
| Cream (bg) | `#faf4e8` | Page background, light surfaces |
| Ink (fg / borders) | `#1c1b2e` | Text, the 2px borders on every element, dark panels |
| Orange (primary) | `#f4650c` | Primary buttons, accents, active nav, links |
| Marigold (secondary) | `#ffb02e` | Badges, highlight underline, secondary accents |
| White | `#ffffff` | Cards |
| Green (success) | `#1e9e6a` | Positive numbers, "on track" states. Tints: `#d9f2e5`, `#6cc9a1` |
| Red (danger) | `#d92d20` | Over-budget warnings |
| Amber (warning) | `#d97706` | Near-limit warnings. Tint: `#fff3d6` |
| Purple | `#8d86c9` | Subscriptions category. Tint: `#e3e0f2` |
| Category tints | `#fde3d3` (food), `#ffedc7` (shopping), `#e8e0d0` (utilities) | Icon chip backgrounds |

Muted text is the ink color at reduced alpha: `rgba(28,27,46,0.55)`, `rgba(28,27,46,0.6)`, `rgba(28,27,46,0.65)`. On dark panels, muted is `rgba(250,244,232,0.6)`.

Link color: `#f4650c`; link hover: `#1c1b2e`.

### Typography
- **Display / headings:** `'Bricolage Grotesque'`, weights 500/600/700/800. Used for logo, H1/H2/H3, big numbers. Tight tracking: `letter-spacing: -0.02em` to `-0.03em` on large sizes.
- **Body / UI:** `'Public Sans'`, weights 400/500/600/700.
- Both loaded from Google Fonts.
- Hero H1: `clamp(48px, 5.8vw, 82px)`, weight 800, `line-height: 0.98`.
- Section H2: `clamp(36px, 4vw, 56px)`, weight 800.
- Card titles: 16px weight 700 (Bricolage). Body copy: 14–19px. Labels: 11–13px, often `text-transform: uppercase; letter-spacing: 0.08em`.

### Signature neo-brutalist style rules
- **Every** card, button, chip, input, and icon tile has a **2px solid `#1c1b2e` border**.
- **Hard offset shadows** (no blur): `box-shadow: 4px 4px 0 #1c1b2e` (cards), `3px 3px 0` (buttons/chips), `5px–8px` for emphasis. Accent shadows use `#ffb02e` or `#f4650c` instead of ink.
- **Border radius:** cards `18–22px`, buttons/chips/pills `999px`, icon tiles `10–14px`, inputs `12–14px`.
- **Hover lift:** `transform: translate(-2px, -2px)` paired with a larger offset shadow, `transition: transform 0.15s ease, box-shadow 0.15s ease`.
- **Highlight underline** on hero words: `background: linear-gradient(transparent 55%, #ffb02e 55%, #ffb02e 92%, transparent 92%)`.
- **Progress bars / meters** use diagonal candy stripes: `repeating-linear-gradient(45deg, <color>, <color> 7px, <tint> 7px, <tint> 14px)`.
- Decorative cards are rotated slightly (`transform: rotate(-1deg)` / `rotate(1deg)`).

### Keyframe animations
- `fadeUp` — `opacity 0 + translateY(24px)` → in place, `0.6s ease-out`, staggered delays (0.05s–0.45s) for hero elements.
- `marquee` — `translateX(0)` → `translateX(-50%)`, `22s linear infinite` (landing ticker).
- `bob` / `floatA` / `floatB` — gentle vertical float on decorative cards, 6–9s ease-in-out infinite.

Icons throughout are **Lucide** (stroke-based SVGs, `stroke-width: 2`–`2.5`, round caps/joins).

---

## Screens / Views

### 1. Landing (`FinAI Landing.dc.html`)
**Purpose:** Market the product, drive sign-ups. Single scrolling page.

Sections, top to bottom:
- **Sticky navbar** (72px): logo (orange rounded-square icon tile + "Fin**AI**" wordmark), center nav links (Features, How it works), right side "Sign in" ghost link + "Get started ↗" dark pill button with orange offset shadow.
- **Hero** (2-col grid `1.15fr / 1fr`, gap 56px): Left = marigold badge "✦ Smart finance, simplified", H1 "Your money, **finally clear.**" (last two words with marigold highlight underline), subcopy, two CTAs ("Start for free →" orange, "Sign in" cream outline), trust row ("✓ No credit card · ✓ Free forever plan · ✓ 2-min setup"). Right = stacked mockup cards: a "Spent this month ₹24,850 of ₹35,000" card with striped 71% progress bar (bobbing animation), plus two smaller rotated cards ("Saved ₹10,150 +29%" dark, "You typed → Food logged ✓" white).
- **Ticker** (optional, `showTicker` prop, default on): orange full-bleed marquee strip, cream Bricolage text scrolling left: "TRACK EVERY RUPEE ✦ SCAN ANY RECEIPT ✦ ASK AI ANYTHING ✦ …".
- **Stats** (3-col): "50K+ Active users", "₹500Cr+ Spending tracked" (marigold card), "4.9 ★ App rating". Cards rotated ±1°.
- **Features** (`#features`, 3×2 grid): 6 cards, each with a colored icon tile + title + one-line description. Features: AI Receipt Scanning, AI Financial Assistant, Smart Analytics, Natural Language Entry, Budget Alerts, Weekly AI Reports. Hover = lift + ink shadow.
- **How it works** (`#how-it-works`, dark `#1c1b2e` section): centered header, 3 numbered step cards (staggered downward via `translateY`): Create your account → Log your expenses → Get AI insights.
- **CTA:** big marigold card with ink offset shadow, "Start saving smarter **today**", dark pill button, decorative rotated ₹ glyphs.
- **Footer:** logo, copyright, Sign in / Sign up links.

**Prop:** `showTicker` (boolean, default true).

### 2. Auth (`FinAI Auth.dc.html`)
**Purpose:** Sign in and sign up, toggled in one screen. Split layout, 50/50.

- **Left panel** (`#1c1b2e` dark, cream text): logo, dotted-grid background texture, a headline that changes by mode — sign-in: "Welcome **back.**"; sign-up: "Money, **sorted.**" (highlight underline in orange), supporting copy, and a 4-item feature list with small icon tiles (receipt scanning, personalized insights, budget alerts, weekly reports). Three **floating animated cards** absolutely positioned (Saved ₹10,150 / Health score 87 / a BigBasket transaction), using `floatA`/`floatB` keyframes. Footer copyright.
- **Right panel** (cream, centered form, max-width 400px): mode-dependent heading + subcopy, "Continue with Google" button (white, multicolor Google glyph), "or" divider, form fields. Sign-up adds a **Full name** field above Email. Fields: Email, Password (sign-in shows "Forgot password?" link). Primary submit button (orange pill, ink offset shadow) — "Sign in →" or "Create account →". Footer line toggles mode ("Don't have an account? Sign up free" / "Already have an account? Sign in").
- Inputs: white, 2px ink border, radius 14px, focus adds `box-shadow: 3px 3px 0 #ffb02e`.

**Prop / state:** `mode` enum `"signin" | "signup"` (default `signin`). The in-screen toggle links set local state; the prop seeds the initial value.

### 3. App (`FinAI App.dc.html`)
**Purpose:** The signed-in product. Fixed sidebar + main content area. Client-side "routing" via a single `page` state string; the sidebar nav switches it, and each screen is a `<sc-if>` block.

- **Sidebar** (244px, dark `#1c1b2e`): logo header, nav items (Dashboard, Expenses, Budgets, Receipts, Analytics, AI Assistant, Reports) each with a Lucide icon; active item = orange background + cream text, inactive = translucent cream text with hover tint. User footer (avatar "PS", "Priya Sharma", "Free plan").
- **Header bar** (66px): current page title (Bricolage 800, 22px) + a "May 2026" pill on the right.
- **Screens:**
  - **Dashboard** — 4 stat cards (Total spent ₹24,850, Budget left ₹10,150, Top category Food, vs last month +12.4%); a 2fr/1fr row with a 12-bar monthly-trend chart + a conic-gradient financial-health donut (87/100, "Excellent ✓"); a 1fr/1fr row with a category donut (conic-gradient + legend) and budget-progress striped bars; a recent-transactions list.
  - **Expenses** — month pill + "＋ Add expense" button; a dark "✦ AI quick entry" card with a natural-language input + "Parse ✦" button; summary line; a list of 7 transaction rows (icon chip, name, category pill, date, amount, delete icon). Some rows carry a "Recurring" pill.
  - **Budgets** — month pill + "＋ Set budget"; a dark "Overall budget" card (₹24,850 / ₹35,000, striped 71% bar); a 3-col grid of 6 category budget cards, each with a % chip (green/amber/red by usage), striped bar, and spent/left copy. The over-budget card (Utilities 97%) uses a red border + red offset shadow.
  - **Receipts** — a large dashed-border drop zone ("Drop your receipt here", "Choose file" button); a "Recent receipts" list with statuses (✓ Scanned, ⏳ Processing…).
  - **Analytics** — category breakdown bars; a day-of-week bar chart; a 12-month line chart (inline SVG polyline with marigold dots); a subscription tracker list.
  - **AI Assistant** — a chat transcript (AI bubbles left with bot-icon avatar + ink border, user bubbles right in orange), suggested-question chips, and a bottom composer (rounded input + circular send button).
  - **Reports** — header + "✦ Generate now" button; expandable weekly-report cards (the latest expanded showing an AI summary in a tinted panel; older ones collapsed with "View ▼").

**State:** `page` (string, default `"dashboard"`). Nav click sets `page`; title, active nav styling, and screen visibility all derive from it. "View all →" on the dashboard transactions jumps to Expenses.

---

## Interactions & Behavior
- **Landing:** anchor-scroll nav (`#features`, `#how-it-works`); all buttons are hover-lift; hero elements fade-up on load (staggered); ticker marquee loops; decorative cards bob/float continuously.
- **Auth:** mode toggle swaps headings, copy, the Full-name field, submit label, and footer link — all client-side, no reload. Inputs show marigold offset-shadow on focus. Left-panel cards float on independent loops.
- **App:** sidebar nav switches the active screen (single-page state, no route change). Active nav item highlights orange. Cards and list rows lift on hover. Delete icons on expense rows are affordances (wire to real delete). AI quick-entry and assistant composer are inputs intended to POST to an AI parse/chat endpoint.

## State Management
- **Landing:** `showTicker` boolean toggle (feature flag).
- **Auth:** `mode: "signin" | "signup"`.
- **App:** `page: "dashboard" | "expenses" | "budgets" | "receipts" | "analytics" | "assistant" | "reports"`.

All data shown is **static mock data** for the design (May 2026, user "Priya Sharma", ₹ amounts). Replace with real fetched data:
- Dashboard: monthly totals, budget, category breakdown, health score, recent transactions.
- Expenses: transaction list (merchant, category, date, amount, recurring flag), NL-parse endpoint.
- Budgets: per-category budget vs spent.
- Receipts: upload → OCR/extract endpoint, receipt list with processing status.
- Analytics: time-series + category aggregates + subscriptions.
- Assistant: chat endpoint (streaming recommended).
- Reports: generated weekly summaries.

## Assets
- **Fonts:** Bricolage Grotesque + Public Sans (Google Fonts) on Landing/Auth/App. (The Landing v1 variant, not in this bundle, used Syne + DM Sans — ignore.)
- **Icons:** Lucide icon set, inlined as SVG. Use the `lucide-react` (or equivalent) package in the target codebase rather than copying SVG paths.
- **Emoji** are used as category glyphs (🍕 🛒 ⚡ 🚗 📺 🎬 🧾). Fine to keep, or swap for icons per the codebase's convention.
- No raster images or logos — the FinAI logo is a Lucide "trending-up" style glyph in an orange tile.

## Files
- `FinAI Landing.dc.html` — marketing landing page.
- `FinAI Auth.dc.html` — sign in / sign up.
- `FinAI App.dc.html` — signed-in app (7 screens).

Read the inline styles and the logic class in each file as the source of truth for exact values.
