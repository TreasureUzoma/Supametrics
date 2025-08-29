"use client";

import React, { useEffect, useState } from "react";
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
  id: string;
  multiple?: boolean;
  options: string[];
  onChange?: (selected: string[]) => void;
};

export default function FilterDropdown({
  id,
  multiple = true,
  options,
  onChange,
}: FilterDropdownProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Load saved filters from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem(`filter-dropdown-${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedFilters(
            parsed.filter((v): v is string => typeof v === "string")
          );
          return;
        }
      } catch {
        // ignore invalid JSON
      }
    }

    // Default to first option if nothing saved
    if (options.length > 0) {
      setSelectedFilters([options[0]!]);
    }
  }, [id, options]);

  // Save to localStorage and notify parent
  useEffect(() => {
    if (selectedFilters.length > 0) {
      localStorage.setItem(
        `filter-dropdown-${id}`,
        JSON.stringify(selectedFilters)
      );
      onChange?.(selectedFilters);
    }
  }, [id, selectedFilters, onChange]);

  const handleSelect = (option: string) => {
    setSelectedFilters((prev) => {
      if (multiple) {
        return prev.includes(option)
          ? prev.filter((f) => f !== option)
          : [...prev, option];
      } else {
        return [option];
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="w-4 h-4">
              <Filter className="w-4 h-4" />
            </span>
            <span>
              {selectedFilters.length > 0 ? selectedFilters[0] : "Filter by"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          {options.map((option) =>
            multiple ? (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selectedFilters.includes(option)}
                onCheckedChange={() => handleSelect(option)}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ) : (
              <DropdownMenuItem
                key={option}
                onClick={() => handleSelect(option)}
                className={
                  selectedFilters.includes(option) ? "font-semibold" : ""
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
