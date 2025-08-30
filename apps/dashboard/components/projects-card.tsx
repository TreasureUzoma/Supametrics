"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Users } from "lucide-react";
import FilterDropdown from "@repo/ui/components/ui/filter";
import { projects } from "@/data/dummy";

const filterOptions = ["All", "Active", "Disabled"];

export const ProjectsCard = () => {
  const [filter, setFilter] = useState<string[]>(["All"]);

  const filteredProjects = useMemo(() => {
    const current = filter[0] ?? "All";
    return projects.filter((project) => {
      if (current === "All") return true;
      if (current === "Active") return project.active;
      if (current === "Disabled") return !project.active;
      return true;
    });
  }, [filter]);

  return (
    <section>
      <div className="flex_between">
        <h2 className="text-lg font-semibold mt-4 mb-2">Your Projects</h2>
        <FilterDropdown
          multiple={false}
          options={filterOptions}
          defaultValue={["All"]}
          onChange={setFilter}
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.name}
              href={`/projects/${project?.id ?? "id"}`}
              className="block hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              tabIndex={0}
            >
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {project.active && (
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
                    <p className="truncate">{project.url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{project.visitors.toLocaleString()} visitors</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {project.trendingUp ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      {project.trendingUp ? "+" : "-"}
                      {project.trendingPercent}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex_center h-[15rem]">
          <p className="text-sm text-muted-foreground mt-4">
            No projects match your current filter.
          </p>
        </div>
      )}
    </section>
  );
};
