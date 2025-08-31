"use client";

import { create } from "zustand";

type Workspace = {
  uuid: string;
  name: string;
  logo: {
    src: string;
  };
  subscriptionType: string;
  isPersonal?: boolean;
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
    set({
      workspaces,
      activeWorkspace: workspaces.length > 0 ? workspaces[0] : null,
    }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  get isPersonalWorkspace() {
    return get().activeWorkspace?.isPersonal ?? false;
  },
}));
