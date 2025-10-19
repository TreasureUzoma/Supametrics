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
import { Label } from "@repo/ui/components/ui/label";

export const ProjectKeysCopy = ({
  publicKey,
  privateKey,
}: {
  publicKey: string;
  privateKey: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project API Keys</CardTitle>
        <CardDescription>
          These keys are used to authenticate and identify your project when
          making API requests.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Label className="min-w-[100px] text-sm text-muted-foreground">
            Public Key
          </Label>
          <div className="flex items-center gap-2 w-full md:w-[60%]">
            <Input
              value={publicKey || ""}
              readOnly
              className="flex-1 font-mono text-sm"
              placeholder="No public key"
            />
            <CopyButton text={publicKey} />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Label className="min-w-[100px] text-sm text-muted-foreground">
            Private Key
          </Label>
          <div className="flex items-center gap-2 w-full md:w-[60%]">
            <Input
              value={privateKey || ""}
              readOnly
              className="flex-1 font-mono text-sm"
              type="password"
              placeholder="No private key"
            />
            <CopyButton text={privateKey} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
