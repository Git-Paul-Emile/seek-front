import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLocatairesApi,
  getLocataireByIdApi,
  createLocataireApi,
  updateLocataireApi,
  deleteLocataireApi,
  getLienActivationApi,
  type CreateLocatairePayload,
  type UpdateLocatairePayload,
} from "@/api/locataire";

const QK = "locataires";

export const useLocataires = () =>
  useQuery({
    queryKey: [QK],
    queryFn: getLocatairesApi,
    staleTime: 2 * 60 * 1000,
  });

export const useLocataireById = (id: string) =>
  useQuery({
    queryKey: [QK, id],
    queryFn: () => getLocataireByIdApi(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

export const useCreateLocataire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLocatairePayload) => createLocataireApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useUpdateLocataire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLocatairePayload }) =>
      updateLocataireApi(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, id] });
    },
  });
};

export const useDeleteLocataire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLocataireApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useGetLienActivation = () =>
  useMutation({
    mutationFn: (id: string) => getLienActivationApi(id),
  });
