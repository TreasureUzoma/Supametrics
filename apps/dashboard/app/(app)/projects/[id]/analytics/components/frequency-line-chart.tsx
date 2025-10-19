"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

type FrequencyItem = {
  time: string;
  totalVisits: number;
  uniqueVisitors: number;
};

type FrequencyLineChartProps = {
  frequency: FrequencyItem[];
  loading: boolean;
};

const chartConfig = {
  totalVisits: { label: "Total Visits", color: "var(--chart-1)" },
  uniqueVisitors: { label: "Unique Visitors", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function FrequencyLineChart({
  frequency,
  loading,
}: FrequencyLineChartProps) {
  if (loading) return <Skeleton className="h-[40vh]" />;

  return (
    <Card className="pt-0">
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={frequency}>
            <defs>
              <linearGradient id="fillTotalVisits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillUniqueVisitors"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#eee" />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="totalVisits"
              type="natural"
              fill="url(#fillTotalVisits)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="uniqueVisitors"
              type="natural"
              fill="url(#fillUniqueVisitors)"
              stroke="var(--chart-2)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent payload={[]} />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
