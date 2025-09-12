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
import { isValidUUID } from "@/lib/zod.js";

const overviewRoute = new Hono<{ Variables: AuthType }>();

overviewRoute.get("/", async (c) => {
  try {
    const currentUser = await getUserOrNull(c);
    const personal = c.req.query("personal") === "true";
    const teamIdParam = c.req.query("teamId");

    if (teamIdParam && !isValidUUID.safeParse(teamIdParam).success) {
      return c.json(
        { success: false, message: "Invalid teamId UUID", data: null },
        400
      );
    }

    let condition;
    if (personal) {
      condition = or(
        eq(projects.userId, currentUser!.uuid),
        eq(projectMembers.userId, currentUser!.uuid)
      );
    } else if (teamIdParam) {
      condition = eq(projects.teamId, teamIdParam);
    } else {
      condition = or(
        eq(projects.userId, currentUser!.uuid),
        eq(projectMembers.userId, currentUser!.uuid)
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
        success: true,
        message: "No projects found",
        data: {
          totalProjects: 0,
          totalReports: 0,
          totalVisitors: 0,
          totalVisitorsThisWeek: { count: 0, change: "+0%" },
        },
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
      success: true,
      message: "Overview fetched successfully",
      data: {
        totalProjects: projectIds.length,
        totalReports: Number(reportsCountRaw ?? 0),
        totalVisitors: Number(visitorsCountRaw ?? 0),
        totalVisitorsThisWeek: weeklyVisitorsAggregate,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch overview:", err);
    return c.json(
      {
        success: false,
        message: err?.message ?? "Failed to fetch overview",
        data: null,
      },
      500
    );
  }
});

export default overviewRoute;
