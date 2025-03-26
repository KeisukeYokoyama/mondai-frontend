import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['pbs.twimg.com'], // Twitterの画像ドメインを許可
  },
};

export default nextConfig;
