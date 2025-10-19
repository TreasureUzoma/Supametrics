"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import axiosFetch from "@repo/ui/lib/axios";
import { Response, User } from "@repo/ui/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

async function fetchSession() {
  const { data: res } = await axiosFetch.get<Response>("/session");
  if (!res.success) throw new Error("Failed to fetch session");
  return res.data;
}

interface SessionState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      clearUser: () => set({ user: null }),
    }),
    { name: "session-storage" }
  )
);

export function useSession() {
  const { user, setUser, clearUser, loading, setLoading } = useSessionStore();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await fetchSession();
        return data;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (query.isSuccess && query.data?.user) {
      setUser(query.data.user);
    }
  }, [query.isSuccess, query.data, setUser]);

  useEffect(() => {
    if (query.isError) {
      if (
        query.error instanceof Error &&
        query.error.message === "Unauthorized"
      ) {
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
    loading: loading || query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    clearUser,
  };
}
