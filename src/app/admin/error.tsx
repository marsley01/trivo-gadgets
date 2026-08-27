"use client";

import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-3">Admin Error</h1>
        <p className="text-muted text-sm mb-8">{error.message || "Something went wrong in the admin panel."}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={reset} className="rounded-full bg-accent text-black px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95">Try Again</button>
          <Link href="/admin" className="rounded-full border border-default text-foreground px-8 py-3.5 text-sm font-medium transition-all hover:bg-surface hover:border-accent/30 active:scale-95">Admin Home</Link>
        </div>
      </div>
    </div>
  );
}
