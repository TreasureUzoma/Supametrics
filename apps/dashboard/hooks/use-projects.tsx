"use client";

import { useState } from "react";
import axiosFetch from "@repo/ui/lib/axios";
import { Project, ProjectId, Response } from "@repo/ui/types";
import { useWorkspace } from "@/store/use-workspace";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProjectsResponse {
  projects: Project[];
  pagination?: {
    totalPages: number;
  };
}

export function useProjects(limit = 10) {
  const { activeWorkspace } = useWorkspace();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"personal" | "team" | undefined>(undefined);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const query = useInfiniteQuery<ProjectsResponse>({
    queryKey: ["projects", activeWorkspace?.uuid, limit, search, sort],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!activeWorkspace)
        return { projects: [], pagination: { totalPages: 1 } };

      const { isPersonal, uuid: workspaceId } = activeWorkspace;
      const { data: response } = await axiosFetch.get<Response>(
        `/projects?type=${isPersonal ? "personal" : "team"}${
          !isPersonal ? `&teamId=${workspaceId}` : ""
        }&page=${pageParam}&limit=${limit}&sort=${sort}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`
      );

      return response.data as ProjectsResponse;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.pagination?.totalPages ?? 1;
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: !!activeWorkspace,
  });

  const projects =
    query.data?.pages.flatMap((page) => page.projects ?? []) ?? [];
  const hasMore = !!query.hasNextPage;
  const loading = query.isFetching;
  const loadMore = () => query.fetchNextPage();
  const refresh = () => query.refetch();

  return {
    projects,
    loading,
    hasMore,
    loadMore,
    refresh,
    search,
    setSearch,
    type,
    setType,
    sort,
    setSort,
  };
}

export const useProjectId = (id: string) => {
  return useQuery<ProjectId>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data: res } = await axiosFetch.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

interface UpdatePayloadType {
  name: string;
  description: string;
}

export const useUpdateProject = (id: string, body: UpdatePayloadType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.patch(`/projects/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"], exact: false });
      toast.success("Project description updated successfully");
    },
    onError: (error) => {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error?.message || "Failed to update project");
      } else {
        toast.error("Failed to update project", error);
      }
    },
  });
};

interface InvitePayloadType {
  email: string;
  role: string;
}

export const useUpdateProjectTeamMembers = (
  id: string,
  payload: InvitePayloadType
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.post(
        `/projects/${id}/invite`,
        payload
      );
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["projects"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["project-members"],
        exact: false,
      });
      console.log(res);
      toast.success(
        res?.message || `Invite sent to ${payload.email} successfully`
      );
    },
    onError: (error) => {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error?.message || "Failed to update project");
      } else {
        toast.error("Failed to update project", error);
      }
    },
  });
};

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
}

export const useGetProjectMembers = (id: string) => {
  return useQuery<Member[]>({
    queryKey: ["project-members", id],
    queryFn: async () => {
      const { data: res } = await axiosFetch.get(`/projects/${id}/members`);
      return res.members;
    },
    enabled: !!id,
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axiosFetch.delete(
        `/projects/${projectId}/${userId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", projectId],
      });
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error?.message ?? "Failed to remove member");
      } else {
        toast.error("Failed to remove members");
      }
    },
  });
};

export const useLeaveProject = (projectId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.delete(
        `/projects/${projectId}/leave`
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members"],
        exact: false,
      });
      toast.success("Left project successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error?.message ?? "Failed to exit project #1078");
      } else {
        toast.error("Failed to exit project");
      }
    },
  });
};

export const useDeleteProject = (projectId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: res } = await axiosFetch.delete(`/projects/${projectId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
        exact: false,
      });
      toast.success("Left project successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error?.message ?? "Failed to delete project #1079");
      } else {
        toast.error("Failed to delete project");
      }
    },
  });
};
