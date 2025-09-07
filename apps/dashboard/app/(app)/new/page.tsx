import { NewProjectForm } from "@/components/new-project-form";
import PageTitle from "@/components/page-title";

export default function CreateNewProjectPage() {
  return (
    <div className="p-4">
      <PageTitle>Create a new project</PageTitle>
      <p className="text-subtitle">
        Set up tracking in seconds — so you can focus on growing smarter.
      </p>
      <NewProjectForm />
    </div>
  );
}
