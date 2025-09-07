import React, { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";

const PageTitle = ({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-2xl font-bold", className)} {...props}>
      {children}
    </div>
  );
};

export default PageTitle;
