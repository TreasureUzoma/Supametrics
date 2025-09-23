import { Card } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { StatCardProps } from "@repo/ui/types";
import React from "react";

export const StatCard = ({ title, value, change, loading }: StatCardProps) => {
  const safeChange = change ?? null;
  const changeColor =
    safeChange === null
      ? "text-gray-400"
      : safeChange >= 0
        ? "text-green-500"
        : "text-red-500";
  const changeSign = safeChange === null ? "" : safeChange >= 0 ? "+" : "";

  if (loading) {
    return <Skeleton className="w-full h-28 rounded-lg" />;
  }

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">
          {(value ?? 0).toLocaleString()}
        </span>
        <span className={`text-sm font-medium ${changeColor}`}>
          {safeChange !== null
            ? `${changeSign}${safeChange.toFixed(1)}%`
            : "0%"}
        </span>
      </div>
    </Card>
  );
};
