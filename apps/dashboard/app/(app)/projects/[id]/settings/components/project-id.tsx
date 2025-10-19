"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { CopyButton } from "@repo/ui/components/ui/copy-button";

export const ProjectIdCopy = ({ id }: { id: string | undefined }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project ID</CardTitle>
        <CardDescription>
          Used to identify your Project on the Dashboard or via API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-start gap-4 items-center">
        <Input value={id} readOnly className="inline md:w-[40%]" />
        <CopyButton text={id} />
      </CardContent>
    </Card>
  );
};
