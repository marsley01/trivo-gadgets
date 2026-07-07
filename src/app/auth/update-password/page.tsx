"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setError("Your password reset link is invalid or expired. Please request a new one.");
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Sign the user out to force them to sign in with their new credentials
      await supabase.auth.signOut();

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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
          <p className="text-muted mt-2 text-sm">Create a new password</p>
        </div>

        <div className="bg-surface/30 border border-default rounded-2xl p-8 backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Password updated successfully!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your new password has been successfully configured. You will be redirected to the sign-in page in a few seconds...
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="bg-accent text-black font-semibold rounded-lg px-6 py-2 text-sm hover:bg-accent/90 transition-colors inline-block"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-subtle mb-1.5">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-sm font-medium text-subtle mb-1.5">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    className="w-full bg-overlay-heavy border border-default rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
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
                disabled={loading || !!(error && error.includes("expired"))}
                className="w-full bg-accent text-black font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

