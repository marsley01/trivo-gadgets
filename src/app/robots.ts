import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/vendor",
          "/account",
          "/auth",
          "/api",
          "/wishlist",
          "/checkout",
          "/receipt",
          "/wp-admin",
          "/wp-login.php",
          "/wp-content",
          "/wp-includes",
          "/wp-json",
          "/xmlrpc.php",
          "/feed",
          "/comments/feed",
          "/*?p=",
          "/*?page_id=",
          "/search",
        ],
      },
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
