import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-highlight/5 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-highlight/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative text-center max-w-md">
        <div className="text-8xl md:text-9xl font-extrabold text-accent/20 mb-4 select-none">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-black px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
          >
            Back to Store
          </Link>
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 rounded-full border border-default text-foreground px-8 py-3.5 text-sm font-medium transition-all hover:bg-surface hover:border-accent/30 active:scale-95"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
