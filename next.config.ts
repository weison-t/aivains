import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        'pdfjs-dist/legacy/build/pdf.js': 'pdfjs-dist/legacy/build/pdf',
      },
    },
  },
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
