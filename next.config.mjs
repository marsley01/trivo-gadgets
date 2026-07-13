/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nsfnhsfxqildfhqkssyo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/admin/**": ["./node_modules/@img/sharp-libvips-linux-x64/**/*"],
    "/vendor/**": ["./node_modules/@img/sharp-libvips-linux-x64/**/*"],
  },
};

export default nextConfig;
