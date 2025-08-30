"use client";

import axiosFetch from "@repo/ui/lib/axios";
import { Response } from "@repo/ui/types";
import { useWorkspace } from "@/store/use-workspace";

export function useStats() {
  const { activeWorkspace } = useWorkspace();

  const getUserStats = async () => {
    if (!activeWorkspace) return null;

    const { isPersonal, id: workspaceId } = activeWorkspace;

    try {
      const { data: response } = await axiosFetch.get<Response>(
        `/overview${isPersonal ? "?personal=true" : `?teamId=${workspaceId}`}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  };

  return { getUserStats };
}
