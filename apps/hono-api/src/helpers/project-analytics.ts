import { db } from "../db/index.js";
import { analyticsEvents } from "../db/schema.js";
import { and, gte, lt, inArray, eq } from "drizzle-orm";

const formatChange = (val: number | null) =>
  val === null ? null : `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;

const calcPercentChange = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

export async function getWeeklyProjectAggregate(projectId: string | string[]) {
  const ids = Array.isArray(projectId) ? projectId : [projectId];
  if (ids.length === 0) return {};

  const now = new Date();

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  const currentWeekEvents = await db
    .select({
      projectId: analyticsEvents.projectId,
      visitorId: analyticsEvents.visitorId,
    })
    .from(analyticsEvents)
    .where(
      and(
        inArray(analyticsEvents.projectId, ids),
        gte(analyticsEvents.timestamp, weekStart)
      )
    );

  const prevWeekEvents = await db
    .select({
      projectId: analyticsEvents.projectId,
      visitorId: analyticsEvents.visitorId,
    })
    .from(analyticsEvents)
    .where(
      and(
        inArray(analyticsEvents.projectId, ids),
        gte(analyticsEvents.timestamp, prevWeekStart),
        lt(analyticsEvents.timestamp, weekStart)
      )
    );

  const result: Record<
    string,
    {
      totalVisitors: number;
      uniqueVisitors: number;
      totalVisitsChange: string | null;
      uniqueVisitorsChange: string | null;
    }
  > = {};

  for (const id of ids) {
    const curr = currentWeekEvents.filter((e) => e.projectId === id);
    const prev = prevWeekEvents.filter((e) => e.projectId === id);

    const totalVisitors = curr.length;
    const uniqueVisitors = new Set(curr.map((e) => e.visitorId).filter(Boolean))
      .size;

    const prevTotalVisitors = prev.length;
    const prevUniqueVisitors = new Set(
      prev.map((e) => e.visitorId).filter(Boolean)
    ).size;

    result[id] = {
      totalVisitors,
      uniqueVisitors,
      totalVisitsChange: formatChange(
        calcPercentChange(totalVisitors, prevTotalVisitors)
      ),
      uniqueVisitorsChange: formatChange(
        calcPercentChange(uniqueVisitors, prevUniqueVisitors)
      ),
    };
  }

  return Array.isArray(projectId) ? result : result[projectId];
}
