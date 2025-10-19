import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosFetch from "@repo/ui/lib/axios";
import { toast } from "sonner";

export interface Team {
  uuid: string;
  name: string;
  role: string;
  email: string; // for members
}

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data: res } = await axiosFetch.get("/teams");
      if (!res.success) throw new Error("Failed to fetch teams");
      return res.data.teams;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateTeamName = (id: string, name: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.patch(`/teams/${id}`, { name });
      return res;
    },
    onSuccess: () => {
      toast.success("Team name updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update team name");
      } else {
        toast.error("Failed to update team name");
      }
    },
  });
};

export const useTeamMembers = (teamId: string | null) => {
  return useQuery<Team[]>({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data: res } = await axiosFetch.get(`/teams/${teamId}/members`);
      if (!res.success) throw new Error("Failed to fetch team members");
      return res.data.members;
    },
    enabled: !!teamId,
  });
};

export const useRemoveTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: res } = await axiosFetch.delete(
        `/teams/${teamId}/members/${userId}`
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to remove member");
      } else {
        toast.error("Failed to remove member");
      }
    },
  });
};

export const useLeaveTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.post(`/teams/${teamId}/leave`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Left team successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to leave team"
      );
    },
  });
};
