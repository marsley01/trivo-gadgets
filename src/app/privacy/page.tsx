import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Trivo Kenya. Learn how we collect, use, and protect your personal information when you shop with us.",
  alternates: { canonical: "https://trivokenya.store/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Privacy Policy</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-8">Privacy Policy</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground">
            <p>Last updated: July 2026</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide when placing an order, including your name, phone number, email address, and delivery location. We also collect browsing data through cookies and analytics tools to improve your shopping experience.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to process orders, arrange delivery, communicate order updates via WhatsApp, and improve our website and product offerings. We do not sell your personal information to third parties.</p>

            <h2>3. Data Sharing</h2>
            <p>We share your delivery address and phone number with our courier partners solely for delivery purposes. We may share anonymized analytics data with service providers like Vercel and Supabase who help us operate our website.</p>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your data. However, no online transmission is 100% secure. We use HTTPS encryption and follow industry best practices for data storage.</p>

            <h2>5. Cookies</h2>
            <p>We use essential cookies for website functionality and analytics cookies (via Vercel Analytics) to understand usage patterns. You can control cookies through your browser settings.</p>

            <h2>6. Your Rights</h2>
            <p>Under Kenyan data protection law, you have the right to access, correct, or delete your personal data. Contact us on WhatsApp to exercise these rights.</p>

            <h2>7. Third-Party Services</h2>
            <p>Our website uses Supabase for database and authentication, Vercel for hosting, and WhatsApp for customer communication. These services have their own privacy policies governing data handling.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this policy periodically. Changes will be posted on this page with an updated date.</p>

            <h2>9. Contact</h2>
            <p>For privacy-related inquiries, contact us on <a href="https://wa.me/254757512769" className="text-accent hover:underline">WhatsApp</a> or email hello@trivokenya.store.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
