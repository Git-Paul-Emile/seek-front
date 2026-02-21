import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBien, fetchBiens, fetchBienById, soumettreAnnonce, deleteBien, retourBrouillon, type CreateBienPayload } from "@/api/bien";

const QK = "biens";

export const useBiens = () =>
  useQuery({ queryKey: [QK], queryFn: fetchBiens, staleTime: 2 * 60 * 1000 });

export const useBienById = (id: string) =>
  useQuery({
    queryKey: [QK, id],
    queryFn: () => fetchBienById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

export const useCreateBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      photos,
    }: {
      payload: CreateBienPayload;
      photos: File[];
    }) => createBien(payload, photos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useSoumettreBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => soumettreAnnonce(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useDeleteBien = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBien(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useRetourBrouillon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retourBrouillon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};
