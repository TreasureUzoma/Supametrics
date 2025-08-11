import { Hono } from "hono";
import { db } from "../db/index.js";
import { analyticsEvents } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getUserOrThrow, getProjectMembership } from "../helpers/projects.js";

const analyticsRoutes = new Hono();

const allowedFilters = [
  "10secs",
  "5mins",
  "today",
  "yesterday",
  "thisweek",
  "thismonth",
  "thisyear",
  "last3years",
];

// date helpers
const now = new Date();
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfWeek = (d: Date) => {
  const day = d.getDay() || 7; // Sunday=0 → 7
  const diff = 1 - day; // Monday=1 start
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
};
const endOfWeek = (d: Date) => {
  const monday = startOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return endOfDay(sunday);
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d: Date) =>
  new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
const startOfYearNYearsAgo = (d: Date, n: number) =>
  new Date(d.getFullYear() - n, 0, 1);

// Calculate current period range
function getTimeRange(filter: string) {
  let startTime: Date, endTime: Date | undefined, bucketFormat: string;
  switch (filter) {
    case "10secs":
      startTime = new Date(now.getTime() - 10 * 1000);
      bucketFormat = "second";
      break;
    case "5mins":
      startTime = new Date(now.getTime() - 5 * 60 * 1000);
      bucketFormat = "minute";
      break;
    case "today":
      startTime = startOfDay(now);
      endTime = endOfDay(now);
      bucketFormat = "hour";
      break;
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      startTime = startOfDay(y);
      endTime = endOfDay(y);
      bucketFormat = "hour";
      break;
    }
    case "thisweek":
      startTime = startOfWeek(now);
      endTime = endOfWeek(now);
      bucketFormat = "day";
      break;
    case "thismonth":
      startTime = startOfMonth(now);
      endTime = endOfMonth(now);
      bucketFormat = "day";
      break;
    case "thisyear":
      startTime = startOfYear(now);
      endTime = endOfYear(now);
      bucketFormat = "month";
      break;
    case "last3years":
      startTime = startOfYearNYearsAgo(now, 3);
      endTime = now;
      bucketFormat = "month";
      break;
    default:
      throw new Error("Invalid filter");
  }
  return { startTime, endTime, bucketFormat };
}

// Calculate previous period range based on current period and filter
function getPreviousTimeRange(
  filter: string,
  currentStart: Date,
  currentEnd?: Date
) {
  switch (filter) {
    case "10secs":
      return {
        startTime: new Date(currentStart.getTime() - 10 * 1000),
        endTime: currentStart,
      };
    case "5mins":
      return {
        startTime: new Date(currentStart.getTime() - 5 * 60 * 1000),
        endTime: currentStart,
      };
    case "today":
    case "yesterday":
      return {
        startTime: new Date(currentStart.getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(
          (currentEnd || currentStart).getTime() - 24 * 60 * 60 * 1000
        ),
      };
    case "thisweek":
      return {
        startTime: new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          (currentEnd || currentStart).getTime() - 7 * 24 * 60 * 60 * 1000
        ),
      };
    case "thismonth": {
      const prevMonthStart = new Date(currentStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(currentEnd!);
      prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
      return { startTime: prevMonthStart, endTime: prevMonthEnd };
    }
    case "thisyear": {
      const prevYearStart = new Date(currentStart);
      prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
      const prevYearEnd = new Date(currentEnd!);
      prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);
      return { startTime: prevYearStart, endTime: prevYearEnd };
    }
    case "last3years": {
      const prev3YearsStart = new Date(currentStart);
      prev3YearsStart.setFullYear(prev3YearsStart.getFullYear() - 3);
      return { startTime: prev3YearsStart, endTime: currentStart };
    }
    default:
      throw new Error("Invalid filter");
  }
}

// Calculate percent change helper
function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return null; // Avoid division by zero
  return ((current - previous) / Math.abs(previous)) * 100;
}

async function getCommonAggregations(projectId: string, conditions: any[]) {
  const commonSelect = (groupByCols: any[]) =>
    db
      .select({
        count: db.fn.count(),
        ...groupByCols.reduce((acc, col) => ({ ...acc, [col.name]: col }), {}),
      })
      .from(analyticsEvents)
      .where(...conditions)
      .groupBy(...groupByCols)
      .orderBy(db.fn.count(), "desc");

  const [
    eventSummary,
    osSummary,
    deviceSummary,
    browserSummary,
    topPaths,
    topReferrers,
    topHostnames,
    topUtmSources,
    totalVisitsRes,
    uniqueVisitorsRes,
  ] = await Promise.all([
    commonSelect([analyticsEvents.eventType, analyticsEvents.eventName]),
    commonSelect([analyticsEvents.osName]),
    commonSelect([analyticsEvents.deviceType]),
    commonSelect([analyticsEvents.browserName]),
    commonSelect([analyticsEvents.pathname]).limit(15),
    commonSelect([analyticsEvents.referrer]).limit(15),
    commonSelect([analyticsEvents.hostname]).limit(10),
    commonSelect([analyticsEvents.utmSource]).limit(5),
    db
      .select({ totalVisits: db.fn.count() })
      .from(analyticsEvents)
      .where(...conditions),
    db
      .select({
        uniqueVisitors: db.fn.countDistinct(analyticsEvents.visitorId),
      })
      .from(analyticsEvents)
      .where(...conditions),
  ]);

  return {
    eventSummary,
    osSummary,
    deviceSummary,
    browserSummary,
    topPaths,
    topReferrers,
    topHostnames,
    topUtmSources,
    totalVisits: Number(totalVisitsRes[0]?.totalVisits || 0),
    uniqueVisitors: Number(uniqueVisitorsRes[0]?.uniqueVisitors || 0),
  };
}

