"use client";

import { create } from "zustand";

type Workspace = {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
  isPersonal?: boolean; // true if it’s the user’s personal workspace
};

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
  isPersonalWorkspace: boolean;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  setWorkspaces: (workspaces) =>
    set((state) => ({
      workspaces,
      activeWorkspace:
        state.activeWorkspace ?? (workspaces.length > 0 ? workspaces[0] : null),
    })),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  get isPersonalWorkspace() {
    return get().activeWorkspace?.isPersonal ?? false;
  },
}));
