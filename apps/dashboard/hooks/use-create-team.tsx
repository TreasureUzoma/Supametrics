import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosFetch from "@repo/ui/lib/axios";

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      const { data: res } = await axiosFetch.post("/teams", newTeam);

      if (res.success === false) {
        const err = await res;
        throw new Error(err.message || err.error || "Failed to create team");
      }

      return res;
    },

    onSuccess: () => {
      toast.success("Team created successfully!");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },

    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  return mutation;
};
