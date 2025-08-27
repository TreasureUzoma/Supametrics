"use client";

import Link from "next/link";
import { cn } from "../lib/utils";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

const baseStyles =
  "inline px-4 py-1 rounded-md text-[0.87rem] transition-colors duration-200";

const variantStyles = {
  primary:
    "text-white dark:text-black bg-black dark:bg-white hover:bg-neutral-300 dark:hover:bg-neutral-200",
  secondary:
    "text-black dark:text-white bg-white dark:bg-black hover:bg-neutral-500 dark:hover:bg-neutral-900",
  outline:
    "text-black dark:text-white bg-white dark:bg-black border border-neutral-800 text-black bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700",
};

const LinkButton = ({
  href,
  children,
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
