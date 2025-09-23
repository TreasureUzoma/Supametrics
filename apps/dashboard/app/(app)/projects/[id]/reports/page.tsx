import { Error } from "@/components/error";
import { Header } from "./components/header";
import { useReports } from "@/hooks/use-reports";
import { use } from "react";

export default function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);
  const { data, isLoading, error } = useReports(projectId.id);
  if (error) return <Error description="Failed to fetch analytics" />;
  return (
    <div>
      <Header
        title={`${data?.name} Analytics`}
        url={data?.url}
        loading={isLoading}
        id={projectId.id}
        totalReports={data?.totalReports}
      />
    </div>
  );
}
