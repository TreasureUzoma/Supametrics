import axiosFetch from "@repo/ui/lib/axios";
import { Analytics } from "@repo/ui/types";
import { useQuery } from "@tanstack/react-query";
import { useAnalyticsStore } from "@/store/use-analytics-store";

export const useAnalytics = (projectId: string) => {
  const { filter, from, to } = useAnalyticsStore();

  const { data, isLoading, error } = useQuery<Analytics>({
    queryKey: ["analytics", projectId, filter, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("filter", filter);
      if (from && to) {
        params.append("from", from);
        params.append("to", to);
      }

      const { data: res } = await axiosFetch(
        `analytics/${projectId}?${params.toString()}`
      );
      return res.data;

      /* const res = await fetch("/api/analytics/id");
      const json = await res.json();
      console.log(json.data);
      return json.data; */
    },
    enabled: !!projectId,
  });

  return { data, isLoading, error };
};
