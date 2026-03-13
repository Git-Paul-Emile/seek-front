import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBien,
  fetchBiens,
  fetchBienById,
  fetchOwnerStats,
  soumettreAnnonce,
  deleteBien,
  retourBrouillon,
  annulerAnnonce,
  soumettreRevision as soumettreRevisionApi,
  fetchStatsVuesBien,
  fetchStatsVuesOwner,
  fetchAdminStatsVues,
  fetchStatsFavorisOwner,
  fetchStatsFavorisBien,
  type CreateBienPayload,
} from "@/api/bien";

const QK = "biens";

export const useBiens = () =>
  useQuery({ queryKey: [QK], queryFn: fetchBiens, staleTime: 2 * 60 * 1000 });

export const useOwnerStats = () =>
  useQuery({
    queryKey: [QK, "stats"],
    queryFn: fetchOwnerStats,
    staleTime: 2 * 60 * 1000,
  });

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

export const useAnnulerAnnonce = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => annulerAnnonce(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};

export const useSoumettreRevision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      photos,
    }: {
      id: string;
      payload: CreateBienPayload;
      photos: File[];
    }) => soumettreRevisionApi(id, payload, photos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });
};


export const useStatsVuesBien = (bienId: string | undefined) =>
  useQuery({
    queryKey: ["stats-vues-bien", bienId],
    queryFn: () => fetchStatsVuesBien(bienId!),
    enabled: !!bienId,
    staleTime: 60 * 1000,
  });

export const useStatsVuesOwner = () =>
  useQuery({
    queryKey: ["stats-vues-owner"],
    queryFn: fetchStatsVuesOwner,
    staleTime: 60 * 1000,
  });

export const useAdminStatsVues = () =>
  useQuery({
    queryKey: ["admin-stats-vues"],
    queryFn: fetchAdminStatsVues,
    staleTime: 60 * 1000,
  });

export const useStatsFavorisOwner = () =>
  useQuery({
    queryKey: ["stats-favoris-owner"],
    queryFn: fetchStatsFavorisOwner,
    staleTime: 60 * 1000,
  });

export const useStatsFavorisBien = (bienId: string | undefined) =>
  useQuery({
    queryKey: ["stats-favoris-bien", bienId],
    queryFn: () => fetchStatsFavorisBien(bienId!),
    enabled: !!bienId,
    staleTime: 60 * 1000,
  });
