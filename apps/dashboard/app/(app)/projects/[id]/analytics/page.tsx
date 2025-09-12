"use client";
import { use } from "react";
import { Header } from "./components/header";
import { useAnalytics } from "@/hooks/use-analytics";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);

  const { data, isLoading, error } = useAnalytics(projectId.id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading analytics</div>;

  return (
    <div>
      <Header title={`${data?.name} Analytics`} url={data?.url} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
