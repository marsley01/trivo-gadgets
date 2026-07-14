"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone, tenant_id: "customer" },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.session && authData.user) {
        const { error: profileError } = await supabase.from("customers").upsert({
          user_id: authData.user.id,
          email,
          full_name: fullName || null,
          phone: phone || null,
        }, { onConflict: "user_id", ignoreDuplicates: true });

        if (profileError) {
          setError("Account creation failed. Please try again.");
          setLoading(false);
          return;
        }

        router.push("/account");
        router.refresh();
      } else {
        setConfirmed(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 pointer-events-none" />
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Check your email</h1>
          <p className="text-muted text-sm mb-2">
            We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-muted-foreground text-xs mb-8">
            Click the link to activate your account, then sign in.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full bg-accent text-black font-semibold rounded-lg py-2.5 text-sm hover:bg-accent/90 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
          <p className="text-muted mt-2 text-sm">Create your account</p>
        </div>

        <div className="bg-surface/30 border border-default rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-subtle mb-1.5">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-overlay-heavy border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-subtle mb-1.5">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full bg-overlay-heavy border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-subtle mb-1.5">Password</label>
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
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}