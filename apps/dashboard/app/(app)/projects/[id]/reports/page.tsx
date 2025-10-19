"use client";

import { Error } from "@/components/error";
import { Header } from "./components/header";
import { useReports } from "@/hooks/use-reports";
import { use } from "react";
import { ReportsCards } from "./components/reports-cards";

export default function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);
  const { data, isLoading, error } = useReports(projectId.id);
  console.log(data);
  if (error) return <Error description="Failed to fetch reports" />;
  return (
    <div>
      <Header
        title={`${data?.data?.name} Reports`}
        url={data?.data?.url || ""}
        loading={isLoading}
        id={projectId.id}
        totalReports={data?.data?.totalReports || 0}
      />
      <div>
        <ReportsCards />
      </div>
    </div>
  );
}
