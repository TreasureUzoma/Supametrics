import { Hono } from "hono";
import { eq, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { reports } from "../db/schema.js";
import { getUserOrNull } from "../helpers/projects.js";
import { getProjectMembership } from "../helpers/projects.js";
import { getPaginationParams } from "../helpers/pagination.js";
import type { AuthType } from "../lib/auth.js";

export const reportRoutes = new Hono<{ Variables: AuthType }>();

reportRoutes.get("/:id/reports", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");

  // validate project ID
  if (!projectId) {
    return c.json({ error: "Project ID is required" }, 400);
  }

  // Validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // check project membership
  const membership = await getProjectMembership(projectId, currentUser.uuid);
  if (!membership) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(c);

  // Fetch reports
  const reportsList = await db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .limit(limit)
    .offset(offset);

  // Count total
  const totalRes = await db
    .select({ count: count(reports.id) })
    .from(reports)
    .where(eq(reports.projectId, projectId));

  const total = Number(totalRes[0]?.count || 0);

  // Send response
  return c.json({
    success: true,
    reports: reportsList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});
