import { Hono } from "hono";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { getPaginationParams } from "../lib/utils";
import { getUserOrThrow, getProjectMembership } from "../lib/project-helpers";

const reportRoutes = new Hono();

// get reports
reportRoutes.get("/:id/reports", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");

  if (!(await getProjectMembership(projectId, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  const { page, limit, offset } = getPaginationParams(c);

  const reports = await db
    .select()
    .from(db.schema.reports)
    .where(eq(db.schema.reports.projectId, projectId))
    .limit(limit)
    .offset(offset);

  const totalRes = await db
    .select({ count: db.fn.count() })
    .from(db.schema.reports)
    .where(eq(db.schema.reports.projectId, projectId));

  const total = Number(totalRes[0]?.count || 0);

  return c.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export default reportRoutes;