// GET /:id/analytics get analytics data (page_view event [default event])
analyticsRoutes.get("/:id/analytics", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");

  if (!(await getProjectMembership(projectId, currentUser.uuid))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const filter = (c.req.query("filter") || "today").toLowerCase();
  if (!allowedFilters.includes(filter)) {
    return c.json({ error: "Invalid filter" }, 400);
  }

  const { startTime, endTime, bucketFormat } = getTimeRange(filter);
  const prevRange = getPreviousTimeRange(filter, startTime, endTime);

  const conditionsCurrent = [
    eq(analyticsEvents.projectId, projectId),
    analyticsEvents.timestamp.gte(startTime),
  ];
  if (endTime) conditionsCurrent.push(analyticsEvents.timestamp.lte(endTime));

  const conditionsPrevious = [
    eq(analyticsEvents.projectId, projectId),
    analyticsEvents.timestamp.gte(prevRange.startTime),
    analyticsEvents.timestamp.lte(prevRange.endTime),
  ];

  // Get common data and previous totals in parallel
  const [commonData, previousTotalsRes] = await Promise.all([
    getCommonAggregations(projectId, conditionsCurrent),
    db
      .select({
        totalVisits: db.fn.count(),
        uniqueVisitors: db.fn.countDistinct(analyticsEvents.visitorId),
      })
      .from(analyticsEvents)
      .where(...conditionsPrevious),
  ]);

  const previousTotals = {
    totalVisits: Number(previousTotalsRes[0]?.totalVisits || 0),
    uniqueVisitors: Number(previousTotalsRes[0]?.uniqueVisitors || 0),
  };

  const totalVisitsChange = calcPercentChange(
    commonData.totalVisits,
    previousTotals.totalVisits
  );
  const uniqueVisitorsChange = calcPercentChange(
    commonData.uniqueVisitors,
    previousTotals.uniqueVisitors
  );

  const frequency = await db
    .select({
      time: db.raw(
        `date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`
      ),
      totalVisits: db.fn.count(),
      uniqueVisitors: db.fn.countDistinct(analyticsEvents.visitorId),
    })
    .from(analyticsEvents)
    .where(...conditionsCurrent)
    .groupBy(
      db.raw(`date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`)
    )
    .orderBy(
      db.raw(`date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`)
    );

  return c.json({
    success: true,
    filter,
    ...commonData,
    totalVisitsChange,
    uniqueVisitorsChange,
    frequency,
  });
});

// GET /:id/analytics/:eventName get analytics for custom event
analyticsRoutes.get("/:id/analytics/:eventName", async (c) => {
  const currentUser = await getUserOrThrow(c);
  const projectId = c.req.param("id");
  const eventName = c.req.param("eventName");

  if (!(await getProjectMembership(projectId, currentUser.uuid))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const filter = (c.req.query("filter") || "today").toLowerCase();
  if (!allowedFilters.includes(filter)) {
    return c.json({ error: "Invalid filter" }, 400);
  }

  const { startTime, endTime, bucketFormat } = getTimeRange(filter);
  const prevRange = getPreviousTimeRange(filter, startTime, endTime);

  const conditionsCurrent = [
    eq(analyticsEvents.projectId, projectId),
    eq(analyticsEvents.eventName, eventName),
    analyticsEvents.timestamp.gte(startTime),
  ];
  if (endTime) conditionsCurrent.push(analyticsEvents.timestamp.lte(endTime));

  const conditionsPrevious = [
    eq(analyticsEvents.projectId, projectId),
    eq(analyticsEvents.eventName, eventName),
    analyticsEvents.timestamp.gte(prevRange.startTime),
    analyticsEvents.timestamp.lte(prevRange.endTime),
  ];

  // Get common data and previous totals in parallel
  const [commonData, previousTotalsRes] = await Promise.all([
    getCommonAggregations(projectId, conditionsCurrent),
    db
      .select({
        totalVisits: db.fn.count(),
        uniqueVisitors: db.fn.countDistinct(analyticsEvents.visitorId),
      })
      .from(analyticsEvents)
      .where(...conditionsPrevious),
  ]);

  const previousTotals = {
    totalVisits: Number(previousTotalsRes[0]?.totalVisits || 0),
    uniqueVisitors: Number(previousTotalsRes[0]?.uniqueVisitors || 0),
  };

  const totalVisitsChange = calcPercentChange(
    commonData.totalVisits,
    previousTotals.totalVisits
  );
  const uniqueVisitorsChange = calcPercentChange(
    commonData.uniqueVisitors,
    previousTotals.uniqueVisitors
  );

  const frequency = await db
    .select({
      time: db.raw(
        `date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`
      ),
      totalVisits: db.fn.count(),
      uniqueVisitors: db.fn.countDistinct(analyticsEvents.visitorId),
    })
    .from(analyticsEvents)
    .where(...conditionsCurrent)
    .groupBy(
      db.raw(`date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`)
    )
    .orderBy(
      db.raw(`date_trunc('${bucketFormat}', ${analyticsEvents.timestamp.name})`)
    );

  return c.json({
    success: true,
    filter,
    eventName,
    ...commonData,
    totalVisitsChange,
    uniqueVisitorsChange,
    frequency,
  });
});

export default analyticsRoutes;
