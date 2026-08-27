import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private app pages
          "/admin",
          "/vendor",
          "/account",
          "/auth",
          "/api",
          "/wishlist",
          "/checkout",
          "/receipt",
          // WordPress remnants — in case middleware doesn't catch them first
          "/wp-admin",
          "/wp-login.php",
          "/wp-content",
          "/wp-includes",
          "/wp-json",
          "/xmlrpc.php",
          "/feed",
          "/comments/feed",
          // WordPress query param pages
          "/*?p=",
          "/*?page_id=",
          // Search result pages (infinite URL space)
          "/search",
        ],
      },
      // Allow Googlebot to access everything not explicitly disallowed
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/vendor",
          "/account",
          "/auth",
          "/api",
          "/checkout",
          "/receipt",
        ],
      },
    ],
    sitemap: "https://trivokenya.store/sitemap.xml",
    host: "https://trivokenya.store",
  };
}
