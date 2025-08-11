import { db } from "../db/index.js";
import { analyticsEvents } from "../db/schema.js";
import { and, eq, gte, lt } from "drizzle-orm";

const formatChange = (val: number | null) =>
  val === null ? null : `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;

const calcPercentChange = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

export async function getWeeklyProjectAggregate(projectId: string) {
  const now = new Date();

  // Current week range
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  // Previous week range
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  // Fetch current week events
  const currentWeekEvents = await db
    .select({
      visitorId: analyticsEvents.visitorId,
      sessionId: analyticsEvents.sessionId,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        gte(analyticsEvents.timestamp, weekStart)
      )
    );

  // Fetch previous week events
  const prevWeekEvents = await db
    .select({
      visitorId: analyticsEvents.visitorId,
      sessionId: analyticsEvents.sessionId,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        gte(analyticsEvents.timestamp, prevWeekStart),
        lt(analyticsEvents.timestamp, weekStart)
      )
    );

  const totalVisitors = currentWeekEvents.length;
  const uniqueVisitors = new Set(
    currentWeekEvents.map((e) => e.visitorId).filter(Boolean)
  ).size;

  const prevTotalVisitors = prevWeekEvents.length;
  const prevUniqueVisitors = new Set(
    prevWeekEvents.map((e) => e.visitorId).filter(Boolean)
  ).size;

  return {
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
