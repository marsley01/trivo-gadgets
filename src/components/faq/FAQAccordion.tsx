"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

type FAQ = { q: string; a: string };

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4 mb-16">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            id={`faq-item-${idx + 1}`}
            className="rounded-2xl bg-card border border-subtle backdrop-blur-md overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-card-hover transition-colors focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-foreground pr-4 text-base md:text-lg flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-accent shrink-0" />
                {faq.q}
              </span>
              <span className="h-8 w-8 rounded-full bg-surface border border-default flex items-center justify-center text-subtle shrink-0">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>

            <div
              className={`transition-all duration-350 ease-in-out ${
                isOpen ? "max-h-[300px] border-t border-subtle opacity-100" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="p-6 text-sm text-subtle leading-relaxed bg-surface/10">
                {faq.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
