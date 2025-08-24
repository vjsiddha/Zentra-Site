/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // keep any others you already use (e.g., builder.io)
    ],
  },
};
module.exports = nextConfig;
