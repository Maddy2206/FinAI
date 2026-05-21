import { SignUp } from "@clerk/nextjs";
import { TrendingUp, Receipt, Brain, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Receipt,   text: "Scan receipts instantly — AI does the rest" },
  { icon: Brain,     text: "Personalized insights on your spending habits" },
  { icon: Shield,    text: "Smart budget alerts before you overspend" },
  { icon: BarChart3, text: "Weekly reports delivered to your inbox" },
];

export default function SignUpPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .font-display { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50%       { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50%       { transform: translateY(-16px) rotate(2deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-9px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }

        .fu1 { animation: fadeUp 0.6s ease-out 0.05s both; }
        .fu2 { animation: fadeUp 0.6s ease-out 0.18s both; }
        .fu3 { animation: fadeUp 0.6s ease-out 0.30s both; }
        .fu4 { animation: fadeUp 0.6s ease-out 0.42s both; }
        .fu5 { animation: fadeUp 0.6s ease-out 0.54s both; }
        .fu6 { animation: fadeUp 0.6s ease-out 0.66s both; }

        .deco-a { animation: floatA 7s ease-in-out infinite; }
        .deco-b { animation: floatB 9s ease-in-out 1.5s infinite; }
        .deco-c { animation: floatC 6s ease-in-out 3s infinite; }
        .glow-pulse { animation: glowPulse 5s ease-in-out infinite; }

        .left-panel-bg {
          background: linear-gradient(145deg, #0e0e1f 0%, #0a0a18 100%);
        }
        .dot-grid-left {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .glass-white {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .gradient-headline {
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .accent-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, oklch(0.7 0.18 200) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .panel-divider {
          width: 1px;
          flex-shrink: 0;
          background: linear-gradient(to bottom, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
        }
      `}</style>

      <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ══ LEFT PANEL — always dark, sticky ══ */}
        <div className="hidden lg:flex left-panel-bg sticky top-0 h-screen w-[52%] overflow-hidden flex-col justify-between p-12 xl:p-16 flex-shrink-0">

          <div className="absolute inset-0 dot-grid-left pointer-events-none" />
          <div className="glow-pulse absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--primary) 35%, transparent) 0%, transparent 65%)" }} />
          <div className="glow-pulse absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent) 0%, transparent 65%)", animationDelay: "2.5s" }} />

          <div className="relative z-10">
            <div className="fu1 flex items-center gap-3 mb-14">
              <div className="h-9 w-9 rounded-xl glass-white flex items-center justify-center">
                <TrendingUp style={{ width: "1.125rem", height: "1.125rem" }} className="text-white" />
              </div>
              <span className="font-display text-xl font-700 text-white/90">
                Fin<span className="accent-gradient">AI</span>
              </span>
            </div>

            <div className="mb-10">
              <h1 className="fu2 font-display text-4xl xl:text-[2.85rem] font-800 leading-[1.08] tracking-tight mb-4">
                <span className="gradient-headline">Take control of</span>
                <br />
                <span className="accent-gradient">every rupee.</span>
              </h1>
              <p className="fu3 text-sm xl:text-base leading-relaxed text-white/50 max-w-sm">
                Join thousands managing their finances smarter — with intelligent tracking, instant receipt scanning, and weekly insights.
              </p>
            </div>

            <ul className="space-y-3.5">
              {features.map(({ icon: Icon, text }, i) => (
                <li key={text} className={`fu${i + 4} flex items-center gap-3`}>
                  <div className="h-7 w-7 rounded-lg glass-white flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-white/75" />
                  </div>
                  <span className="text-sm text-white/60">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-white/20">© 2026 FinAI. All rights reserved.</p>

          <div className="deco-b absolute top-20 right-6 glass-white rounded-2xl px-4 py-3.5 w-52 z-10">
            <p className="text-[9px] uppercase tracking-widest text-white/35 mb-1.5">Saved this month</p>
            <p className="font-display text-2xl font-700 text-white">₹10,150</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+29% vs last month</span>
            </div>
          </div>

          <div className="deco-a absolute bottom-24 right-8 glass-white rounded-2xl p-4 w-52 z-10">
            <p className="text-[9px] uppercase tracking-widest text-white/35 mb-3">6-month trend</p>
            <div className="flex items-end gap-1.5 h-14">
              {[38, 62, 44, 80, 55, 100].map((h, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{
                    height: `${h}%`,
                    background: i === 5 ? "white" : `rgba(255,255,255,${0.12 + i * 0.09})`,
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div className="deco-c absolute top-1/2 -translate-y-8 right-5 glass-white rounded-2xl p-4 w-44 z-10">
            <p className="text-[9px] uppercase tracking-widest text-white/35 mb-2">Health Score</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-display text-3xl font-700 text-white">87</span>
              <span className="text-xs text-white/35">/ 100</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full bg-emerald-400 w-[87%]" />
            </div>
            <p className="text-[10px] text-emerald-400 mt-1.5 font-medium">Excellent ✓</p>
          </div>

          <div className="deco-b absolute bottom-36 left-10 glass-white rounded-xl px-3.5 py-2.5 z-10" style={{ animationDelay: "4s" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-base">🛒</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/85 truncate">BigBasket</p>
                <p className="text-[9px] text-white/35">Shopping · 2h ago</p>
              </div>
              <span className="text-xs font-semibold text-white/65 ml-1 shrink-0">−₹1,240</span>
            </div>
          </div>
        </div>

        {/* Panel divider */}
        <div className="hidden lg:block panel-divider" />

        {/* ══ RIGHT PANEL — always light ══ */}
        <div className="flex-1 flex flex-col bg-white min-h-screen">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 px-6 pt-6">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-base font-700 text-gray-900">
              Fin<span style={{ color: "var(--primary)" }}>AI</span>
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-[400px]">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-700 text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500 mt-1">Start managing your finances smarter today.</p>
              </div>

              <SignUp />

              <p className="mt-5 text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
