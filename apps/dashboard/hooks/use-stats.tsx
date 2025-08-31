"use client";

import axiosFetch from "@repo/ui/lib/axios";
import { Response } from "@repo/ui/types";
import { useWorkspace } from "@/store/use-workspace";

import { useCallback } from "react";

export function useStats() {
  const { activeWorkspace } = useWorkspace();

  const getUserStats = useCallback(async () => {
    if (!activeWorkspace) return null;

    const { isPersonal, uuid: workspaceId } = activeWorkspace;

    try {
      const { data: response } = await axiosFetch.get<Response>(
        `/overview${isPersonal ? "?personal=true" : `?teamId=${workspaceId}`}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  }, [activeWorkspace]);

  return { getUserStats };
}
