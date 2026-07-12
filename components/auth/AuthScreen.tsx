"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { TrendingUp, Receipt, Bot, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";
type Step = "form" | "verify" | "forgot" | "forgot-verify";

const FEATURES = [
  { icon: Receipt, text: "Scan receipts instantly — AI does the rest" },
  { icon: Bot, text: "Personalized insights on your spending habits" },
  { icon: Shield, text: "Smart budget alerts before you overspend" },
  { icon: BarChart3, text: "Weekly reports delivered to your inbox" },
];

function clerkErrorMessage(err: unknown, fallback: string) {
  if (
    typeof err === "object" &&
    err !== null &&
    "errors" in err &&
    Array.isArray((err as { errors?: unknown }).errors)
  ) {
    const first = (err as { errors: Array<{ message?: string }> }).errors[0];
    if (first?.message) return first.message;
  }
  return fallback;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthScreen({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignIn = mode === "signin";

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setError(null);
    setPassword("");
    setCode("");
  }

  async function handleGoogle() {
    setError(null);
    try {
      if (isSignIn) {
        if (!signIn) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } else {
        if (!signUp) return;
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      }
    } catch (err) {
      setError(clerkErrorMessage(err, "Couldn't continue with Google. Please try again."));
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Additional verification is required for this account.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err, "Couldn't sign in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;
    setLoading(true);
    setError(null);
    try {
      const [firstName, ...rest] = fullName.trim().split(" ");
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
      });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        router.push("/dashboard");
        return;
      }
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(clerkErrorMessage(err, "Couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err, "Invalid or expired code."));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotRequest(e: FormEvent) {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("forgot-verify");
    } catch (err) {
      setError(clerkErrorMessage(err, "Couldn't find an account with that email."));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotVerify(e: FormEvent) {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Couldn't reset your password. Please try again.");
      }
    } catch (err) {
      setError(clerkErrorMessage(err, "Invalid or expired code."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream text-ink">
      {/* LEFT PANEL — dark, decorative */}
      <div className="relative hidden w-1/2 flex-shrink-0 flex-col justify-between overflow-hidden border-r-2 border-ink bg-ink px-15 py-14 text-cream lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,244,232,0.1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div
            className="animate-float-a absolute left-[292px] top-[45px] z-[1] w-[190px] rounded-[18px] border-2 border-ink bg-cream px-5.5 py-4.5 text-ink shadow-[5px_5px_0_var(--orange)]"
          >
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/55">
              Saved this month
            </p>
            <p className="font-heading text-[28px] font-extrabold">₹10,150</p>
            <p className="mt-1.5 text-[13px] font-bold text-success">
              +29% vs last month ↑
            </p>
          </div>
        </div>

        <div className="relative z-[1]">
          <div className="animate-fade-up mb-16 flex items-center gap-2.5" style={{ animationDelay: "0.05s" }}>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border-2 border-cream bg-orange shadow-[2px_2px_0_var(--cream)]">
              <TrendingUp style={{ height: 16, width: 16 }} stroke="#faf4e8" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-[21px] font-extrabold">
              Fin<span className="text-marigold">AI</span>
            </span>
          </div>

          <div className="mb-11">
            {isSignIn ? (
              <h1
                className="animate-fade-up mb-5 font-heading text-[42px] font-extrabold leading-[1.0] tracking-[-0.02em] xl:text-[56px]"
                style={{ animationDelay: "0.15s" }}
              >
                Welcome{" "}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(transparent 55%, #f4650c 55%, #f4650c 92%, transparent 92%)",
                  }}
                >
                  back.
                </span>
              </h1>
            ) : (
              <h1
                className="animate-fade-up mb-5 font-heading text-[42px] font-extrabold leading-[1.0] tracking-[-0.02em] xl:text-[56px]"
                style={{ animationDelay: "0.15s" }}
              >
                Money,{" "}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(transparent 55%, #f4650c 55%, #f4650c 92%, transparent 92%)",
                  }}
                >
                  sorted.
                </span>
              </h1>
            )}
            <p
              className="animate-fade-up max-w-sm text-base leading-relaxed text-cream/60"
              style={{ animationDelay: "0.25s" }}
            >
              {isSignIn
                ? "Your finances don't take a break — sign in to see where you stand and what's changed since your last visit."
                : "Join 50,000+ Indians tracking every rupee with AI. Free forever, 2-minute setup, no credit card."}
            </p>
          </div>

          <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "0.35s" }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-cream/25 bg-cream/10">
                  <Icon style={{ height: 14, width: 14 }} stroke="#ffb02e" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-cream/75">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-float-b absolute bottom-[170px] right-[60px] z-[1] w-[170px] rounded-[18px] border-2 border-ink bg-marigold px-5 py-4 text-ink shadow-[5px_5px_0_var(--cream)]">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/60">
            Health score
          </p>
          <p className="font-heading text-[32px] font-extrabold">
            87<span className="text-[15px] font-semibold text-ink/55"> / 100</span>
          </p>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-cream">
            <div className="h-full w-[87%] bg-ink" />
          </div>
          <p className="mt-2 text-xs font-bold">Excellent ✓</p>
        </div>

        <div
          className="animate-float-a absolute bottom-18 left-15 z-[1] rounded-[14px] border-2 border-ink bg-cream px-4 py-2.5 text-ink shadow-[4px_4px_0_var(--marigold)]"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🛒</span>
            <div>
              <p className="text-[13px] font-bold">BigBasket</p>
              <p className="text-[11px] text-ink/55">Shopping · 2h ago</p>
            </div>
            <span className="ml-2 text-[13px] font-bold">−₹1,240</span>
          </div>
        </div>

        <p className="relative z-[1] text-xs text-cream/35">© 2026 FinAI. All rights reserved.</p>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-ink bg-orange">
              <TrendingUp style={{ height: 16, width: 16 }} stroke="#faf4e8" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-lg font-extrabold">
              Fin<span className="text-orange">AI</span>
            </span>
          </div>

          {step === "form" && (
            <>
              <h2 className="mb-2 font-heading text-[32px] font-extrabold tracking-[-0.01em]">
                {isSignIn ? (
                  <>
                    Sign in to Fin<span className="text-orange">AI</span>
                  </>
                ) : (
                  "Create your account"
                )}
              </h2>
              <p className="mb-8 text-sm text-ink/60">
                {isSignIn
                  ? "Welcome back — your dashboard is waiting."
                  : "Free forever · no credit card · 2-min setup."}
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-2.5 rounded-[14px] border-2 border-ink bg-white py-3.5 font-sans text-[15px] font-bold text-ink transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)]"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3.5">
                <div className="h-0.5 flex-1 bg-ink/[0.12]" />
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/45">or</span>
                <div className="h-0.5 flex-1 bg-ink/[0.12]" />
              </div>

              <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="flex flex-col gap-4.5">
                {!isSignIn && (
                  <div>
                    <Label htmlFor="fullName" className="mb-2">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Priya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setStep("forgot");
                          setError(null);
                        }}
                        className="text-xs font-semibold text-orange hover:text-ink"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                {!isSignIn && <div id="clerk-captcha" />}

                {error && <p className="text-sm font-semibold text-danger">{error}</p>}

                <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                  {loading ? "Please wait…" : isSignIn ? "Sign in →" : "Create account →"}
                </Button>
              </form>

              <p className="mt-6 text-center text-[13px] text-ink/60">
                {isSignIn ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-bold text-ink hover:text-orange"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="font-bold text-ink hover:text-orange"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 className="mb-2 font-heading text-[32px] font-extrabold tracking-[-0.01em]">
                Check your inbox
              </h2>
              <p className="mb-8 text-sm text-ink/60">
                We sent a 6-digit code to <span className="font-bold text-ink">{email}</span>.
              </p>
              <form onSubmit={handleVerify} className="flex flex-col gap-4.5">
                <div>
                  <Label htmlFor="code" className="mb-2">
                    Verification code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm font-semibold text-danger">{error}</p>}
                <Button type="submit" size="lg" disabled={loading} className="w-full">
                  {loading ? "Verifying…" : "Verify & continue →"}
                </Button>
              </form>
              <p className="mt-6 text-center text-[13px] text-ink/60">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold text-ink hover:text-orange"
                >
                  Start over
                </button>
              </p>
            </>
          )}

          {step === "forgot" && (
            <>
              <h2 className="mb-2 font-heading text-[32px] font-extrabold tracking-[-0.01em]">
                Reset your password
              </h2>
              <p className="mb-8 text-sm text-ink/60">
                Enter your email and we&apos;ll send you a reset code.
              </p>
              <form onSubmit={handleForgotRequest} className="flex flex-col gap-4.5">
                <div>
                  <Label htmlFor="forgot-email" className="mb-2">
                    Email address
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm font-semibold text-danger">{error}</p>}
                <Button type="submit" size="lg" disabled={loading} className="w-full">
                  {loading ? "Sending…" : "Send reset code →"}
                </Button>
              </form>
              <p className="mt-6 text-center text-[13px] text-ink/60">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-bold text-ink hover:text-orange"
                >
                  Back to sign in
                </button>
              </p>
            </>
          )}

          {step === "forgot-verify" && (
            <>
              <h2 className="mb-2 font-heading text-[32px] font-extrabold tracking-[-0.01em]">
                Set a new password
              </h2>
              <p className="mb-8 text-sm text-ink/60">
                Enter the code we sent to{" "}
                <span className="font-bold text-ink">{email}</span> and choose a new password.
              </p>
              <form onSubmit={handleForgotVerify} className="flex flex-col gap-4.5">
                <div>
                  <Label htmlFor="reset-code" className="mb-2">
                    Reset code
                  </Label>
                  <Input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" className="mb-2">
                    New password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                {error && <p className="text-sm font-semibold text-danger">{error}</p>}
                <Button type="submit" size="lg" disabled={loading} className="w-full">
                  {loading ? "Resetting…" : "Reset password →"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
