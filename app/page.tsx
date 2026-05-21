"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, BarChart3, Bot, Receipt, Shield, Zap,
  ArrowRight, Sparkles, CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "AI Receipt Scanning",
    desc: "Upload any receipt photo. AI extracts merchant, amount, and category automatically.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Bot,
    title: "AI Financial Assistant",
    desc: "Ask anything about your spending in plain language. Get real, personalized answers.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Beautiful charts showing spending trends, category breakdowns, and a financial health score.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Natural Language Entry",
    desc: 'Type "Spent ₹450 on pizza today" and AI logs it instantly with the right category.',
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Budget Alerts",
    desc: "Get alerted before you overspend. AI catches unusual transactions in real time.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: TrendingUp,
    title: "Weekly AI Reports",
    desc: "Every Monday, receive an AI-generated spending summary delivered to your inbox.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const steps = [
  {
    icon: TrendingUp,
    title: "Create Your Account",
    desc: "Sign up in seconds. No credit card required. Start fresh or import existing data.",
  },
  {
    icon: Receipt,
    title: "Log Your Expenses",
    desc: "Scan receipts, type naturally, or let AI auto-categorize transactions as they happen.",
  },
  {
    icon: BarChart3,
    title: "Get AI Insights",
    desc: "Receive personalized weekly reports and actionable advice to reach your financial goals.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users", emoji: "👥" },
  { value: "₹500Cr+", label: "Spending Tracked", emoji: "💰" },
  { value: "4.9 ★", label: "App Rating", emoji: "⭐" },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .font-display { font-family: 'Syne', sans-serif; }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-float { animation: floatCard 7s ease-in-out infinite; }

        .fu1 { animation: fadeUp 0.65s ease-out 0.05s both; }
        .fu2 { animation: fadeUp 0.65s ease-out 0.18s both; }
        .fu3 { animation: fadeUp 0.65s ease-out 0.31s both; }
        .fu4 { animation: fadeUp 0.65s ease-out 0.44s both; }
        .fu5 { animation: fadeUp 0.65s ease-out 0.57s both; }

        .gradient-text {
          background: linear-gradient(135deg, var(--foreground) 0%, var(--primary) 55%, oklch(0.7 0.18 200) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dot-bg {
          background-image: radial-gradient(circle, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .glass {
          background: color-mix(in oklch, var(--card) 82%, transparent);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .primary-glow {
          box-shadow: 0 0 0 1px color-mix(in oklch, var(--primary) 28%, transparent),
                      0 8px 40px color-mix(in oklch, var(--primary) 14%, transparent);
        }

        .hero-radial {
          background: radial-gradient(ellipse 75% 50% at 50% -5%,
            color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.12);
          transition: transform 0.25s ease;
        }
        .feature-icon { transition: transform 0.25s ease; }
      `}</style>

      <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── NAVBAR ── */}
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}>
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-700 text-lg text-foreground">
                Fin<span className="text-primary">AI</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it Works"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" className="shadow-lg shadow-primary/25" asChild>
                <Link href="/sign-up">
                  Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
          <div className="absolute inset-0 dot-bg opacity-40" />
          <div className="absolute inset-0 hero-radial pointer-events-none" />
          <div className="absolute top-1/3 -right-48 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Copy */}
            <div>
              <div className="fu1 inline-flex items-center gap-2 border border-primary/30 bg-primary/8 text-primary rounded-full px-4 py-1.5 text-xs font-medium mb-8">
                <Sparkles className="h-3 w-3" />
                Smart finance, simplified
              </div>

              <h1 className="fu2 font-display text-5xl lg:text-6xl xl:text-[4.25rem] font-800 leading-[1.06] tracking-tight mb-6">
                <span className="text-foreground">Your Money,</span>
                <br />
                <span className="gradient-text">Finally Clear.</span>
              </h1>

              <p className="fu3 text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Scan receipts instantly, track every rupee, and get AI-powered insights that actually help you spend smarter — all in one app.
              </p>

              <div className="fu4 flex flex-wrap gap-4 mb-10">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-2xl shadow-primary/30 hover:shadow-primary/45 transition-all"
                  asChild
                >
                  <Link href="/sign-up">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>

              <div className="fu5 flex flex-wrap items-center gap-5">
                {["No credit card", "Free forever plan", "2-min setup"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="card-float relative w-[370px]">
                <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-3xl scale-90 -z-10" />

                <div className="glass primary-glow rounded-2xl overflow-hidden border border-border/60">
                  {/* Header */}
                  <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between bg-card/50">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground font-display">FinAI</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">May 2026</span>
                  </div>

                  {/* Stats */}
                  <div className="px-4 py-4 grid grid-cols-3 gap-2.5 border-b border-border/50">
                    {[
                      { label: "Spent", value: "₹24,850", cls: "text-rose-500" },
                      { label: "Budget", value: "₹35,000", cls: "text-foreground" },
                      { label: "Saved", value: "₹10,150", cls: "text-emerald-500" },
                    ].map((s) => (
                      <div key={s.label} className="bg-muted/40 rounded-xl p-2.5">
                        <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wide">{s.label}</p>
                        <p className={`text-xs font-bold ${s.cls}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div className="px-4 py-4 border-b border-border/50">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-3">6-month trend</p>
                    <div className="flex items-end gap-1.5 h-14">
                      {[38, 62, 44, 78, 52, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex items-end">
                          <div
                            className="w-full rounded-t-sm"
                            style={{
                              height: `${h}%`,
                              background: i === 5
                                ? "var(--primary)"
                                : `color-mix(in oklch, var(--primary) ${35 + i * 10}%, var(--muted))`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div className="px-4 py-4 space-y-2.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Recent</p>
                    {[
                      { emoji: "🍕", name: "Domino's Pizza", amt: "−₹450", cat: "Food" },
                      { emoji: "🛒", name: "BigBasket", amt: "−₹1,240", cat: "Shopping" },
                      { emoji: "⚡", name: "Electricity Bill", amt: "−₹890", cat: "Utilities" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center gap-2.5">
                        <span className="text-sm">{t.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{t.name}</p>
                          <p className="text-[9px] text-muted-foreground">{t.cat}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-500">{t.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Savings badge */}
                <div className="absolute -top-3 -right-3 glass border border-border/60 rounded-xl px-3 py-2 shadow-xl primary-glow">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Savings rate</p>
                      <p className="text-xs font-bold text-emerald-500">+29% ↑</p>
                    </div>
                  </div>
                </div>

                {/* AI badge */}
                <div className="absolute -bottom-3 -left-3 glass border border-border/60 rounded-xl px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-[10px] text-foreground font-medium">AI analysed your report</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="border-y border-border/50 bg-card/30">
          <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-3 divide-x divide-border/50">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-4">
                <p className="text-2xl mb-2">{s.emoji}</p>
                <p className="font-display text-3xl lg:text-4xl font-800 text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-border/50 rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-5">
                <Sparkles className="h-3 w-3 text-primary" />
                Everything you need
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-700 text-foreground mb-5 leading-tight">
                Built for how you
                <br />
                <span className="gradient-text">actually spend</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                From instant receipt scanning to weekly AI reports — every feature is designed to make financial clarity effortless.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="feature-card group bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
                  >
                    <div className={`feature-icon h-11 w-11 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-28 px-6 bg-card/20 border-y border-border/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-700 text-foreground mb-5 leading-tight">
                Up and running
                <br />
                <span className="gradient-text">in 3 steps</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No complicated setup. No lengthy onboarding. Just sign up and start tracking.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 relative">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-card border border-border/60 shadow-md flex items-center justify-center">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center font-display">
                        {i + 1}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:block absolute top-8 left-[calc(50%+2.75rem)] right-0 h-px bg-gradient-to-r from-border/80 to-transparent" />
                    )}
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-6">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/8 blur-3xl scale-95 pointer-events-none" />
            <div className="relative bg-card border border-primary/20 rounded-3xl overflow-hidden primary-glow">
              <div className="absolute inset-0 dot-bg opacity-25 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="relative px-10 py-16 text-center">
                <div className="text-5xl mb-5">💸</div>
                <h2 className="font-display text-4xl lg:text-5xl font-700 text-foreground mb-5 leading-tight">
                  Start saving smarter
                  <br />
                  <span className="gradient-text">today</span>
                </h2>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                  Join thousands of Indians who've transformed their relationship with money using FinAI. It's free to start.
                </p>
                <Button
                  size="lg"
                  className="h-12 px-10 text-base shadow-2xl shadow-primary/30 hover:shadow-primary/45 transition-all"
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started — It&apos;s Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">No credit card required · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-border/50 px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-display font-600 text-sm text-foreground">
                Fin<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 FinAI. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[["Sign In", "/sign-in"], ["Sign Up", "/sign-up"]].map(([label, href]) => (
                <Link key={label} href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
