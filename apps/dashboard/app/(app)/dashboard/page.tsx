export const metadata = {
  title: "Dashboard - Supametrics",
  description: "Overview of your projects and stats",
};

import { ProjectsCard } from "@/components/projects-card";
import { StatsOverview } from "@/components/stats-overview";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <StatsOverview />

      <ProjectsCard />
    </div>
  );
}
