import { Hono } from "hono";
import { db } from "../db/index.js";
import { projects, reports } from "../db/schema.js";
import { eq, count } from "drizzle-orm";
import { getPaginationParams } from "../helpers/pagination.js";
import { getUserOrNull, getProjectMembership } from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";

const reportRoutes = new Hono<{ Variables: AuthType }>();

// GET /:id
reportRoutes.get("/:id", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id")!;

  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if user is a member of this project
  const isMember = await getProjectMembership(projectId, currentUser.uuid);
  if (!isMember) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(c);

  // Fetch reports for this project
  const reportsList = await db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .limit(limit)
    .offset(offset);

  // Get total count of reports for this project
  const [{ count: totalReports }] = await db
    .select({ count: count(reports.id) })
    .from(reports)
    .where(eq(reports.projectId, projectId));

  // Fetch project info
  const [project] = await db
    .select({ url: projects.url, name: projects.name })
    .from(projects)
    .where(eq(projects.uuid, projectId));

  if (!project) {
    return c.json(
      { error: "Project not found", data: null, message: "Project not found" },
      404
    );
  }

  const reportsWithTotal = reportsList.map((report) => ({
    ...report,
  }));

  const total = Number(totalReports || 0);

  return c.json({
    success: true,
    data: {
      reports: reportsWithTotal,
      totalReports: Number(totalReports || 0),
      url: project.url,
      name: project.name,
    },
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
