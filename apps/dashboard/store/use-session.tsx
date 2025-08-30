"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import axiosFetch from "@repo/ui/lib/axios";
import { Response } from "@repo/ui/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

async function fetchSession() {
  const { data: res } = await axiosFetch.get<Response>("/api/session");
  if (!res.success) throw new Error("Failed to fetch session");
  return res.data;
}

interface SessionState {
  user: any | null;
  setUser: (user: any | null) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "session-storage" }
  )
);

export function useSession() {
  const { user, setUser, clearUser } = useSessionStore();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data.user);
    }
  }, [query.isSuccess, query.data, setUser]);

  useEffect(() => {
    if (query.error) {
      if ((query.error as any).response?.status === 401) {
        clearUser();
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
      } else {
        toast.error("Failed to load session. Please try again later.");
      }
    }
  }, [query.isError, query.error, clearUser, router]);

  return {
    user,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
