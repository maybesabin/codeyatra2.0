import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/login', destination: '/Login' }];
  },
};

export default nextConfig;
