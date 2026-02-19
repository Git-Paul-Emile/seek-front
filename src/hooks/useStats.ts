import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/api/stats";

export const useStats = () =>
  useQuery({
    queryKey: ["site-stats"],
    queryFn:  fetchStats,
    staleTime: 5 * 60 * 1000, // 5 min
  });
