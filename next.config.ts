import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'pbs.twimg.com',  // Twitterの画像ドメインを許可
      'jqfxwjhffbyketlrygiw.supabase.co'  // Supabaseのドメインを追加
    ],
  },
};

export default nextConfig;
