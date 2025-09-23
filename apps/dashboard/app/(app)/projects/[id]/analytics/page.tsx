"use client";
import { use } from "react";
import { Header } from "./components/header";
import { useAnalytics } from "@/hooks/use-analytics";
import MetricsGrid from "./components/metrics-grid";
import { StatCard } from "./components/stat-card";
import { FrequencyLineChart } from "./components/frequency-line-chart";
import { SummaryCard } from "./components/summary-card";
import { Grid } from "./components/grid";
import { cleanUrl } from "@repo/ui/lib/utils";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);
  const { data, isLoading, error } = useAnalytics(projectId.id);

  if (error) return <div>Error loading analytics</div>;

  return (
    <div>
      <Header
        title={`${data?.name} Analytics`}
        url={data?.url}
        loading={isLoading}
        id={projectId.id}
        onlineVisitors={data?.onlineVisitors}
      />

      <main className="py-7 md:py-8 px-5 space-y-6 flex flex-col">
        <MetricsGrid>
          <StatCard
            title="Total Visits"
            value={data?.totalVisits ?? 0}
            loading={isLoading}
            change={
              data?.totalVisitsChange
                ? parseFloat(data.totalVisitsChange)
                : null
            }
          />
          <StatCard
            title="Unique Visitors"
            value={data?.uniqueVisitors ?? 0}
            loading={isLoading}
            change={
              data?.uniqueVisitorsChange
                ? parseFloat(data.uniqueVisitorsChange)
                : null
            }
          />
        </MetricsGrid>

        <FrequencyLineChart
          frequency={data?.frequency ?? []}
          loading={isLoading}
        />

        <Grid columns={2} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="Browsers"
            loading={isLoading}
            data={
              data?.browserSummary?.map((b) => ({
                label: String(b.browserName ?? "Unknown"),
                count: Number(b.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Devices"
            loading={isLoading}
            data={
              data?.deviceSummary?.map((d) => ({
                label: String(d.deviceType ?? "Unknown"),
                count: Number(d.count ?? 0),
              })) ?? []
            }
          />
        </Grid>

        <Grid columns={2} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="OS"
            loading={isLoading}
            data={
              data?.osSummary?.map((o) => ({
                label: String(o.osName ?? "Unknown"),
                count: Number(o.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Referrers"
            loading={isLoading}
            data={
              data?.topReferrers?.map((r) => ({
                label: cleanUrl(String(r.referrer ?? "Unknown")),
                count: Number(r.count ?? 0),
              })) ?? []
            }
          />
        </Grid>

        <Grid columns={3} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="Top Hostnames"
            loading={isLoading}
            data={
              data?.topHostnames?.map((h) => ({
                label: String(h.hostname ?? "Unknown"),
                count: Number(h.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Paths"
            loading={isLoading}
            data={
              data?.topPaths?.map((p) => ({
                label: String(p.pathname ?? "Unknown"),
                count: Number(p.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top UTM Sources"
            loading={isLoading}
            data={
              data?.topUtmSources?.map((u) => ({
                label: String(u.utmSource ?? "Unknown"),
                count: Number(u.count ?? 0),
              })) ?? []
            }
          />
        </Grid>
      </main>
    </div>
  );
}
