"use client";

export default function PrintButton() {
  return (
    <div className="text-center pt-2 no-print">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm px-6 py-2.5 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Receipt
      </button>
    </div>
  );
}
