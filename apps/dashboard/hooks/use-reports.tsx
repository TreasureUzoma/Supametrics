import axiosFetch from "@repo/ui/lib/axios";
import { Report } from "@repo/ui/types";
import { useQuery } from "@tanstack/react-query";

export const useReports = (projectId: string) => {
  const { data, isLoading, error } = useQuery<Report>({
    queryKey: ["reports", projectId],
    queryFn: async () => {
      const { data: res } = await axiosFetch(`/reports/${projectId}}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  return { data, isLoading, error };
};
