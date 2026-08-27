"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const handleShare = async () => {
    const shareData = { title, text, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
      aria-label="Share product"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
