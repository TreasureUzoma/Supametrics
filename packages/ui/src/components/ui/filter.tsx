"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Filter } from "lucide-react";

type FilterDropdownProps = {
  multiple?: boolean;
  options: string[];
  defaultValue?: string[];
  onChange: (selected: string[]) => void;
};

export default function FilterDropdown({
  multiple = true,
  options,
  defaultValue = [],
  onChange,
}: FilterDropdownProps) {
  const [value, setValue] = useState<string[]>(defaultValue);

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  const handleSelect = (option: string) => {
    if (multiple) {
      setValue((prev) =>
        prev.includes(option)
          ? prev.filter((f) => f !== option)
          : [...prev, option]
      );
    } else {
      setValue([option]);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="w-4 h-4">
              <Filter className="w-4 h-4" />
            </span>
            <span>{value.length > 0 ? value.join(", ") : "Filter by"}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          {options.map((option) =>
            multiple ? (
              <DropdownMenuCheckboxItem
                key={option}
                checked={value.includes(option)}
                onCheckedChange={() => handleSelect(option)}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ) : (
              <DropdownMenuItem
                key={option}
                onClick={() => handleSelect(option)}
                className={
                  value.includes(option) ? "font-semibold text-primary" : ""
                }
              >
                {option}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
