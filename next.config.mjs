// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { tsconfigPaths: true },

  // keep the @ alias
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": __dirname,
    };
    console.log("✅ Webpack alias set for @ ->", config.resolve.alias["@"]);
    return config;
  },

  images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "source.unsplash.com" },

    // ✅ Google image hosts (both can appear)
    { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ] ,
  },
}; 

export default nextConfig;
