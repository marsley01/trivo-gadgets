"use client";

import Link from "next/link";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative text-center max-w-md">
        <div className="text-6xl font-extrabold text-accent/20 mb-4 select-none">Oops</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-full bg-accent text-black px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-default text-foreground px-8 py-3.5 text-sm font-medium transition-all hover:bg-surface hover:border-accent/30 active:scale-95"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
