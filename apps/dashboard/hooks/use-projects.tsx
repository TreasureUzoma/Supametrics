"use client";

import { useCallback, useState, useEffect } from "react";
import axiosFetch from "@repo/ui/lib/axios";
import { Response } from "@repo/ui/types";
import { useWorkspace } from "@/store/use-workspace";

export function useProjects(limit = 10) {
  const { activeWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // search query
  const [type, setType] = useState<"personal" | "team" | undefined>(undefined); // filter type
  const [sort, setSort] = useState<"newest" | "oldest">("newest"); // sort filter

  const fetchProjects = useCallback(
    async (pageNum = 1) => {
      if (!activeWorkspace) return;

      setLoading(true);

      const { isPersonal, uuid: workspaceId } = activeWorkspace;

      try {
        const { data: response } = await axiosFetch.get<Response>(
          `/projects?type=${isPersonal ? "personal" : "team"}${
            !isPersonal ? `&teamId=${workspaceId}` : ""
          }&page=${pageNum}&limit=${limit}&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ""}`
        );

        if (response.success && response.data.projects) {
          setProjects((prev) =>
            pageNum === 1
              ? response.data.projects
              : [...prev, ...response.data.projects]
          );

          const totalPages = response.pagination?.totalPages ?? 1;
          setHasMore(pageNum < totalPages);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeWorkspace, limit, search, type, sort]
  );

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage);
  };

  useEffect(() => {
    if (!activeWorkspace) return;
    setProjects([]);
    setPage(1);
    setHasMore(true);
    fetchProjects(1);
  }, [activeWorkspace, fetchProjects]);

  return {
    projects,
    loading,
    hasMore,
    loadMore,
    refresh: () => fetchProjects(1),
    search,
    setSearch,
    type,
    setType,
    sort,
    setSort,
  };
}
