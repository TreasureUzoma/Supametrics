import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosFetch from "@repo/ui/lib/axios";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newProject: {
      name: string;
      type?: string;
      url?: string;
      teamId?: string;
    }) => {
      const { data: res } = await axiosFetch.post("/projects/new", newProject);

      if (res.success === false) {
        const err = await res;
        throw new Error(err.message || "Failed to create project");
      }

      return res;
    },

    onSuccess: () => {
      toast.success("Project created successfully!");

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },

    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  return mutation;
};
