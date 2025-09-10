import { Header } from "./components/header";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  return (
    <div>
      <Header title="Analytics" />
      <div className="p-5">Project ID: {projectId}</div>
    </div>
  );
}
