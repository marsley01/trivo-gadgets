"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
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
          <p className="text-muted mt-2 text-sm">Reset your account password</p>
        </div>

        <div className="bg-surface/30 border border-default rounded-2xl p-8 backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a password reset link to <span className="text-foreground font-medium">{email}</span>.
                Please click the link in the email to set a new password.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your registered email address below, and we will send you a secure link to reset your password.
              </p>

              <div>
                <label className="block text-sm font-medium text-subtle mb-1.5">Email Address</label>
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



              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-black font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
