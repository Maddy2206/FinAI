import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3, Bot, Receipt, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "AI Receipt Scanning",
    desc: "Upload any receipt photo. AI extracts merchant, amount, and category automatically.",
  },
  {
    icon: Bot,
    title: "AI Financial Assistant",
    desc: "Ask questions about your spending in plain language. Get personalized insights.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Beautiful charts showing spending trends, category breakdowns, and financial health score.",
  },
  {
    icon: Zap,
    title: "Natural Language Entry",
    desc: 'Type "Spent ₹450 on pizza today" and AI logs it instantly.',
  },
  {
    icon: Shield,
    title: "Budget Alerts",
    desc: "Get alerted before you overspend. Anomaly detection catches unusual transactions.",
  },
  {
    icon: Wallet,
    title: "Weekly AI Reports",
    desc: "Every Monday, receive an AI-generated spending summary in your inbox.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">FinanceAI</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Zap className="h-3.5 w-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-foreground leading-tight mb-6">
          Your AI-Powered<br />
          <span className="text-primary">Financial Co-pilot</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Scan receipts, track budgets, get personalized insights, and receive weekly AI reports — all in one beautifully designed app.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start for Free →</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          Everything you need to master your finances
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to take control?</h2>
          <p className="text-muted-foreground mb-8">Join thousands managing their finances smarter with AI.</p>
          <Button size="lg" asChild>
            <Link href="/sign-up">Get Started — It&apos;s Free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 FinanceAI. Built with Next.js, Convex, and Claude AI.
      </footer>
    </div>
  );
}
