import { useQuery } from "@tanstack/react-query";
import { getLocataireEcheancierApi } from "@/api/locataireAuth";

export const useLocataireEcheancier = (enabled: boolean) =>
  useQuery({
    queryKey: ["locataire-echeancier"],
    queryFn: getLocataireEcheancierApi,
    enabled,
  });
