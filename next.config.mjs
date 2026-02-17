// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: { tsconfigPaths: true },

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

      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },

      // ✅ add this for your image
      { protocol: "https", hostname: "thumbs.dreamstime.com" },
    ],
  },
};


export default nextConfig;
