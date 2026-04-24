import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOwnerDiditSessionApi,
  createLocataireDiditSessionApi,
  type DiditSessionData,
} from "@/api/didit";

export function useCreateOwnerDiditSession() {
  return useMutation<DiditSessionData, Error, void>({
    mutationFn: createOwnerDiditSessionApi,
  });
}

export function useCreateLocataireDiditSession() {
  const queryClient = useQueryClient();
  return useMutation<DiditSessionData, Error, void>({
    mutationFn: createLocataireDiditSessionApi,
    onSuccess: () => {
      // Mark verification as pending so the UI refreshes after modal closes
      queryClient.invalidateQueries({ queryKey: ["locataireVerification"] });
    },
  });
}
