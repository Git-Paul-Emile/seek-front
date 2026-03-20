import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLocataireEcheancierApi,
  payerEcheancesLocataireApi,
  getLocataireHistoriqueApi,
  supprimerCompteLocataireApi,
  type PayerEcheancesLocatairePayload,
} from "@/api/locataireAuth";

export const useLocataireEcheancier = (enabled: boolean) =>
  useQuery({
    queryKey: ["locataire-echeancier"],
    queryFn: getLocataireEcheancierApi,
    enabled,
  });

export const usePayerEcheancesLocataire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayerEcheancesLocatairePayload) =>
      payerEcheancesLocataireApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locataire-echeancier"] });
    },
  });
};

export const useLocataireHistorique = () =>
  useQuery({
    queryKey: ["locataire-historique"],
    queryFn: getLocataireHistoriqueApi,
    staleTime: 2 * 60 * 1000,
  });

export const useSupprimerCompteLocataire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supprimerCompteLocataireApi,
    onSuccess: () => {
      qc.clear();
    },
  });
};
