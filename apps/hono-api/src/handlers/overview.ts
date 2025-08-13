import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  projectMembers,
  projects,
  reports,
  analyticsEvents as analytics,
} from "../db/schema.js";
import { eq, or, inArray, count, countDistinct } from "drizzle-orm";
import type { AuthType } from "../lib/auth.js";
import { getUserOrNull } from "../helpers/projects.js";
import { getWeeklyProjectAggregate } from "../helpers/project-analytics.js";

const overviewRoute = new Hono<{ Variables: AuthType }>();

overviewRoute.get("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  if (!currentUser?.uuid) return c.json({ error: "Unauthorized" }, 401);

  const teamIdParam = c.req.query("teamId");
  const personal = c.req.query("personal") === "true";

  let condition;
  if (personal) {
    condition = or(
      eq(projects.userId, currentUser.uuid),
      eq(projectMembers.userId, currentUser.uuid)
    );
  } else if (teamIdParam) {
    condition = eq(projects.teamId, teamIdParam);
  } else {
    condition = or(
      eq(projects.userId, currentUser.uuid),
      eq(projectMembers.userId, currentUser.uuid)
    );
  }

  const userProjects = await db
    .select({ uuid: projects.uuid })
    .from(projects)
    .leftJoin(projectMembers, eq(projectMembers.projectId, projects.uuid))
    .where(condition);

  const projectIds = userProjects.map((p) => p.uuid);

  if (projectIds.length === 0) {
    return c.json({
      totalProjects: 0,
      totalReports: 0,
      totalVisitors: 0,
      totalVisitorsThisWeek: { count: 0, change: "+0%" },
    });
  }

  const [{ count: reportsCountRaw }] = await db
    .select({ count: count(reports.id) })
    .from(reports)
    .where(inArray(reports.projectId, projectIds));

  const [{ count: visitorsCountRaw }] = await db
    .select({ count: countDistinct(analytics.visitorId) })
    .from(analytics)
    .where(inArray(analytics.projectId, projectIds));

  const weeklyVisitorsAggregate = await getWeeklyProjectAggregate(projectIds);

  return c.json({
    totalProjects: projectIds.length,
    totalReports: Number(reportsCountRaw ?? 0),
    totalVisitors: Number(visitorsCountRaw ?? 0),
    totalVisitorsThisWeek: weeklyVisitorsAggregate,
  });
});

export default overviewRoute;
