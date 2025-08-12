import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { withAuth } from "./middleware/session.js";
import { rateLimiter } from "./middleware/rate-limiter.js";

import authRoutes from "./handlers/auth.js";
import overviewRoute from "./handlers/overview.js";

import projectRoutes from "./handlers/projects.js";
import analyticsRoutes from "./handlers/analytics.js";
import reportRoutes from "./handlers/reports.js";
import teamRoutes from "./handlers/teams.js";

const app = new Hono();

app.onError((err, c) => {
  console.error("Unhandled error:", err);

  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: "Not Found - Visit supametrics.com" }, 404);
});

app.get("/", (c) => {
  return c.text("Hello Nerd! Visit supametrics.com, powered by Hono!");
});

const v1 = new Hono().basePath("/api/v1");

// health endpoint — 5 requests per minute
v1.get("/health", rateLimiter(60 * 1000, 5), (c) => {
  return c.json({
    message: "Server is healthy!",
  });
});

// auth routes (no rate limiting for now)
v1.route("/auth", authRoutes);

v1.route("/overview", overviewRoute.use(rateLimiter(60 * 60 * 1000, 100)));


// everything else requires authentication
v1.use("*", withAuth);

// projects routes — 100 requests per hour
v1.route("/projects", projectRoutes.use(rateLimiter(60 * 60 * 1000, 100)));

// analytics routes — 50 requests per hour
v1.route("/analytics", analyticsRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

// reports routes — 50 requests per hour
v1.route("/reports", reportRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

// teams routes — 50 requests per hour
v1.route("/teams", teamRoutes.use(rateLimiter(60 * 60 * 1000, 50)));

app.route("/", v1);

serve(
  {
    fetch: app.fetch,
    port: 3004,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
