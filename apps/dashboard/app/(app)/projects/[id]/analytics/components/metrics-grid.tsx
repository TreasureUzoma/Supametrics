import { MetricsGridProps } from "@repo/ui/types";
import React from "react";

const MetricsGrid = ({ children }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
};

export default MetricsGrid;
