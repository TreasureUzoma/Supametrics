import { create } from "zustand";

import type { Timerange } from "@repo/ui/types";

interface AnalyticsStore {
  filter: Timerange;
  from?: string;
  to?: string;

  setFilter: (filter: Timerange) => void;
  setRange: (from: string, to: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filter: "today",
  from: undefined,
  to: undefined,

  setFilter: (filter) => set({ filter }),
  setRange: (from, to) => set({ from, to }),
}));
