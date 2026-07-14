"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      setError("Wrong email or password");
      setLoading(false);
      return;
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, status")
      .eq("email", email)
      .single();

    if (!vendor) {
      await supabase.auth.signOut();
      setError("Wrong email or password");
      setLoading(false);
      return;
    }

    if (vendor.status === "suspended") {
      await supabase.auth.signOut();
      setError("Your vendor account has been suspended");
      setLoading(false);
      return;
    }

    router.push("/vendor/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground text-center mb-8 tracking-tight">
          TRIVO <span className="text-accent">VENDOR</span>
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

          <button
            type="submit"
            disabled={loading}
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
    </div>
  );
}
