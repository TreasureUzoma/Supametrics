"use client";

import React from "react";
import { cn } from "@repo/ui/lib/utils";

type GridProps = React.PropsWithChildren<{
  className?: string;
  columns?: number;
  gap?: string;
  gapSm?: string;
  gapMd?: string;
  gapLg?: string;
}>;

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  columns = 3,
  gap = "gap-4",
  gapSm,
  gapMd,
  gapLg,
}) => {
  return (
    <div
      className={cn(
        "grid",
        gap,
        gapSm && `sm:${gapSm}`,
        gapMd && `md:${gapMd}`,
        gapLg && `lg:${gapLg}`,
        `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns}`,
        className
      )}
    >
      {children}
    </div>
  );
};
