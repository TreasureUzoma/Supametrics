import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  projectApiKeys,
  projectMembers,
  projects,
  teams,
} from "../db/schema.js";
import { user } from "../db/auth-schema.js";
import { eq, and, isNull } from "drizzle-orm";
import type { AuthType } from "../lib/auth.js";
import { getWeeklyProjectAggregate } from "../helpers/project-analytics.js";

const overviewRoute = new Hono<{ Variables: AuthType }>();

overviewRoute.get("/", async (c) => {
    
    const currentUser = await getUserOrNull(c);

  // Validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({
        message: "Hello from overview"
    })
})
export default overviewRoute;