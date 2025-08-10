import { serve } from "@hono/node-server";
import { Hono } from "hono";

import type { AuthType } from "./lib/auth";

import { withAuth } from "./middleware/session";
import { rateLimiter } from "./middleware/rate-limiter";


import authRoutes from "./handlers/auth";
import projectRoutes from "./handlers/projects";
import teamRoutes from "./handlers/teams";

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

const v1 = new Hono<{ Variables: AuthType }>().basePath("/api/v1");

// health endpoint — 5 requests per minute
v1.get("/health", rateLimiter(60 * 1000, 5), (c) => {
  return c.json({
    message: "Server is healthy!",
  });
});

// auth routes (no rate limiting for now)
v1.route("/auth", authRoutes);

// everything else requires authentication
v1.use("*", withAuth);

// projects routes — 100 requests per hour
v1.route("/projects", projectRoutes.use(rateLimiter(60 * 60 * 1000, 100)));

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
