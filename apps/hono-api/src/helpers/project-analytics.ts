import { db } from "../db/index.js";
import { analyticsEvents } from "../db/schema.js";
import { and, eq, gte, lte } from "drizzle-orm";

// Allowed filter values
type TimeFilter =
  | "today"
  | "yesterday"
  | "last_week"
  | "last_month"
  | "last_6_months"
  | "last_year";

// Shape of analyticsEvents rows
type AnalyticsEvent = {
  id: number;
  uuid: string;
  projectId: string;
  sessionId: string;
  visitorId: string;
  createdAt: Date;
};

// calculates the percentage change between current and previous numbers.
function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return null; // means no baseline
  return ((current - previous) / previous) * 100;
}

// gets the start/end date for the previous time range based on current start/end.
function getPreviousTimeRange(
  filter: TimeFilter,
  startTime: Date,
  endTime: Date
): { startTime: Date; endTime: Date } {
  const duration = endTime.getTime() - startTime.getTime();
  const prevEnd = new Date(startTime.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { startTime: prevStart, endTime: prevEnd };
}

// given a filter like "today", "last_week", "last_month", returns time range.
function getTimeRange(filter: TimeFilter): { startTime: Date; endTime: Date } {
  const now = new Date();
  let startTime: Date;
  let endTime = now;

  switch (filter) {
    case "today":
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "yesterday":
      startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "last_week":
      startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
      break;
    case "last_month":
      startTime = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      break;
    case "last_6_months":
      startTime = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
      break;
    case "last_year":
      startTime = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      break;
    default:
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
  }

  return { startTime, endTime };
}

// fetches total visits & unique visitors for a project and calculates % change from previous period.
export async function getProjectVisitStats(
  projectId: string,
  filter: TimeFilter
): Promise<{
  totalVisitsChange: number | null;
  uniqueVisitorsChange: number | null;
}> {
  // Current range
  const { startTime, endTime } = getTimeRange(filter);

  // Previous range
  const prevRange = getPreviousTimeRange(filter, startTime, endTime);

  // Current period stats
  const currentEvents: AnalyticsEvent[] = await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        gte(analyticsEvents.createdAt, startTime),
        lte(analyticsEvents.createdAt, endTime)
      )
    );

  const currentTotalVisits = currentEvents.length;
  const currentUniqueVisitors = new Set(currentEvents.map((e) => e.visitorId))
    .size;

  // Previous period stats
  const prevEvents: AnalyticsEvent[] = await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        gte(analyticsEvents.createdAt, prevRange.startTime),
        lte(analyticsEvents.createdAt, prevRange.endTime)
      )
    );

  const prevTotalVisits = prevEvents.length;
  const prevUniqueVisitors = new Set(prevEvents.map((e) => e.visitorId)).size;

  return {
    totalVisitsChange: calcPercentChange(currentTotalVisits, prevTotalVisits),
    uniqueVisitorsChange: calcPercentChange(
      currentUniqueVisitors,
      prevUniqueVisitors
    ),
  };
}
