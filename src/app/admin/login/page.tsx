"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Script from "next/script";

const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "a5a0d21c-04c8-4ffa-97a2-75cafa4e9672";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();

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

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (authError || !authData.user) {
      setError("Wrong email or password");
      setLoading(false);
      return;
    }

    const user = authData.user;
    const tenantId = user?.user_metadata?.tenant_id;
    
    // Prevent cross-portal login: If they have a tenant_id, it must be 'admin'
    if (tenantId && tenantId !== "admin") {
      await supabase.auth.signOut();
      setError(`This account belongs to a ${tenantId}. Please use the correct portal to log in.`);
      setLoading(false);
      return;
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("email", email)
      .single();

    if (!adminUser) {
      await supabase.auth.signOut();
      setError("Not authorised as an admin");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground text-center mb-8 tracking-tight">
          TRIVO <span className="text-accent">ADMIN</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors text-sm"
            />
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

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              "Log In"
            )}
          </button>
        </form>
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
