import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingVerificationsApi,
  getPendingVerificationsCountApi,
  approveVerificationApi,
  rejectVerificationApi,
  type PendingVerification,
} from "@/api/ownerAuth";

export function usePendingVerificationsCount() {
  return useQuery({
    queryKey: ["adminPendingVerificationsCount"],
    queryFn: async () => {
      const { data } = await getPendingVerificationsCountApi();
      // L'API retourne { status: "success", data: { count: number } }
      return data.data.count;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function usePendingVerifications() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["adminPendingVerifications"],
    queryFn: async () => {
      const { data } = await getPendingVerificationsApi();
      return data.data;
    },
    onSuccess: (data) => {
      // whenever we fetch the list we also want to update the badge count
      queryClient.setQueryData<number>(["adminPendingVerificationsCount"], data.length);
    },
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proprietaireId: string) =>
      approveVerificationApi(proprietaireId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerifications"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerificationsCount"] });
    },
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proprietaireId, motif }: { proprietaireId: string; motif: string }) =>
      rejectVerificationApi(proprietaireId, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerifications"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerificationsCount"] });
    },
  });
}
