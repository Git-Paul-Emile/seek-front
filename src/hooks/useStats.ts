import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchAdminStats } from "@/api/stats";

export const useStats = () =>
  useQuery({
    queryKey: ["site-stats"],
    queryFn:  fetchStats,
    staleTime: 5 * 60 * 1000, // 5 min
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn:  fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 min
  });
