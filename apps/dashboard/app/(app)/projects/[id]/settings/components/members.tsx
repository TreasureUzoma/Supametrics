"use client";

import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Member,
  useGetProjectMembers,
  useRemoveProjectMember,
} from "@/hooks/use-projects";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const ProjectMembers = ({ id }: { id: string }) => {
  const { data, isLoading, error } = useGetProjectMembers(id);
  const { mutate: RoleChangeMutate, isPending: RoleChangePending } =
    useRemoveProjectMember(id);

  const handleRemove = (memberId: string) => RoleChangeMutate(memberId);
  const handleRoleChange = (memberId: string, newRole: Member["role"]) => {};
  const handleSave = () => {
    console.log("Saving members for project:", id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Members</CardTitle>
        <CardDescription>See, edit, or remove project members.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-border rounded-xl px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-[110px]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load members.</p>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border border-border rounded-xl px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium leading-none">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.id, value as Member["role"])
                    }
                    disabled={member.role === "owner"}
                  >
                    <SelectTrigger
                      className="w-[110px] text-center"
                      disabled={RoleChangePending}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Editor</SelectItem>
                      <SelectItem value="editor">Viewer</SelectItem>
                    </SelectContent>
                  </Select>

                  {member.role.toLocaleLowerCase() !== "admin" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
