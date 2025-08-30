import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "/dashboard-static",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/*",
      },
    ],
  },
};

export default nextConfig;
