"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { Check, Copy } from "lucide-react";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

interface CopyButtonProps {
  text: string | undefined;
  variant?: ButtonVariant;
  showtext?: boolean;
}

export const CopyButton = ({
  text,
  variant,
  showtext = false,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Button
        onClick={handleCopy}
        variant={variant}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check size={16} /> {showtext && "Copied"}
          </>
        ) : (
          <>
            <Copy size={16} /> {showtext && "Copy"}
          </>
        )}
      </Button>
    </motion.div>
  );
};
