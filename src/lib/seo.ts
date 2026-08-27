export type SEOScore = {
  total: number;
  max: number;
  percentage: number;
  grade: "poor" | "average" | "good" | "excellent";
  checks: SEOCheck[];
};

type SEOCheck = {
  label: string;
  pass: boolean;
  score: number;
  max: number;
  hint: string;
};

export function analyzeProductSEO(product: {
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  focus_keyword?: string | null;
  price: number;
}): SEOScore {
  const checks: SEOCheck[] = [];

  const title = product.seo_title || product.name;
  const desc = product.seo_description || product.description || "";
  const keyword = (product.focus_keyword || "").toLowerCase();
  // 1. SEO Title length
  const titleLen = title.length;
  checks.push({
    label: "SEO title length",
    pass: titleLen >= 30 && titleLen <= 60,
    score: titleLen >= 30 && titleLen <= 60 ? 10 : titleLen > 0 ? 5 : 0,
    max: 10,
    hint: titleLen < 30
      ? `Title is too short (${titleLen}/30 chars)`
      : titleLen > 60
        ? `Title is too long (${titleLen}/60 chars)`
        : "Good length",
  });

  // 2. SEO Description length
  const descLen = desc.length;
  checks.push({
    label: "Meta description length",
    pass: descLen >= 120 && descLen <= 160,
    score: descLen >= 120 && descLen <= 160 ? 15 : descLen > 50 ? 10 : descLen > 0 ? 5 : 0,
    max: 15,
    hint: descLen < 120
      ? `Description is too short (${descLen}/120 chars)`
      : descLen > 160
        ? `Description is too long (${descLen}/160 chars)`
        : "Good length",
  });

  // 3. Keyword in title
  const kwInTitle = keyword && title.toLowerCase().includes(keyword);
  checks.push({
    label: "Keyword in SEO title",
    pass: !!kwInTitle,
    score: kwInTitle ? 15 : 0,
    max: 15,
    hint: kwInTitle ? "Keyword found in title" : "Add your focus keyword to the SEO title",
  });

  // 4. Keyword in description
  const kwInDesc = keyword && desc.toLowerCase().includes(keyword);
  checks.push({
    label: "Keyword in meta description",
    pass: !!kwInDesc,
    score: kwInDesc ? 10 : 0,
    max: 10,
    hint: kwInDesc ? "Keyword found in description" : "Add your focus keyword to the meta description",
  });

  // 5. Keyword in product name
  const kwInName = keyword && product.name.toLowerCase().includes(keyword);
  checks.push({
    label: "Keyword in product name",
    pass: !!kwInName,
    score: kwInName ? 10 : 0,
    max: 10,
    hint: kwInName ? "Keyword found in product name" : "Consider adding the keyword to the product name",
  });

  // 6. Image alt text (has image)
  checks.push({
    label: "Product image",
    pass: !!product.image_url,
    score: product.image_url ? 10 : 0,
    max: 10,
    hint: product.image_url ? "Image set" : "Add a product image for better engagement",
  });

  // 7. Description exists and is meaningful
  const descQuality = product.description ? product.description.length : 0;
  checks.push({
    label: "Product description quality",
    pass: descQuality >= 80,
    score: descQuality >= 80 ? 15 : descQuality >= 40 ? 10 : descQuality > 0 ? 5 : 0,
    max: 15,
    hint: descQuality < 80
      ? `Description is too short (${descQuality}/80 chars). Add more detail.`
      : "Good description length",
  });

  // 8. Category is set
  checks.push({
    label: "Category assigned",
    pass: !!product.category,
    score: product.category ? 5 : 0,
    max: 5,
    hint: product.category ? `Category: ${product.category}` : "Assign a category for better structure",
  });

  // 9. Price is set (positive)
  checks.push({
    label: "Price set",
    pass: product.price > 0,
    score: product.price > 0 ? 5 : 0,
    max: 5,
    hint: product.price > 0 ? `KES ${product.price.toLocaleString()}` : "Set a price",
  });

  // 10. Custom SEO title differs from product name (bonus)
  const hasCustomTitle = !!product.seo_title && product.seo_title !== product.name;
  checks.push({
    label: "Custom SEO title",
    pass: hasCustomTitle,
    score: hasCustomTitle ? 5 : 0,
    max: 5,
    hint: hasCustomTitle
      ? "Custom SEO title differs from product name (good for ranking)"
      : "Consider writing a distinct SEO title",
  });

  const total = checks.reduce((sum, c) => sum + c.score, 0);
  const max = checks.reduce((sum, c) => sum + c.max, 0);
  const percentage = Math.round((total / max) * 100);

  let grade: SEOScore["grade"] = "poor";
  if (percentage >= 90) grade = "excellent";
  else if (percentage >= 70) grade = "good";
  else if (percentage >= 45) grade = "average";

  return { total, max, percentage, grade, checks };
}

export function getGradeColor(grade: SEOScore["grade"]) {
  switch (grade) {
    case "excellent": return "text-green-500";
    case "good": return "text-blue-500";
    case "average": return "text-amber-500";
    case "poor": return "text-red-500";
  }
}

export function getGradeBg(grade: SEOScore["grade"]) {
  switch (grade) {
    case "excellent": return "bg-green-500/10 border-green-500/20";
    case "good": return "bg-blue-500/10 border-blue-500/20";
    case "average": return "bg-amber-500/10 border-amber-500/20";
    case "poor": return "bg-red-500/10 border-red-500/20";
  }
}
