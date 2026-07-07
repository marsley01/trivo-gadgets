import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/vendor", "/account", "/auth", "/api"],
    },
    sitemap: "https://trivokenya.store/sitemap.xml",
  };
}
