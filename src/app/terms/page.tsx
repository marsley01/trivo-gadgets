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
            <p>
              Welcome to Trivo Kenya. These Terms of Service govern your access to and use of trivokenya.store, including any purchases, content, and services offered through our website. By using our services, you agree to these terms. If you do not agree, please do not use our website.
            </p>

            <h2>1. Account Registration</h2>
            <p>
              When you create an account on Trivo Kenya, you agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the confidentiality of your password and account.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Be responsible for all activities that occur under your account.</li>
            </ul>
            <p>
              You may also place orders as a guest without creating an account. Guest orders are processed via WhatsApp and are not stored in our order database.
            </p>

            <h2>2. Products & Pricing</h2>
            <p>
              All prices listed on Trivo Kenya are in <strong>Kenyan Shillings (KES)</strong> and include all applicable taxes unless stated otherwise. We strive to ensure accurate pricing, but errors may occur. We reserve the right to:
            </p>
            <ul>
              <li>Correct any pricing errors at any time.</li>
              <li>Refuse or cancel orders placed with incorrect pricing.</li>
              <li>Modify or discontinue products without prior notice.</li>
            </ul>
            <p>
              Product images are for illustration purposes. Actual products may vary slightly from images shown due to screen calibration, manufacturing updates, or packaging changes.
            </p>

            <h2>3. Orders & Payment</h2>
            <p>
              By placing an order, you agree to provide accurate and complete information. All orders are subject to availability and acceptance.
            </p>
            <p><strong>Payment methods accepted:</strong></p>
            <ul>
              <li><strong>M-PESA</strong> — Paybill/Till Number (details provided at checkout).</li>
              <li><strong>Cash on Delivery</strong> — Available in Nairobi and select areas (subject to confirmation).</li>
              <li><strong>Bank Transfer</strong> — To our business account (details provided on request).</li>
            </ul>
            <p>
              Orders are confirmed once payment is received or delivery is arranged via WhatsApp. We reserve the right to cancel any order at our discretion, including but not limited to: suspected fraud, stock unavailability, or pricing errors.
            </p>
            <p>
              <strong>Order changes or cancellations:</strong> You may request to cancel or modify your order within 30 minutes of placement by contacting us on WhatsApp. After that, the order may already be in processing.
            </p>

            <h2>4. Delivery</h2>
            <p>
              Delivery timelines are estimates and not guarantees. We make every effort to meet the stated delivery windows.
            </p>
            <ul>
              <li><strong>Nairobi:</strong> Typically 1–2 business days. Free delivery on all orders.</li>
              <li><strong>Upcountry (Mombasa, Kisumu, Eldoret, Nakuru, Thika, and other regions):</strong> Typically 2–3 business days depending on courier availability. Delivery charges may apply and will be communicated at checkout.</li>
            </ul>
            <p>
              Risk of loss or damage to products passes to you upon delivery confirmation. If you are unavailable at the time of delivery, our courier will attempt to contact you. Failed delivery attempts may result in additional charges.
            </p>

            <h2>5. Returns & Warranty</h2>
            <p>
              Our <strong>7-day replacement warranty</strong> covers manufacturer defects. It does not cover:
            </p>
            <ul>
              <li>Damage caused by misuse, accidents, or unauthorized modifications.</li>
              <li>Normal wear and tear.</li>
              <li>Accessories or consumables (e.g., charging cables, ear tips).</li>
              <li>Products purchased outside Trivo Kenya.</li>
            </ul>
            <p>
              To initiate a return or warranty claim, contact us on WhatsApp within 7 days of delivery. You may be required to provide proof of purchase (order confirmation or receipt) and evidence of the defect (photo or video).
            </p>
            <p>
              See our full <Link href="/returns" className="text-accent hover:underline">Returns Policy</Link> for detailed instructions and exclusions.
            </p>

            <h2>6. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use our website for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
              <li>Submit false, misleading, or fraudulent information.</li>
              <li>Interfere with the proper functioning of our website, including introducing malware or viruses.</li>
              <li>Harass, abuse, or harm other users or our staff.</li>
            </ul>
            <p>
              Violation of these rules may result in immediate termination of your account and legal action where applicable.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on this website — including but not limited to text, graphics, logos, icons, images, audio clips, software, and design — is the property of Trivo Kenya or its content suppliers and is protected by Kenyan and international copyright, trademark, and intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works from, or exploit any content from this website without our prior written consent.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by Kenyan law:
            </p>
            <ul>
              <li>Trivo Kenya shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or website.</li>
              <li>Our total liability for any claim arising from these terms or your use of our services is limited to the amount you paid for the product giving rise to the claim.</li>
              <li>We are not liable for delays or failures caused by events outside our reasonable control (force majeure), including but not limited to: natural disasters, strikes, courier delays, or government actions.</li>
            </ul>

            <h2>9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to our services at any time, without prior notice, for conduct that we believe violates these terms, is harmful to other users, or is illegal. Upon termination, your right to use our services immediately ceases. Sections relating to intellectual property, limitation of liability, and governing law shall survive termination.
            </p>

            <h2>10. Privacy & Data Protection</h2>
            <p>
              Your use of our website is also governed by our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your personal data. By using our services, you consent to the data practices described in that policy.
            </p>

            <h2>11. Governing Law & Disputes</h2>
            <p>
              These terms are governed by the laws of the <strong>Republic of Kenya</strong>. Any disputes arising from or relating to these terms or your use of our services shall first be attempted to be resolved through informal negotiation. If unresolved, disputes shall be referred to the exclusive jurisdiction of the courts of <strong>Nairobi, Kenya</strong>.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these terms at any time. Changes will be posted on this page with an updated "Last updated" date. Material changes will be communicated via email or website notice. Continued use of our services after changes constitutes acceptance of the new terms. We encourage you to review this page periodically.
            </p>

            <h2>13. Contact</h2>
            <p>
              For questions, concerns, or inquiries regarding these terms:
            </p>
            <ul>
              <li><strong>WhatsApp:</strong> <a href="https://wa.me/254757512769" className="text-accent hover:underline">+254 757 512 769</a></li>
              <li><strong>Email:</strong> hello@trivokenya.store</li>
              <li><strong>Website:</strong> trivokenya.store</li>
              <li><strong>Location:</strong> Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
