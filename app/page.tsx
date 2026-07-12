import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Bot,
  Receipt,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "AI Receipt Scanning",
    desc: "Upload any receipt photo. AI extracts merchant, amount, and category automatically.",
    bg: "bg-marigold",
    iconColor: "#1c1b2e",
  },
  {
    icon: Bot,
    title: "AI Financial Assistant",
    desc: "Ask anything about your spending in plain language. Get real, personalized answers.",
    bg: "bg-orange",
    iconColor: "#faf4e8",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Beautiful charts showing spending trends, category breakdowns, and a financial health score.",
    bg: "bg-ink",
    iconColor: "#ffb02e",
  },
  {
    icon: Zap,
    title: "Natural Language Entry",
    desc: 'Type "Spent ₹450 on pizza today" and AI logs it instantly with the right category.',
    bg: "bg-ink",
    iconColor: "#faf4e8",
  },
  {
    icon: Shield,
    title: "Budget Alerts",
    desc: "Get alerted before you overspend. AI catches unusual transactions in real time.",
    bg: "bg-marigold",
    iconColor: "#1c1b2e",
  },
  {
    icon: TrendingUp,
    title: "Weekly AI Reports",
    desc: "Every Monday, receive an AI-generated spending summary delivered to your inbox.",
    bg: "bg-orange",
    iconColor: "#faf4e8",
  },
];

const steps = [
  {
    n: 1,
    color: "text-marigold",
    title: "Create your account",
    desc: "Sign up in seconds. No credit card required. Start fresh or import existing data.",
  },
  {
    n: 2,
    color: "text-orange",
    title: "Log your expenses",
    desc: "Scan receipts, type naturally, or let AI auto-categorize transactions as they happen.",
  },
  {
    n: 3,
    color: "text-marigold",
    title: "Get AI insights",
    desc: "Receive personalized weekly reports and actionable advice to reach your financial goals.",
  },
];

const stats = [
  { value: "50K+", label: "Active users", tone: "bg-white", rotate: "-rotate-1" },
  { value: "₹500Cr+", label: "Spending tracked", tone: "bg-marigold", rotate: "rotate-1" },
  { value: "4.9 ★", label: "App rating", tone: "bg-white", rotate: "-rotate-1" },
];

const tickerText =
  "TRACK EVERY RUPEE ✦ SCAN ANY RECEIPT ✦ ASK AI ANYTHING ✦ WEEKLY REPORTS ✦ BUDGET ALERTS ✦ 50K+ USERS ✦ ₹500Cr+ TRACKED ✦ ";

