"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";
import { Users, Globe, Smartphone, Server } from "lucide-react";
import FilterDropdown from "@repo/ui/components/ui/filter";
import { useProjects } from "@/hooks/use-projects";
import { NoDataFound } from "./no-data";
import { cleanUrl } from "@repo/ui/lib/utils";
import { Project } from "@repo/ui/types";

const filterOptions = ["Newest", "Oldest"];

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <CardTitle className="h-4 bg-muted rounded w-3/4 mb-2" />
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </CardContent>
  </Card>
);

export const ProjectsCard = () => {
  const [filter, setFilter] = useState<string[]>(["Newest"]);
  const { projects, loading, hasMore, loadMore, sort, setSort, refresh } =
    useProjects(12);

  // Sync filter with sort
  useEffect(() => {
    const current = filter[0] ?? "Newest";
    const newSort = current === "Newest" ? "newest" : "oldest";

    if (sort !== newSort) {
      setSort(newSort);
      refresh();
    }
  }, [filter, sort, setSort, refresh]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProjectRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]!.isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  return (
    <section>
      <div className="flex_between">
        <h2 className="text-lg font-semibold mt-4 mb-2">Your Projects</h2>
        <FilterDropdown
          multiple={false}
          options={filterOptions}
          defaultValue={["Newest"]}
          onChange={setFilter}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {projects.map((project, index) => {
          const isLast = index === projects.length - 1;
          return (
            <div key={project.uuid} ref={isLast ? lastProjectRef : null}>
              <ProjectCard project={project} />
            </div>
          );
        })}

        {loading &&
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {!loading && projects.length === 0 && (
        <NoDataFound message="No projects found" />
      )}
    </section>
  );
};

const ProjectCard = ({ project }: { project: Project }) => (
  <Link
    href={`/projects/${project.uuid}/analytics`}
    className="block hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
    tabIndex={0}
  >
    <Card className="hover:shadow-md transition cursor-pointer">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {project.status === "active" && (
            <span
              aria-label="Active"
              title="Active"
              className="inline-block w-2 h-2 rounded-full bg-green-500 select-none"
            />
          )}
          <p className="truncate" title={project.name}>
            {project.name}
          </p>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 truncate">
          <p className="truncate">{cleanUrl(project.url) ?? "—"}</p>
        </div>

        <div className="flex items-center gap-2">
          {project.type === "web" ? (
            <Globe className="h-3 w-3" />
          ) : project.type === "mobile" ? (
            <Smartphone className="h-3 w-3" />
          ) : project.type === "backend" ? (
            <Server className="h-3 w-3" />
          ) : (
            <Globe className="h-3 w-3 text-gray-400" />
          )}

          <span className="capitalize">{project.type ?? "—"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-3 w-3" />
          <span>{project.visitors?.toLocaleString() ?? 0} visitors</span>
        </div>
      </CardContent>
    </Card>
  </Link>
);
