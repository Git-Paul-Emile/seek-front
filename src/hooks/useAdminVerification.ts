import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  getPendingVerificationsApi,
  getPendingVerificationsCountApi,
  approveVerificationApi,
  rejectVerificationApi,
  type PendingVerification,
} from "@/api/ownerAuth";
import { useEffect } from "react";
import { socketService, EVENTS } from "@/services/socketService";

export function usePendingVerificationsCount() {
  const queryClient = useQueryClient();

  const query = useQuery<number, Error>({
    queryKey: ["adminPendingVerificationsCount"],
    queryFn: async () => {
      const { data } = await getPendingVerificationsCountApi();
      // L'API retourne { status: "success", data: { count: number } }
      return data.data.count;
    },
    staleTime: 30 * 1000,
  });

  // Écouter les mises à jour en temps réel du compteur
  useEffect(() => {
    // Se connecter au socket et rejoindre la room admin
    socketService.connect();
    socketService.joinAdmin();

    // Souscrire aux mises à jour du compteur
    const unsubCount = socketService.onVerificationCountUpdate((data: { count: number }) => {
      queryClient.setQueryData(["adminPendingVerificationsCount"], data.count);
    });

    // Souscrire aux nouvelles vérifications
    const unsubNew = socketService.onVerificationSubmitted(() => {
      // Rafraîchir les données quand une nouvelle vérification est soumise
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerificationsCount"] });
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerifications"] });
    });

    return () => {
      unsubCount();
      unsubNew();
    };
  }, [queryClient]);

  return query;
}

export function usePendingVerifications(): UseQueryResult<PendingVerification[], Error> {
  const queryClient = useQueryClient();
  
  const query = useQuery<PendingVerification[], Error>({
    queryKey: ["adminPendingVerifications"],
    queryFn: async () => {
      const { data } = await getPendingVerificationsApi();
      return data.data;
    },
  });

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    // Souscrire aux nouvelles vérifications - rafraichir automatiquement
    const unsubNew = socketService.onVerificationSubmitted(() => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingVerifications"] });
    });

    return () => {
      unsubNew();
    };
  }, [queryClient]);

  return query;
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
