import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, ShieldAlert, Smartphone, Laptop, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

const siteName = "Trivo Kenya";
export const revalidate = 60;

interface CategorySeoData {
  seoTitle: string;
  seoDesc: string;
  keywords: string[];
  h1Title: string;
  heroDesc: string;
  icon: typeof Smartphone;
  glowColor: string;
  faqs: { question: string; answer: string }[];
  filterBy?: "category" | "brand";
  filterValue?: string;
  minPrice?: number;
  maxPrice?: number;
}

const CATEGORY_MAP: Record<string, CategorySeoData> = {
  "phones": {
    seoTitle: "Phones in Kenya — Best Prices & Deals | Trivo Kenya",
    seoDesc: "Shop genuine phones in Kenya at Trivo Kenya. iPhones, Samsung, Tecno, Xiaomi, Redmi, and more. Competitive prices, free Nairobi delivery, pay on delivery.",
    keywords: ["phones in Kenya", "buy phones Kenya", "smartphones Kenya", "phone prices Kenya", "cheap phones Kenya"],
    h1Title: "Phones in Kenya",
    heroDesc: "Browse our full range of genuine smartphones in Kenya. From budget-friendly Tecno and Redmi to premium iPhones and Samsung — all with clear pricing, warranty, and fast delivery.",
    icon: Smartphone,
    glowColor: "bg-blue-500/10",
    filterBy: "category",
    filterValue: "Phones",
    faqs: [
      {
        question: "Do you sell genuine phones in Kenya?",
        answer: "Yes, every phone sold at Trivo Kenya is 100% genuine and covered by warranty. We source directly from authorized suppliers."
      },
      {
        question: "Can I pay on delivery for phones?",
        answer: "Absolutely. We offer M-PESA and cash payment on delivery for all orders within Nairobi and most upcountry locations."
      },
      {
        question: "How long does delivery take?",
        answer: "Free hand-delivery in Nairobi takes 1 to 2 days. Upcountry delivery via courier takes 2 to 3 days."
      }
    ]
  },
  "iphones": {
    seoTitle: "iPhones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine iPhones in Kenya at Trivo Kenya. iPhone 15, iPhone 16, and more. Competitive prices, free Nairobi delivery, pay on delivery.",
    keywords: ["iPhones Kenya", "iPhone price Kenya", "buy iPhone Kenya", "latest iPhone Kenya", "cheap iPhone Kenya"],
    h1Title: "Apple iPhones in Kenya",
    heroDesc: "Explore our range of genuine Apple iPhones in Kenya. From the latest iPhone 16 series to great-value older models. All devices are tested and come with warranty.",
    icon: Smartphone,
    glowColor: "bg-gray-500/10",
    filterBy: "brand",
    filterValue: "Apple",
    faqs: [
      {
        question: "Are your iPhones genuine?",
        answer: "Yes, all iPhones sold at Trivo Kenya are 100% original. We verify each device before listing and provide warranty coverage."
      },
      {
        question: "Do you sell new or refurbished iPhones?",
        answer: "We stock both brand new and carefully refurbished iPhones. Each product page clearly states the condition so you know exactly what you are getting."
      },
      {
        question: "What is the price of iPhone in Kenya?",
        answer: "iPhone prices in Kenya vary by model and condition. Browse our iPhone category for current prices, or message us on WhatsApp for the latest deals."
      }
    ]
  },
  "samsung": {
    seoTitle: "Samsung Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Samsung phones in Kenya at Trivo Kenya. Galaxy S series, A series, and more. Competitive prices, free Nairobi delivery.",
    keywords: ["Samsung phones Kenya", "Samsung phone prices Kenya", "buy Samsung Kenya", "Galaxy phones Kenya"],
    h1Title: "Samsung Phones in Kenya",
    heroDesc: "Shop genuine Samsung smartphones in Kenya. Galaxy S, A, and Z series available at competitive prices with warranty and fast delivery.",
    icon: Smartphone,
    glowColor: "bg-blue-500/10",
    filterBy: "brand",
    filterValue: "Samsung",
    faqs: [
      {
        question: "Do you sell genuine Samsung phones?",
        answer: "Yes, all Samsung phones at Trivo Kenya are 100% genuine and covered by warranty. We stock Galaxy S, A, and Z series."
      },
      {
        question: "What Samsung models do you have?",
        answer: "We stock popular Samsung Galaxy models available in Kenya. Check our Samsung category for the latest arrivals and current prices."
      }
    ]
  },
  "tecno": {
    seoTitle: "Tecno Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Tecno phones in Kenya at Trivo Kenya. Spark, Camon, and Phantom series. Great-value smartphones with warranty.",
    keywords: ["Tecno phones Kenya", "Tecno Kenya", "Tecno phone prices Kenya", "buy Tecno Kenya"],
    h1Title: "Tecno Phones in Kenya",
    heroDesc: "Explore our range of genuine Tecno smartphones in Kenya. Spark, Camon, and Phantom series — great-value phones for everyday use.",
    icon: Smartphone,
    glowColor: "bg-cyan-500/10",
    filterBy: "brand",
    filterValue: "Tecno",
    faqs: [
      {
        question: "Are Tecno phones genuine?",
        answer: "Yes, all Tecno phones sold at Trivo Kenya are 100% genuine and covered by warranty."
      },
      {
        question: "Which Tecno models do you stock?",
        answer: "We stock popular Tecno Spark, Camon, and Phantom series models. Check our Tecno category for current availability and prices."
      }
    ]
  },
  "redmi": {
    seoTitle: "Redmi Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Redmi phones in Kenya at Trivo Kenya. Redmi Note series and more. Great-value Xiaomi sub-brand with warranty.",
    keywords: ["Redmi phones Kenya", "Redmi Kenya", "Redmi Note Kenya", "buy Redmi Kenya"],
    h1Title: "Redmi Phones in Kenya",
    heroDesc: "Shop genuine Redmi smartphones in Kenya. Redmi Note series and more — great-value devices from Xiaomi&apos;s popular sub-brand.",
    icon: Smartphone,
    glowColor: "bg-orange-500/10",
    filterBy: "brand",
    filterValue: "Redmi",
    faqs: [
      {
        question: "Are Redmi phones genuine?",
        answer: "Yes, all Redmi phones sold at Trivo Kenya are 100% genuine and come with warranty coverage."
      }
    ]
  },
  "xiaomi": {
    seoTitle: "Xiaomi Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Xiaomi phones in Kenya at Trivo Kenya. Redmi, Poco, and Mi series. Competitive prices, free Nairobi delivery.",
    keywords: ["Xiaomi phones Kenya", "Xiaomi Kenya", "Xiaomi phone prices Kenya", "buy Xiaomi Kenya"],
    h1Title: "Xiaomi Phones in Kenya",
    heroDesc: "Explore genuine Xiaomi smartphones in Kenya. Redmi, Poco, and Mi series — great-value devices with solid performance and warranty.",
    icon: Smartphone,
    glowColor: "bg-orange-500/10",
    filterBy: "brand",
    filterValue: "Xiaomi",
    faqs: [
      {
        question: "Are Xiaomi phones genuine?",
        answer: "Yes, all Xiaomi phones sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "google-pixel": {
    seoTitle: "Google Pixel Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Google Pixel phones in Kenya at Trivo Kenya. Pixel 9 and more. Pure Android experience with warranty.",
    keywords: ["Google Pixel Kenya", "Pixel phones Kenya", "buy Pixel Kenya"],
    h1Title: "Google Pixel Phones in Kenya",
    heroDesc: "Shop genuine Google Pixel smartphones in Kenya. Pure Android, exceptional cameras, and clean software — all with warranty.",
    icon: Smartphone,
    glowColor: "bg-green-500/10",
    filterBy: "brand",
    filterValue: "Google",
    faqs: [
      {
        question: "Are Google Pixel phones genuine?",
        answer: "Yes, all Google Pixel phones sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "infinix": {
    seoTitle: "Infinix Phones in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Infinix phones in Kenya at Trivo Kenya. Hot, Note, and Zero series. Budget-friendly smartphones with warranty.",
    keywords: ["Infinix phones Kenya", "Infinix Kenya", "buy Infinix Kenya"],
    h1Title: "Infinix Phones in Kenya",
    heroDesc: "Explore genuine Infinix smartphones in Kenya. Hot, Note, and Zero series — affordable devices for everyday use.",
    icon: Smartphone,
    glowColor: "bg-violet-500/10",
    filterBy: "brand",
    filterValue: "Infinix",
    faqs: [
      {
        question: "Are Infinix phones genuine?",
        answer: "Yes, all Infinix phones sold at Trivo Kenya are 100% genuine and come with warranty."
      }
    ]
  },
  "laptops": {
    seoTitle: "Laptops in Kenya — Best Prices & Deals | Trivo Kenya",
    seoDesc: "Shop genuine laptops in Kenya at Trivo Kenya. HP, Lenovo, Dell, MacBook, and more. Competitive prices, free Nairobi delivery, pay on delivery.",
    keywords: ["laptops in Kenya", "buy laptops Kenya", "laptops for sale Kenya", "laptop prices Kenya", "laptops Nairobi"],
    h1Title: "Laptops in Kenya",
    heroDesc: "Browse our full range of genuine laptops in Kenya. From student and business laptops to gaming machines and MacBooks — all with clear specs, honest pricing, and warranty.",
    icon: Laptop,
    glowColor: "bg-purple-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    faqs: [
      {
        question: "Do you sell genuine laptops in Kenya?",
        answer: "Yes, every laptop sold at Trivo Kenya is 100% genuine and covered by warranty. We stock HP, Lenovo, Dell, ASUS, Acer, and MacBooks."
      },
      {
        question: "Can I pay on delivery for laptops?",
        answer: "Yes. We offer M-PESA and cash payment on delivery for all orders within Nairobi and most upcountry locations."
      },
      {
        question: "Do you deliver laptops across Kenya?",
        answer: "Yes. Free hand-delivery in Nairobi (1-2 days). Upcountry delivery via courier (2-3 days) at an additional cost."
      }
    ]
  },
  "hp": {
    seoTitle: "HP Laptops in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine HP laptops in Kenya at Trivo Kenya. EliteBook, Pavilion, Spectre, and more. Competitive prices with warranty.",
    keywords: ["HP laptops Kenya", "HP Kenya", "HP laptop prices Kenya", "buy HP laptop Kenya"],
    h1Title: "HP Laptops in Kenya",
    heroDesc: "Shop genuine HP laptops in Kenya. EliteBook, Pavilion, Spectre, and more — reliable machines for work, study, and everyday use.",
    icon: Laptop,
    glowColor: "bg-blue-500/10",
    filterBy: "brand",
    filterValue: "HP",
    faqs: [
      {
        question: "Are HP laptops genuine?",
        answer: "Yes, all HP laptops sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "lenovo": {
    seoTitle: "Lenovo Laptops in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Lenovo laptops in Kenya at Trivo Kenya. ThinkPad, IdeaPad, Yoga, and more. Competitive prices with warranty.",
    keywords: ["Lenovo laptops Kenya", "Lenovo Kenya", "Lenovo laptop prices Kenya", "buy Lenovo Kenya"],
    h1Title: "Lenovo Laptops in Kenya",
    heroDesc: "Shop genuine Lenovo laptops in Kenya. ThinkPad, IdeaPad, Yoga, and more — durable machines built for productivity.",
    icon: Laptop,
    glowColor: "bg-red-500/10",
    filterBy: "brand",
    filterValue: "Lenovo",
    faqs: [
      {
        question: "Are Lenovo laptops genuine?",
        answer: "Yes, all Lenovo laptops sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "dell": {
    seoTitle: "Dell Laptops in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Dell laptops in Kenya at Trivo Kenya. XPS, Inspiron, Latitude, and more. Competitive prices with warranty.",
    keywords: ["Dell laptops Kenya", "Dell Kenya", "Dell laptop prices Kenya", "buy Dell Kenya"],
    h1Title: "Dell Laptops in Kenya",
    heroDesc: "Shop genuine Dell laptops in Kenya. XPS, Inspiron, Latitude, and more — solid performance for work and study.",
    icon: Laptop,
    glowColor: "bg-blue-500/10",
    filterBy: "brand",
    filterValue: "Dell",
    faqs: [
      {
        question: "Are Dell laptops genuine?",
        answer: "Yes, all Dell laptops sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "apple": {
    seoTitle: "MacBooks in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine MacBooks in Kenya at Trivo Kenya. MacBook Air, MacBook Pro, and more. Competitive prices, free Nairobi delivery.",
    keywords: ["MacBook Kenya", "MacBook price Kenya", "buy MacBook Kenya", "MacBook Pro Kenya", "MacBook Air Kenya"],
    h1Title: "Apple MacBooks in Kenya",
    heroDesc: "Shop genuine Apple MacBooks in Kenya. MacBook Air and MacBook Pro — powerful, reliable machines for work and creative tasks.",
    icon: Laptop,
    glowColor: "bg-gray-500/10",
    filterBy: "brand",
    filterValue: "Apple",
    faqs: [
      {
        question: "Are MacBooks genuine?",
        answer: "Yes, all MacBooks sold at Trivo Kenya are 100% genuine and covered by warranty."
      },
      {
        question: "Do you sell new or refurbished MacBooks?",
        answer: "We stock both brand new and carefully refurbished MacBooks. Each product page clearly states the condition."
      }
    ]
  },
  "asus": {
    seoTitle: "ASUS Laptops in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine ASUS laptops in Kenya at Trivo Kenya. ZenBook, VivoBook, ROG, and more. Competitive prices with warranty.",
    keywords: ["ASUS laptops Kenya", "ASUS Kenya", "ASUS laptop prices Kenya", "buy ASUS Kenya"],
    h1Title: "ASUS Laptops in Kenya",
    heroDesc: "Shop genuine ASUS laptops in Kenya. ZenBook, VivoBook, and ROG gaming laptops — great value for work and play.",
    icon: Laptop,
    glowColor: "bg-red-500/10",
    filterBy: "brand",
    filterValue: "ASUS",
    faqs: [
      {
        question: "Are ASUS laptops genuine?",
        answer: "Yes, all ASUS laptops sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "acer": {
    seoTitle: "Acer Laptops in Kenya — Prices & Deals | Trivo Kenya",
    seoDesc: "Buy genuine Acer laptops in Kenya at Trivo Kenya. Aspire, Swift, Nitro, and more. Affordable laptops with warranty.",
    keywords: ["Acer laptops Kenya", "Acer Kenya", "Acer laptop prices Kenya", "buy Acer Kenya"],
    h1Title: "Acer Laptops in Kenya",
    heroDesc: "Shop genuine Acer laptops in Kenya. Aspire, Swift, and Nitro series — reliable, affordable machines for students and professionals.",
    icon: Laptop,
    glowColor: "bg-green-500/10",
    filterBy: "brand",
    filterValue: "Acer",
    faqs: [
      {
        question: "Are Acer laptops genuine?",
        answer: "Yes, all Acer laptops sold at Trivo Kenya are 100% genuine and covered by warranty."
      }
    ]
  },
  "under-20000": {
    seoTitle: "Phones Under KSh 20,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine phones under KSh 20,000 in Kenya. Great-value smartphones from Tecno, Redmi, Xiaomi, and more. Free Nairobi delivery.",
    keywords: ["phones under 20000 Kenya", "cheap phones Kenya", "budget phones Kenya", "phones under 20k Kenya"],
    h1Title: "Phones Under KSh 20,000 in Kenya",
    heroDesc: "Great-value smartphones under KSh 20,000. Tecno, Redmi, Xiaomi, and Samsung budget models — genuine devices with warranty and fast delivery.",
    icon: Smartphone,
    glowColor: "bg-green-500/10",
    filterBy: "category",
    filterValue: "Phones",
    minPrice: 1,
    maxPrice: 20000,
    faqs: [
      {
        question: "What are the best phones under KSh 20,000 in Kenya?",
        answer: "Tecno, Redmi, and Xiaomi offer the best value under KSh 20,000. Check our phones under 20,000 category for current stock and prices."
      }
    ]
  },
  "under-30000": {
    seoTitle: "Phones Under KSh 30,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine phones under KSh 30,000 in Kenya. Solid mid-range smartphones from Samsung, Tecno, Redmi, and more.",
    keywords: ["phones under 30000 Kenya", "phones under 30k Kenya", "mid-range phones Kenya"],
    h1Title: "Phones Under KSh 30,000 in Kenya",
    heroDesc: "Solid mid-range smartphones under KSh 30,000. Samsung, Tecno, Redmi, and Xiaomi models that balance performance and price.",
    icon: Smartphone,
    glowColor: "bg-blue-500/10",
    filterBy: "category",
    filterValue: "Phones",
    minPrice: 1,
    maxPrice: 30000,
    faqs: [
      {
        question: "What phones can I get under KSh 30,000?",
        answer: "Under KSh 30,000 you can find reliable Samsung, Tecno, Redmi, and Xiaomi phones with good cameras, decent battery life, and smooth performance."
      }
    ]
  },
  "under-50000": {
    seoTitle: "Phones Under KSh 50,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine phones under KSh 50,000 in Kenya. Upper mid-range and flagship-killer smartphones with premium features.",
    keywords: ["phones under 50000 Kenya", "phones under 50k Kenya", "flagship killer phones Kenya"],
    h1Title: "Phones Under KSh 50,000 in Kenya",
    heroDesc: "Upper mid-range and flagship-killer smartphones under KSh 50,000. Great cameras, fast processors, and modern features at sensible prices.",
    icon: Smartphone,
    glowColor: "bg-purple-500/10",
    filterBy: "category",
    filterValue: "Phones",
    minPrice: 1,
    maxPrice: 50000,
    faqs: [
      {
        question: "What is the best phone under KSh 50,000?",
        answer: "Under KSh 50,000 you can find excellent Samsung, Redmi, and Tecno phones with flagship features. Browse our selection for current stock."
      }
    ]
  },
  "under-100000": {
    seoTitle: "Phones Under KSh 100,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine phones under KSh 100,000 in Kenya. Premium smartphones from Apple, Samsung, and more at great prices.",
    keywords: ["phones under 100000 Kenya", "phones under 100k Kenya", "premium phones Kenya"],
    h1Title: "Phones Under KSh 100,000 in Kenya",
    heroDesc: "Premium smartphones under KSh 100,000. iPhones, Samsung Galaxy S series, and other flagship devices at competitive prices.",
    icon: Smartphone,
    glowColor: "bg-accent/10",
    filterBy: "category",
    filterValue: "Phones",
    minPrice: 1,
    maxPrice: 100000,
    faqs: [
      {
        question: "Can I get an iPhone under KSh 100,000?",
        answer: "Yes, older iPhone models and some current-generation options are available under KSh 100,000. Check our iPhone category for current prices."
      }
    ]
  },
  "laptops-under-50000": {
    seoTitle: "Laptops Under KSh 50,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine laptops under KSh 50,000 in Kenya. Student and office laptops from HP, Lenovo, Dell, and more.",
    keywords: ["laptops under 50000 Kenya", "cheap laptops Kenya", "budget laptops Kenya", "student laptops Kenya"],
    h1Title: "Laptops Under KSh 50,000 in Kenya",
    heroDesc: "Affordable genuine laptops under KSh 50,000. Perfect for students, office work, and everyday browsing. HP, Lenovo, Dell, and more.",
    icon: Laptop,
    glowColor: "bg-green-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    minPrice: 1,
    maxPrice: 50000,
    faqs: [
      {
        question: "What is the best laptop under KSh 50,000 for students?",
        answer: "HP and Lenovo offer great value under KSh 50,000. Look for at least 8GB RAM and 256GB SSD for smooth student use."
      }
    ]
  },
  "laptops-under-75000": {
    seoTitle: "Laptops Under KSh 75,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine laptops under KSh 75,000 in Kenya. Solid mid-range laptops for work, study, and light creative tasks.",
    keywords: ["laptops under 75000 Kenya", "mid-range laptops Kenya"],
    h1Title: "Laptops Under KSh 75,000 in Kenya",
    heroDesc: "Solid mid-range laptops under KSh 75,000. More RAM, faster storage, and better displays — suitable for office work, programming, and media consumption.",
    icon: Laptop,
    glowColor: "bg-blue-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    minPrice: 1,
    maxPrice: 75000,
    faqs: [
      {
        question: "What specs should I look for under KSh 75,000?",
        answer: "Aim for 8GB-16GB RAM, 512GB SSD, and at least a 10th-gen Intel or Ryzen 5 processor for the best experience under KSh 75,000."
      }
    ]
  },
  "laptops-under-100000": {
    seoTitle: "Laptops Under KSh 100,000 in Kenya | Trivo Kenya",
    seoDesc: "Shop genuine laptops under KSh 100,000 in Kenya. High-performance laptops for professionals, creators, and gamers.",
    keywords: ["laptops under 100000 Kenya", "laptops under 100k Kenya", "performance laptops Kenya"],
    h1Title: "Laptops Under KSh 100,000 in Kenya",
    heroDesc: "High-performance laptops under KSh 100,000. Powerful processors, ample RAM, and fast storage — ideal for professionals, creators, and gamers.",
    icon: Laptop,
    glowColor: "bg-purple-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    minPrice: 1,
    maxPrice: 100000,
    faqs: [
      {
        question: "Can I get a gaming laptop under KSh 100,000?",
        answer: "Yes, ASUS, Acer, and HP offer gaming-capable laptops under KSh 100,000 with dedicated graphics. Browse our gaming laptops category for current stock."
      }
    ]
  },
  "gaming-laptops": {
    seoTitle: "Gaming Laptops in Kenya — Best Prices | Trivo Kenya",
    seoDesc: "Shop genuine gaming laptops in Kenya at Trivo Kenya. ASUS ROG, Acer Nitro, HP Pavilion Gaming, and more.",
    keywords: ["gaming laptops Kenya", "gaming laptops Nairobi", "best gaming laptops Kenya"],
    h1Title: "Gaming Laptops in Kenya",
    heroDesc: "Genuine gaming laptops in Kenya. ASUS ROG, Acer Nitro, HP Pavilion Gaming — dedicated graphics, high refresh-rate displays, and smooth gameplay.",
    icon: Laptop,
    glowColor: "bg-red-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    faqs: [
      {
        question: "Do you sell genuine gaming laptops?",
        answer: "Yes, all gaming laptops sold at Trivo Kenya are 100% genuine and covered by warranty. We stock ASUS ROG, Acer Nitro, and HP Pavilion Gaming models."
      }
    ]
  },
  "student-laptops": {
    seoTitle: "Student Laptops in Kenya — Best Prices | Trivo Kenya",
    seoDesc: "Shop genuine student laptops in Kenya at Trivo Kenya. Affordable, reliable laptops for research, assignments, and online classes.",
    keywords: ["student laptops Kenya", "laptops for students Kenya", "best student laptops Kenya"],
    h1Title: "Student Laptops in Kenya",
    heroDesc: "Affordable, genuine laptops for students in Kenya. Lightweight, long-battery-life machines perfect for research, assignments, and online classes.",
    icon: Laptop,
    glowColor: "bg-cyan-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    faqs: [
      {
        question: "What is the best laptop for a student in Kenya?",
        answer: "For most students, we recommend at least 8GB RAM, 256GB SSD, and a lightweight build. HP, Lenovo, and Dell offer great student laptops in Kenya."
      }
    ]
  },
  "business-laptops": {
    seoTitle: "Business Laptops in Kenya — Best Prices | Trivo Kenya",
    seoDesc: "Shop genuine business laptops in Kenya at Trivo Kenya. Reliable, secure laptops for professionals, entrepreneurs, and office work.",
    keywords: ["business laptops Kenya", "office laptops Kenya", "work laptops Kenya"],
    h1Title: "Business Laptops in Kenya",
    heroDesc: "Reliable, genuine business laptops in Kenya. Durable build, strong security, and all-day battery life for professionals, entrepreneurs, and office work.",
    icon: Laptop,
    glowColor: "bg-slate-500/10",
    filterBy: "category",
    filterValue: "Laptops",
    faqs: [
      {
        question: "What laptop is best for business use in Kenya?",
        answer: "For business use, look for a laptop with at least 16GB RAM, 512GB SSD, and a durable build. ThinkPad, EliteBook, and Latitude series are excellent choices."
      }
    ]
  },
};

function getCategoryData(slug: string): CategorySeoData {
  const normalized = slug.toLowerCase();
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  return {
    seoTitle: `${categoryName} in Kenya - Buy Online | Trivo Kenya`,
    seoDesc: `Shop genuine ${categoryName} in Kenya at Trivo Kenya. Best prices, free Nairobi delivery, and secure pay on delivery.`,
    keywords: [`${categoryName.toLowerCase()} kenya`, `buy ${categoryName.toLowerCase()} nairobi`],
    h1Title: `${categoryName} in Kenya`,
    heroDesc: `Explore our collection of authentic ${categoryName}. Free hand-delivery in Nairobi within 1 to 2 days with M-Pesa payment on delivery.`,
    icon: Smartphone,
    glowColor: "bg-accent/10",
    filterBy: "category",
    filterValue: categoryName,
    faqs: [
      {
        question: `How can I order ${categoryName} in Kenya?`,
        answer: "Simply choose your items on Trivo Kenya and check out via WhatsApp for quick delivery confirmation and M-Pesa on delivery."
      }
    ]
  };
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const data = getCategoryData(category);
  const canonicalUrl = `https://trivokenya.store/categories/${category}`;

  return {
    title: data.seoTitle,
    description: data.seoDesc,
    keywords: data.keywords.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.seoTitle,
      description: data.seoDesc,
      url: canonicalUrl,
      siteName,
      locale: "en_KE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.seoTitle,
      description: data.seoDesc,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const supabase = await createClient();
  const data = getCategoryData(category);
  const Icon = data.icon;

  let query = supabase.from("products").select("*");

  if (data.filterBy === "brand" && data.filterValue) {
    query = query.ilike("brand", data.filterValue);
  } else if (data.filterBy === "category" && data.filterValue) {
    query = query.eq("category", data.filterValue);
  }

  const { data: products } = await query.order("created_at", { ascending: false });

  if (!products) {
    return notFound();
  }

  const categoryBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://trivokenya.store" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "https://trivokenya.store/products" },
      { "@type": "ListItem", position: 3, name: data.h1Title },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.h1Title} | Trivo Kenya`,
    description: data.seoDesc,
    url: `https://trivokenya.store/categories/${category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://trivokenya.store/products/${p.slug}`,
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      {data.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative pb-24">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] rounded-full blur-[160px] pointer-events-none ${data.glowColor}`} />

        <div className="container mx-auto px-4 md:px-8 pt-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-8 flex-wrap">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-accent transition-colors">Categories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{data.h1Title}</span>
          </nav>

          <div className="p-8 md:p-12 rounded-3xl bg-card border border-subtle backdrop-blur-xl mb-16 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    {data.filterBy === "brand" ? `${data.filterValue} in Kenya` : "Collection in Kenya"}
                  </span>
                </div>
                <h1 id="category-page-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {data.h1Title}
                </h1>
                <p className="text-subtle text-base md:text-lg leading-relaxed">
                  {data.heroDesc}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1 shrink-0 p-4 rounded-2xl bg-surface/50 border border-default">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available Items</span>
                <span className="text-3xl font-extrabold text-foreground">{products.length}</span>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-card/30 border border-dashed border-default">
              <ShieldAlert className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                We&apos;re currently restocking this category. Check back soon for new arrivals, or message us on WhatsApp if you&apos;re looking for a specific model!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-20">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {data.faqs.length > 0 && (
            <section className="mt-16 p-8 md:p-12 rounded-3xl bg-card/50 border border-subtle backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">
                  Frequently Asked Questions about {data.h1Title}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {data.faqs.map((faq, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-surface/40 border border-default/50 space-y-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
