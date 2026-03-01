import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLocataireEcheancierApi,
  payerEcheancesLocataireApi,
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
