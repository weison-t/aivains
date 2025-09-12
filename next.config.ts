import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wallet",
        destination: "/policies",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
