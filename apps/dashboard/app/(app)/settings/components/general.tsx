"use client";

import { useUpdateProfileName } from "@/hooks/use-auth";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { useEffect, useState } from "react";

export const GeneralSettings = ({ name }: { name: string | undefined }) => {
  const [userName, setUserName] = useState(name);

  useEffect(() => {
    setUserName(name);
  }, [name]);

  const { isPending, mutate } = useUpdateProfileName();

  return (
    <div id="#general">
      <h3 className="font-bold text-lg mb-1">General Settings</h3>
      <Card>
        <CardHeader>
          <CardTitle>Update Profle Details</CardTitle>
          <CardDescription>Update your account name</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button
            disabled={isPending}
            className="float-right"
            onClick={() => mutate(userName || "")}
          >
            {isPending ? "Updating..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
