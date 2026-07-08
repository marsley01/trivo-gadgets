import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Trivo Kenya. Understand the terms governing purchases, delivery, returns, and use of our online store.",
  alternates: { canonical: "https://trivokenya.store/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Terms of Service</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-8">Terms of Service</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground">
            <p>Last updated: July 2026</p>

            <h2>1. Introduction</h2>
            <p>Welcome to Trivo Kenya. By accessing or using our website trivokenya.store, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

            <h2>2. Products & Pricing</h2>
            <p>All prices listed on Trivo Kenya are in Kenyan Shillings (KES). We strive to ensure accurate pricing, but errors may occur. We reserve the right to correct any pricing errors and refuse or cancel orders placed with incorrect pricing.</p>
            <p>Product images are for illustration purposes. Actual products may vary slightly from images shown.</p>

            <h2>3. Orders & Payment</h2>
            <p>By placing an order, you agree to provide accurate and complete information. We accept payments via M-PESA Till Number, cash on delivery (Nairobi only), and bank transfers.</p>
            <p>Orders are confirmed once payment is received or delivery is arranged via WhatsApp. We reserve the right to cancel orders at our discretion.</p>

            <h2>4. Delivery</h2>
            <p>Delivery timelines are estimates and not guarantees. Nairobi deliveries typically take 1-2 business days. Upcountry deliveries take 2-3 business days depending on courier availability.</p>
            <p>Risk of loss passes to you upon delivery confirmation.</p>

            <h2>5. Returns & Warranty</h2>
            <p>Our 7-day replacement warranty covers manufacturer defects. It does not cover damage from misuse, accidents, unauthorized modifications, or normal wear and tear. See our <Link href="/returns" className="text-accent hover:underline">Returns Policy</Link> for full details.</p>

            <h2>6. Intellectual Property</h2>
            <p>All content on this website—including text, images, logos, and design—is the property of Trivo Kenya and protected by Kenyan and international copyright laws.</p>

            <h2>7. Limitation of Liability</h2>
            <p>Trivo Kenya shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or website.</p>

            <h2>8. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>

            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

            <h2>10. Contact</h2>
            <p>For questions about these terms, reach us on <a href="https://wa.me/254757512769" className="text-accent hover:underline">WhatsApp</a> or email hello@trivokenya.store.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
