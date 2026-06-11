"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "a5a0d21c-04c8-4ffa-97a2-75cafa4e9672";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkCaptcha = setInterval(() => {
      const w = window as unknown as { hcaptcha?: { render: (el: string | HTMLElement, opts: Record<string, unknown>) => string } };
      if (w.hcaptcha && captchaRef.current && !widgetIdRef.current) {
        try {
          const id = w.hcaptcha.render(captchaRef.current, {
            sitekey: HCAPTCHA_SITEKEY,
            theme: "dark",
            callback: (token: string) => { setCaptchaToken(token); },
            "expired-callback": () => { setCaptchaToken(""); },
            "error-callback": () => { setCaptchaToken(""); },
          });
          widgetIdRef.current = id;
          setCaptchaReady(true);
        } catch { /* retry */ }
        clearInterval(checkCaptcha);
      }
    }, 200);
    setTimeout(() => clearInterval(checkCaptcha), 15000);
    return () => clearInterval(checkCaptcha);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete the captcha challenge.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });

      if (error || !data.user) {
        setError(error?.message || "Login failed");
        setLoading(false);
        return;
      }

      const user = data.user;
      const tenantId = user?.user_metadata?.tenant_id;
      
      // Prevent cross-portal login: If they have a tenant_id, it must be 'customer'
      if (tenantId && tenantId !== "customer") {
        await supabase.auth.signOut();
        setError(`This account belongs to a ${tenantId}. Please use the correct portal to log in.`);
        setLoading(false);
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-highlight/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <img 
              src="/logo-transparent.svg" 
              alt="Trivo Kenya Logo" 
              className="h-16 w-auto" 
            />
          </Link>
          <p className="text-muted mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-surface/30 border border-default rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-subtle mb-1.5">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-overlay-heavy border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-subtle">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-overlay-heavy border border-default rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-center my-4 min-h-[80px] items-center">
              {!captchaReady ? (
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  Loading security check...
                </div>
              ) : null}
              <div ref={captchaRef} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full bg-accent text-black font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        async
        defer
        strategy="lazyOnload"
        onLoad={() => {
          const w = window as unknown as { hcaptcha?: { render: (el: string | HTMLElement, opts: Record<string, unknown>) => string } };
          if (w.hcaptcha && captchaRef.current && !widgetIdRef.current) {
            try {
              const id = w.hcaptcha.render(captchaRef.current, {
                sitekey: HCAPTCHA_SITEKEY,
                theme: "dark",
                callback: (token: string) => { setCaptchaToken(token); },
                "expired-callback": () => { setCaptchaToken(""); },
                "error-callback": () => { setCaptchaToken(""); },
              });
              widgetIdRef.current = id;
              setCaptchaReady(true);
            } catch { /* ignore */ }
          }
        }}
      />
    </div>
  );
}

