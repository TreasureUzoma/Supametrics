"use client";

import {
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectTrigger } from "@repo/ui/components/ui/select";
import React, { useState } from "react";
import { projectRoles } from "@repo/ui/constants";
import { useUpdateProjectTeamMembers } from "@/hooks/use-projects";

export const InviteUser = ({ id }: { id: string }) => {
  const [userEmail, setUserEmail] = useState("");
  const [projectRole, setProjectRole] = useState("viewer");

  const { mutate, isPending } = useUpdateProjectTeamMembers(id, {
    email: userEmail,
    role: projectRole,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite User</CardTitle>
        <CardDescription>
          Invite a supametrics user to your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          onChange={(e) => setUserEmail(e.target.value)}
          value={userEmail}
          placeholder="example@mail.com"
          type="email"
        />
        <Select onValueChange={setProjectRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {projectRoles.map((role) => (
              <SelectItem className="capitalize" key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="float-right"
          disabled={isPending}
          onClick={() => mutate()}
        >
          {isPending ? "Sending Invite..." : "Invite"}
        </Button>
      </CardContent>
    </Card>
  );
};
