"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export const Billings = () => {
  return (
    <div id="#billing">
      <h3 className="font-bold text-lg mb-1">Billings</h3>
      <Card>
        <CardHeader>
          <CardTitle>Its free</CardTitle>
          <CardDescription>It&apos;s free baby</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