function Logo({ size = 34, iconSize = 16 }: { size?: number; iconSize?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[10px] border-2 border-ink bg-orange shadow-[2px_2px_0_var(--ink)]"
      style={{ height: size, width: size }}
    >
      <TrendingUp
        style={{ height: iconSize, width: iconSize }}
        stroke="#faf4e8"
        strokeWidth={2.5}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream">
        <nav className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-heading text-[21px] font-extrabold">
              Fin<span className="text-orange">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#features" className="hover:text-orange">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-orange">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3.5">
            <Link
              href="/sign-in"
              className="rounded-full border-2 border-transparent px-4.5 py-2.5 text-sm font-bold hover:border-ink"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-5.5 py-2.5 text-sm font-bold text-cream shadow-[3px_3px_0_var(--orange)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--orange)]"
            >
              Get started ↗
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-8 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <div
              className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-marigold px-4.5 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_var(--ink)]"
              style={{ animationDelay: "0.05s" }}
            >
              ✦ Smart finance, simplified
            </div>

            <h1
              className="animate-fade-up mb-7 font-heading text-[48px] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-[64px] lg:text-[82px]"
              style={{ animationDelay: "0.15s" }}
            >
              Your money,{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(transparent 55%, #ffb02e 55%, #ffb02e 92%, transparent 92%)",
                }}
              >
                finally clear.
              </span>
            </h1>

            <p
              className="animate-fade-up mb-10 max-w-[480px] text-[19px] leading-relaxed text-ink/70"
              style={{ animationDelay: "0.25s" }}
            >
              Scan receipts instantly, track every rupee, and get AI-powered
              insights that actually help you spend smarter — all in one app.
            </p>

            <div
              className="animate-fade-up mb-8 flex flex-wrap gap-3.5"
              style={{ animationDelay: "0.35s" }}
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange px-8.5 py-4.5 text-[17px] font-bold text-cream shadow-[4px_4px_0_var(--ink)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)]"
              >
                Start for free →
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center rounded-full border-2 border-ink bg-cream px-8.5 py-4.5 text-[17px] font-bold transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--marigold)]"
              >
                Sign in
              </Link>
            </div>

            <div
              className="animate-fade-up flex flex-wrap gap-6 text-[13px] font-semibold text-ink/60"
              style={{ animationDelay: "0.45s" }}
            >
              <span>✓ No credit card</span>
              <span>✓ Free forever plan</span>
              <span>✓ 2-min setup</span>
            </div>
          </div>

          {/* Stacked mockup cards */}
          <div
            className="animate-fade-up relative flex flex-col gap-4.5"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="animate-bob rounded-[22px] border-2 border-ink bg-white px-7.5 py-6.5 shadow-[6px_6px_0_var(--ink)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink/55">
                  Spent this month
                </p>
                <span className="rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 text-[11px] font-bold">
                  May 2026
                </span>
              </div>
              <p className="font-heading text-[46px] font-extrabold tracking-[-0.02em]">
                ₹24,850{" "}
                <span className="text-[17px] text-orange">of ₹35,000</span>
              </p>
              <div className="mt-4 h-3.5 overflow-hidden rounded-full border-2 border-ink bg-cream">
                <div
                  className="h-full w-[71%]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #f4650c, #f4650c 8px, #ffb02e 8px, #ffb02e 16px)",
                  }}
                />
              </div>
              <div className="mt-2.5 flex justify-between text-xs font-semibold text-ink/60">
                <span>71% used</span>
                <span>₹10,150 left</span>
              </div>
            </div>

            <div className="flex gap-4.5">
              <div className="flex-1 rotate-1 rounded-[22px] bg-ink px-6 py-5.5 text-cream shadow-[5px_5px_0_var(--marigold)]">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-cream/60">
                  Saved
                </p>
                <p className="font-heading text-[32px] font-extrabold">
                  ₹10,150
                </p>
                <p className="mt-1 text-sm font-bold text-marigold">
                  +29% vs April ↑
                </p>
              </div>
              <div className="flex-[1.2] -rotate-1 rounded-[22px] border-2 border-ink bg-white px-6 py-5.5 shadow-[5px_5px_0_var(--ink)]">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink/55">
                  You typed
                </p>
                <p className="text-[15px] font-semibold leading-snug">
                  &ldquo;Spent ₹450 on pizza today&rdquo; 🍕
                </p>
                <p className="mt-2.5 inline-block rounded-full bg-orange/10 px-3 py-1 text-[13px] font-bold text-orange">
                  → Food · logged ✓
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-y-2 border-ink bg-orange py-3.5">
        <div className="flex w-max animate-marquee">
          <span className="whitespace-nowrap pr-6 font-heading text-base font-bold text-cream">
            {tickerText}
          </span>
          <span className="whitespace-nowrap pr-6 font-heading text-base font-bold text-cream">
            {tickerText}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-5 px-8 py-18 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.tone} ${s.rotate} rounded-[22px] border-2 border-ink px-5 py-7.5 text-center shadow-[4px_4px_0_var(--ink)]`}
          >
            <p className="font-heading text-[44px] font-extrabold tracking-[-0.02em]">
              {s.value}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-ink/65">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" className="px-8 pb-26 pt-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-14 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4.5 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_var(--ink)]">
              ✦ Everything you need
            </div>
            <h2 className="mb-4.5 font-heading text-[36px] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-[56px]">
              Built for how you
              <br />
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(transparent 55%, #ffb02e 55%, #ffb02e 92%, transparent 92%)",
                }}
              >
                actually spend
              </span>
            </h2>
            <p className="mx-auto max-w-[540px] text-base leading-relaxed text-ink/65">
              From instant receipt scanning to weekly AI reports — every
              feature is designed to make financial clarity effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-[22px] border-2 border-ink bg-white p-7 transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]"
                >
                  <div
                    className={`mb-4.5 flex h-[46px] w-[46px] items-center justify-center rounded-[14px] border-2 border-ink ${f.bg}`}
                  >
                    <Icon
                      style={{ height: 20, width: 20 }}
                      stroke={f.iconColor}
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="mb-2 font-heading text-[19px] font-bold">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink/65">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-t-2 border-ink bg-ink px-8 py-26 text-cream"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-cream bg-orange px-4.5 py-1.5 text-[13px] font-bold text-cream">
              ✦ Simple by design
            </div>
            <h2 className="mb-4.5 font-heading text-[36px] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-[56px]">
              Up and running
              <br />
              <span className="text-marigold">in 3 steps</span>
            </h2>
            <p className="mx-auto max-w-[440px] text-base leading-relaxed text-cream/65">
              No complicated setup. No lengthy onboarding. Just sign up and
              start tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-[22px] border-2 border-cream/25 bg-cream/[0.06] p-7.5"
                style={i === 1 ? { transform: "translateY(16px)" } : i === 2 ? { transform: "translateY(32px)" } : undefined}
              >
                <div className={`mb-4 font-heading text-[40px] font-extrabold ${step.color}`}>
                  {step.n}
                </div>
                <h3 className="mb-2.5 font-heading text-xl font-bold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-cream/65">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-26">
        <div className="relative mx-auto max-w-[880px] overflow-hidden rounded-[28px] border-2 border-ink bg-marigold px-8 py-18 text-center shadow-[8px_8px_0_var(--ink)] sm:px-12">
          <div className="absolute left-9 top-6 -rotate-[8deg] font-heading text-2xl font-extrabold">
            ₹
          </div>
          <div className="absolute bottom-7 right-10 rotate-[10deg] font-heading text-[32px] font-extrabold opacity-50">
            ₹
          </div>
          <h2 className="mb-5 font-heading text-[36px] font-extrabold leading-[1.0] tracking-[-0.02em] sm:text-[58px]">
            Start saving smarter <span className="text-orange">today</span>
          </h2>
          <p className="mx-auto mb-10 max-w-[460px] text-base leading-relaxed text-ink/70">
            Join thousands of Indians who&apos;ve transformed their
            relationship with money using FinAI. It&apos;s free to start.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-10 py-4.5 text-[17px] font-bold text-cream shadow-[4px_4px_0_var(--cream)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--cream)]"
          >
            Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4.5 text-[13px] font-semibold text-ink/60">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-ink px-8 py-8">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={26} iconSize={12} />
            <span className="font-heading text-base font-bold">
              Fin<span className="text-orange">AI</span>
            </span>
          </div>
          <p className="text-[13px] font-medium text-ink/55">
            © 2026 FinAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-[13px] font-semibold">
            <Link href="/sign-in" className="hover:text-orange">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-orange">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
