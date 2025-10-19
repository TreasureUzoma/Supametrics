"use client";

import { useUpdateProject } from "@/hooks/use-projects";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import React, { useEffect, useState } from "react";

export const ProjectName = ({
  name,
  description,
  id,
}: {
  name?: string;
  description?: string;
  id: string;
}) => {
  const [projectName, setProjectName] = useState(name ?? "");
  const [projectDescription, setProjectDescription] = useState(
    description ?? ""
  );

  useEffect(() => {
    setProjectName(name ?? "");
    setProjectDescription(description ?? "");
  }, [name, description]);

  const payload = {
    name: projectName,
    description: projectDescription,
  };

  const { isPending, mutate } = useUpdateProject(id, payload);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Info</CardTitle>
        <CardDescription>
          Used to identify your Project on the Dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
        />
        <Textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Enter project description"
        />
        <Button
          disabled={isPending}
          className="float-right"
          onClick={() => mutate()}
        >
          {isPending ? "Updating..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
};
