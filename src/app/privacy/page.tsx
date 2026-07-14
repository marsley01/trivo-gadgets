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
            <p>
              At Trivo Kenya, we take your privacy seriously. This policy explains how we collect, use, disclose, and safeguard your personal data when you visit our website or make a purchase. It applies to all users of trivokenya.store.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect the following categories of information to provide and improve our service:</p>
            <p><strong>Information you provide directly:</strong></p>
            <ul>
              <li><strong>Account details:</strong> When you sign up, we collect your full name, email address, phone number, and password (stored securely as a hashed credential via Supabase Auth).</li>
              <li><strong>Order information:</strong> When you place an order, we collect your name, phone number, delivery address or location, and order notes. We do not store payment card details — payments are processed via M-PESA, bank transfer, or cash on delivery, none of which are handled on our servers.</li>
              <li><strong>Communications:</strong> Any messages, inquiries, or feedback you send us via WhatsApp, email, or website forms.</li>
              <li><strong>Profile data:</strong> Your wishlist items, review submissions, and order history associated with your account.</li>
            </ul>
            <p><strong>Information collected automatically:</strong></p>
            <ul>
              <li><strong>Usage data:</strong> Pages visited, time spent, referral source, and interactions with our site — collected via Vercel Analytics and Speed Insights (aggregated, not personally identifiable).</li>
              <li><strong>Device data:</strong> Browser type, operating system, device type, and IP address (used for security and rate-limiting only).</li>
              <li><strong>Cookies:</strong> Essential cookies for session management and authentication. No third-party tracking or advertising cookies are used.</li>
            </ul>

            <h2>2. How We Collect Your Data</h2>
            <p>We collect data through the following methods:</p>
            <ul>
              <li><strong>Account registration and checkout forms</strong> — when you sign up, log in, or place an order on trivokenya.store.</li>
              <li><strong>WhatsApp conversations</strong> — when you contact us directly for orders or support.</li>
              <li><strong>Automated technologies</strong> — Vercel Analytics tracks anonymized page views and interactions. Essential cookies are set by Supabase Auth for session management.</li>
              <li><strong>Newsletter subscription</strong> — when you voluntarily subscribe via our email form (powered by Resend).</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your data for the following purposes:</p>
            <ul>
              <li>Processing and fulfilling your orders, including sharing delivery details with our courier partners.</li>
              <li>Communicating order updates, confirmations, and receipts via WhatsApp and email.</li>
              <li>Sending password reset emails (via Resend) when you request one.</li>
              <li>Sending welcome emails to new admin and vendor accounts.</li>
              <li>Sending newsletter updates (only if you have subscribed — you may unsubscribe at any time).</li>
              <li>Improving our website, product selection, and customer experience through analytics.</li>
              <li>Preventing fraud, abuse, and unauthorized access through rate-limiting and IP monitoring.</li>
            </ul>
            <p>We <strong>do not</strong> sell, rent, or trade your personal information to third parties for their marketing purposes.</p>

            <h2>4. Data Sharing & Third Parties</h2>
            <p>We share your data only with trusted service providers who help us operate our business:</p>
            <ul>
              <li><strong>Supabase (nsfnhsfxqildfhqkssyo.supabase.co)</strong> — Database, authentication, and file storage. Your data is stored on Supabase&apos;s infrastructure. See <a href="https://supabase.com/privacy" className="text-accent hover:underline">Supabase Privacy Policy</a>.</li>
              <li><strong>Vercel</strong> — Website hosting and analytics (anonymized). See <a href="https://vercel.com/legal/privacy-policy" className="text-accent hover:underline">Vercel Privacy Policy</a>.</li>
              <li><strong>Resend</strong> — Transactional email delivery (password resets, receipts, notifications). See <a href="https://resend.com/legal/privacy-policy" className="text-accent hover:underline">Resend Privacy Policy</a>.</li>
              <li><strong>WhatsApp (Meta)</strong> — Customer communication and order confirmations. See <a href="https://www.whatsapp.com/legal/privacy-policy" className="text-accent hover:underline">WhatsApp Privacy Policy</a>.</li>
              <li><strong>Courier partners</strong> — Your name, phone number, and delivery address are shared with our logistics partners solely for delivery purposes.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>We take reasonable measures to protect your data:</p>
            <ul>
              <li>All traffic is encrypted via HTTPS (TLS 1.3).</li>
              <li>Passwords are hashed and managed by Supabase Auth — we never store plain-text passwords.</li>
              <li>API keys and secrets are stored as environment variables and never exposed client-side.</li>
              <li>Administrative and vendor API routes require authentication verification before accessing sensitive data.</li>
              <li>Rate-limiting is applied to sensitive endpoints (login, password reset, registration) to prevent brute-force attacks.</li>
            </ul>
            <p>However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.</p>

            <h2>6. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide our services. Order records are retained for accounting and warranty purposes for up to 6 years as required by Kenyan law. You may request deletion of your data at any time (see Section 8).</p>

            <h2>7. Cookies</h2>
            <p>We use a minimal set of cookies:</p>
            <ul>
              <li><strong>Essential/authentication cookies</strong> — Set by Supabase Auth to maintain your logged-in session. These are strictly necessary for the website to function.</li>
              <li><strong>Analytics cookies</strong> — Vercel Analytics uses cookies to count page visits and track navigation paths. No personal data is collected. You can opt out via your browser settings.</li>
            </ul>
            <p>We do not use advertising, tracking, or third-party marketing cookies. You can control or delete cookies through your browser settings at any time.</p>

            <h2>8. Your Rights (Under Kenyan Data Protection Law)</h2>
            <p>Under the Kenya Data Protection Act, 2019, you have the following rights:</p>
            <ul>
              <li><strong>Right to access</strong> — Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification</strong> — Correct any inaccurate or incomplete data.</li>
              <li><strong>Right to deletion</strong> — Request that we delete your personal data (subject to legal retention requirements).</li>
              <li><strong>Right to restrict processing</strong> — Limit how we use your data.</li>
              <li><strong>Right to data portability</strong> — Receive your data in a structured, machine-readable format.</li>
              <li><strong>Right to object</strong> — Object to the processing of your data for direct marketing.</li>
            </ul>
            <p>To exercise any of these rights, contact us via <a href="https://wa.me/254757512769" className="text-accent hover:underline">WhatsApp</a> or email hello@trivokenya.store. We will respond within 30 days as required by law.</p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.</p>

            <h2>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Material changes will be communicated via email or website notice. We encourage you to review this policy periodically.</p>

            <h2>11. Contact</h2>
            <p>If you have any questions, concerns, or requests regarding this policy or your data:</p>
            <ul>
              <li><strong>WhatsApp:</strong> <a href="https://wa.me/254757512769" className="text-accent hover:underline">+254 757 512 769</a></li>
              <li><strong>Email:</strong> hello@trivokenya.store</li>
              <li><strong>Website:</strong> trivokenya.store</li>
              <li><strong>Location:</strong> Nairobi, Kenya</li>
            </ul>
            <p>You also have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) of Kenya.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
