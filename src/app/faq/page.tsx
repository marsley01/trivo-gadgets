// ✅ Server Component — JSON-LD schema visible to Googlebot in raw HTML
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/faq/FAQAccordion";
import { ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Common questions about ordering, delivery to Nairobi and upcountry, pay on delivery, M-PESA payment, and our 7-day replacement warranty at Trivo Kenya.",
  alternates: {
    canonical: "https://trivokenya.store/faq",
  },
  openGraph: {
    title: "FAQ | Trivo Kenya",
    description:
      "How to order, delivery timelines, pay on delivery, M-PESA payment, and warranty — all your questions answered.",
    url: "https://trivokenya.store/faq",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
  },
};

const faqs = [
  {
    q: "How do I place an order?",
    a: "You can order in two ways: either tap the 'Order via WhatsApp' button on any product page to chat with us directly (we'll see the exact item you're interested in), or add items to your cart and checkout through the website.",
  },
  {
    q: "How long does delivery take?",
    a: "If you're in Nairobi or surrounding suburbs, we deliver for free within 1 to 2 days. For upcountry orders outside Nairobi, we ship via couriers like Fargo Courier, G4S, or Easy Coach, which takes about 2 to 3 days.",
  },
  {
    q: "Can I pay on delivery?",
    a: "Yes, if you're in Nairobi, you can pay on delivery with free delivery! You get to check your item first before paying via M-PESA Till Number or cash. For upcountry orders, we ask for payment before dispatch and share the courier tracking slip with you immediately.",
  },
  {
    q: "Are your products original?",
    a: "100% original. We know how frustrating it is to buy a fake gadget. We only sell brand-new, authentic items in their original packaging. No copies, clones, or refurbished products.",
  },
  {
    q: "What if my gadget has a defect?",
    a: "Every gadget comes with a 7-day replacement warranty. If your item has a factory defect or isn't working right within 7 days of delivery, just send us a quick video on WhatsApp showing the issue, and we'll arrange a replacement unit for you.",
  },
  {
    q: "Where is your shop located?",
    a: "We operate as an online retail store with dispatch hubs across Nairobi. By not having expensive physical retail shops, we keep our costs low and pass those savings on to you, offering genuine gadgets at great prices with free home delivery in Nairobi.",
  },
];

// ✅ FAQPage schema in server component — Googlebot reads this in raw HTML
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      {/* ✅ JSON-LD rendered server-side — visible to Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-highlight/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-3xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">FAQ</span>
          </nav>

          <h1 id="faq-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Frequently Asked <span className="text-accent">Questions</span>
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-16 max-w-2xl leading-relaxed">
            Have questions? We&apos;ve got clear answers. Find out how our delivery works, how to pay, and our warranty details.
          </p>

          {/* Client component handles accordion toggle */}
          <FAQAccordion faqs={faqs} />

          <div className="text-center rounded-3xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl font-bold text-foreground mb-2">Have a question that&apos;s not listed here?</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Feel free to message us on WhatsApp. Whether you want to check if a charger works with your phone, see real photos of an item, or arrange a specific delivery time, we&apos;re happy to help.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hey%20Trivo!%20I%20have%20a%20question%20that%20isn't%20listed%20in%20your%20FAQ.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-accent text-black font-bold px-8 py-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(37,211,102,0.25)] text-sm"
            >
              <MessageSquare className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
