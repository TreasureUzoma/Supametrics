import { Hono } from "hono";
import { db } from "../db/index.js";
import { reports } from "../db/schema.js";
import { eq, count } from "drizzle-orm";
import { getPaginationParams } from "../helpers/pagination.js";
import { getUserOrNull, getProjectMembership } from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";

const reportRoutes = new Hono<{ Variables: AuthType }>();

// GET /:id/reports
reportRoutes.get("/:id/reports", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id")!;

  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if user is a member of this project
  if (!(await getProjectMembership(projectId, currentUser.uuid))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Get pagination params from helper
  const { page, limit, offset } = getPaginationParams(c);

  // Fetch reports for this project
  const reportsList = await db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count: totalCount }] = await db
    .select({ count: count(reports.id) })
    .from(reports)
    .where(eq(reports.projectId, projectId));

  const total = Number(totalCount || 0);

  return c.json({
    success: true,
    data: { reports: reportsList },
    message: "Fetched Reports successfully",
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export default reportRoutes;
