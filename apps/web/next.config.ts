import type { NextConfig } from "next";

const DOCS_SITE = process.env.DOCS_SITE || "https://supametricsdocs.vercel.app";
const DASHBOARD_SITE = process.env.DASHBOARD_SITE || "http://localhost:3002";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const dashboardRoutes = [
      "login",
      "signup",
      "forgot-password",
      "reset-password",
      "verify-email",
      "dashboard",
      "new",
      "new/:path+",
      "project",
      "project/:path+",
      "settings",
      "ai",
      "activity",
    ];

    const staticRoutes = [
      {
        source: "/docs",
        destination: `${DOCS_SITE}`,
      },
      {
        source: "/docs/:path+",
        destination: `${DOCS_SITE}/docs/:path+`,
      },
      {
        source: "/docs-static/:path+",
        destination: `${DOCS_SITE}/docs-static/:path+`,
      },
      {
        source: "/dashboard-static/:path+",
        destination: `${DASHBOARD_SITE}/dashboard-static/:path+`,
      },
    ];

    const rewrites = [
      ...dashboardRoutes.map((route) => ({
        source: `/${route}`,
        destination: `${DASHBOARD_SITE}/${route}`,
      })),
      ...staticRoutes,
    ];

    // 🔍 Debug logs
    console.log("🔄 Rewrites being applied:");
    console.log(DASHBOARD_SITE);
    rewrites.forEach((r) => {
      console.log(`   ${r.source} -> ${r.destination}`);
    });

    return rewrites;
  },
};

export default nextConfig;
