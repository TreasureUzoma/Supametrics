import axiosFetch from "@repo/ui/lib/axios";
import { Analytics } from "@repo/ui/types";
import { useQuery } from "@tanstack/react-query";

export const useAnalytics = (projectId: string) => {
  const { data, isLoading, error } = useQuery<Analytics>({
    queryKey: ["analytics", projectId],
    queryFn: async () => {
      const { data: res } = await axiosFetch(`analytics/${projectId}`);
      return res.data;
    },
  });
  return { data, isLoading, error };
};
