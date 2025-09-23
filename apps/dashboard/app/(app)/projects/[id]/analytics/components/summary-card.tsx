"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export type SummaryItem = {
  label: string;
  count: number;
};

type SummaryCardProps = {
  title: string;
  data: SummaryItem[];
  className?: string;
  maxVisible?: number;
  loading: boolean;
};

export const SummaryCard = ({
  title,
  data,
  className,
  maxVisible = 2,
  loading,
}: SummaryCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const visibleData = showAll ? data : data.slice(0, maxVisible);

  const renderBar = (item: SummaryItem, height: number = 28) => {
    const percentage = (item.count / totalCount) * 100;

    return (
      <div className="relative mb-2">
        {/* Bar background */}
        <div
          className="w-full bg-main/10 rounded-sm overflow-hidden"
          style={{ height: `${height}px` }}
        >
          {/* Filled bar */}
          <div
            className="h-full bg-main/65 flex items-center px-2 text-xs text-white font-medium rounded-sm"
            style={{ width: `${percentage}%` }}
          >
            {item.label}
          </div>
        </div>

        {/* Count + percentage, right-aligned */}
        <div className="absolute right-2 top-0 h-full flex items-center text-xs font-medium text-gray-900 dark:text-white">
          {item.count.toLocaleString()}
        </div>
      </div>
    );
  };
  if (loading) return <Skeleton className="!h-10" />;
  return (
    <>
      <Card className={cn("py-4", className)}>
        <CardContent>
          {/* Header */}
          <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <h3>{title}</h3>
            <h3>Visitors</h3>
          </div>

          {/* Bars */}
          <ul className="mt-4 min-h-30">
            {visibleData.map((item) => (
              <li key={item.label}>{renderBar(item)}</li>
            ))}
          </ul>

          {/* View More button */}
          {data.length > maxVisible && !showAll && (
            <div className="mt-2 text-right">
              <button
                className="text-sm text-main hover:underline"
                onClick={() => setShowAll(true)}
              >
                View More
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup for View More */}
      {showAll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{title} - All Items</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {data.map((item) => (
                <li key={item.label}>{renderBar(item)}</li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-main text-white rounded hover:bg-purple-700"
                onClick={() => setShowAll(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
