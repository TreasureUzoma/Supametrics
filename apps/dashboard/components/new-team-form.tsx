"use client";
import { useState } from "react";
import { useSession } from "@/store/use-session";
import { useCreateTeam } from "@/hooks/use-create-team";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Team } from "@repo/ui/types";

export const NewTeamForm = () => {
  const { user, isLoading } = useSession();
  const { mutate: createTeam, isPending } = useCreateTeam();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Pick<Team, "name"> = { name };
    createTeam(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <LoadingSpinner loading={isLoading} />
      </div>
    );
  }

  if (!user) {
    return <p className="p-10">No session found</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center md:px-4 py-10"
    >
      <Card className="w-full max-w-lg md:w-[700px] text-sm">
        <CardContent>
          <CardTitle className="text-lg md:text-2xl">New Team</CardTitle>
          <CardDescription className="mt-1 mb-5">
            Hello! Let’s get started by creating your first team.
          </CardDescription>

          <div className="space-y-3 mb-4">
            <Label className="text-sm font-medium">Team Name</Label>
            <Input
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <LoadingSpinner loading={isPending} /> : "Create Team"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
