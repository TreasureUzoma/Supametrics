"use client";

import axiosFetch from "@repo/ui/lib/axios";
import { Response } from "@repo/ui/types";
import { useRouter } from "next/navigation";
import { useSession } from "@/store/use-session";

export function useLogout() {
  const router = useRouter();
  const { clearUser } = useSession();

  const logout = async () => {
    try {
      await axiosFetch.get<Response>("/session/signout");
      clearUser();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/login");
    }
  };

  return logout;
}
