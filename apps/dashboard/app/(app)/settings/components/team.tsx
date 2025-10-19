"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useEffect, useState } from "react";
import {
  useTeams,
  useUpdateTeamName,
  useTeamMembers,
  useRemoveTeamMember,
  useLeaveTeam,
} from "@/hooks/use-teams";

export const TeamSettings = () => {
  const { data: teams, isLoading } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const { isPending, mutate } = useUpdateTeamName(selectedTeam || "", teamName);

  const { data: members, isLoading: membersLoading } =
    useTeamMembers(selectedTeam);
  const removeMember = useRemoveTeamMember(selectedTeam || "");
  const leaveTeam = useLeaveTeam(selectedTeam || "");

  useEffect(() => {
    if (selectedTeam && teams) {
      const team = teams.find((t) => t.uuid === selectedTeam);
      setTeamName(team?.name || "");
    }
  }, [selectedTeam, teams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div id="#teams" className="space-y-8">
      <div>
        <h3 className="font-bold text-lg mb-2">Your Teams</h3>
        <Card>
          <CardHeader>
            <CardTitle>Team List</CardTitle>
            <CardDescription>View and manage your teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teams?.map((team) => (
              <div
                key={team.uuid}
                className="flex justify-between items-center border border-border p-2 rounded-md"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Role: {team.role}
                  </p>
                </div>

                {team.role === "owner" ? (
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedTeam(team.uuid)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    disabled={leaveTeam.isPending}
                    onClick={() => {
                      setSelectedTeam(team.uuid);
                      leaveTeam.mutate();
                    }}
                  >
                    {leaveTeam.isPending ? "Leaving..." : "Leave"}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {selectedTeam && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Edit Team Name</CardTitle>
              <CardDescription>Change the name of your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
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

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {membersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={member.uuid}
                    className="flex justify-between items-center border border-border p-2 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Role: {member.role}
                      </p>
                    </div>
                    {(member.role === "member" || member.role === "viewer") && (
                      <Button
                        variant="ghost"
                        disabled={removeMember.isPending}
                        onClick={() => removeMember.mutate(member.uuid)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
