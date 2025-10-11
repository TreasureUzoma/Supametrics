"use client";

import axiosFetch from "@repo/ui/lib/axios";
import { ReportsApiResponse } from "@repo/ui/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useReports = (
  projectId: string,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", projectId, page, limit],
    queryFn: async () => {
      const { data: res } = await axiosFetch<ReportsApiResponse>(
        `/reports/${projectId}?page=${page}&limit=${limit}`
      );
      return res;
    },
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, error };
};
