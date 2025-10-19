"use client";

import { Error } from "@/components/error";
import { Header } from "./components/header";
import { use } from "react";
import { ProjectName } from "./components/project-name";
import { ProjectIdCopy } from "./components/project-id";
import { InviteUser } from "./components/inivite-user";
import { ProjectMembers } from "./components/members";
import { useProjectId } from "@/hooks/use-projects";
import { LeaveProject } from "./components/leave-project";
import { DeleteProject } from "./components/delete-project";
import { ProjectKeysCopy } from "./components/api-keys";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);
  const { data, isLoading, error } = useProjectId(projectId.id);
  console.log(data);
  if (error) return <Error description="Failed to fetch reports" />;
  return (
    <div>
      <Header
        title={`${data?.project?.name} Settings`}
        url={data?.project?.url || ""}
        loading={isLoading}
        id={projectId.id}
      />
      <div className="p-4 space-y-8">
        <ProjectName
          name={data?.project?.name}
          id={projectId.id}
          description={data?.project?.description ?? ""}
        />
        <ProjectIdCopy id={projectId.id} />
        <InviteUser id={projectId.id} />
        <ProjectMembers id={projectId.id} />
        {data?.role != "admin" && <LeaveProject id={projectId.id} />}
        {data?.role != "viewer" && (
          <ProjectKeysCopy
            publicKey={data?.apiKey?.publicKey ?? "-"}
            privateKey={data?.apiKey?.secretKey ?? "-"}
          />
        )}
        {data?.role == "admin" && <DeleteProject id={projectId.id} />}
      </div>
    </div>
  );
}
