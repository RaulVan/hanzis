import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Cloudflare/Vercel/Netlify deployment
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
