"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLeaveProject } from "@/hooks/use-projects";

export const LeaveProject = ({ id }: { id: string }) => {
  const { mutate, isPending } = useLeaveProject(id);
  const handleLeave = () => {
    if (!id) return;
    mutate();
  };

  return (
    <Card className="border border-red-500/30 bg-red-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-600">Leave Project</CardTitle>
        </div>
        <CardDescription className="text-red-500/80">
          This action cannot be undone. You’ll lose access to all project data.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleLeave}
          className="w-fit"
          disabled={isPending}
        >
          {isPending ? "Leaving Project..." : "Leave Project"}
        </Button>
      </CardContent>
    </Card>
  );
};
