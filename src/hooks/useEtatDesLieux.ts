import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEtatDesLieuxItemApi,
  addEtatDesLieuxPhotoApi,
  createEtatDesLieuxApi,
  deleteEtatDesLieuxItemApi,
  deleteEtatDesLieuxPhotoApi,
  getEtatsDesLieuxApi,
  signerEtatDesLieuxOwnerApi,
  updateEtatDesLieuxApi,
  updateEtatDesLieuxItemApi,
  type EtatElement,
  type StatutEtatDesLieux,
  type TypeEtatDesLieux,
} from "@/api/etatDesLieux";

const qk = "etat-des-lieux";

export const useEtatsDesLieux = (bienId: string, bailId: string) =>
  useQuery({
    queryKey: [qk, bienId, bailId],
    queryFn: () => getEtatsDesLieuxApi(bienId, bailId),
    enabled: !!bienId && !!bailId,
    staleTime: 60 * 1000,
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>, bienId: string, bailId: string) =>
  qc.invalidateQueries({ queryKey: [qk, bienId, bailId] });

export const useCreateEtatDesLieux = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      payload,
    }: {
      bienId: string;
      bailId: string;
      payload: { type: TypeEtatDesLieux; dateEtat?: string; commentaireGlobal?: string | null };
    }) => createEtatDesLieuxApi(bienId, bailId, payload),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useUpdateEtatDesLieux = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      payload,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      payload: { dateEtat?: string; commentaireGlobal?: string | null; statut?: StatutEtatDesLieux };
    }) => updateEtatDesLieuxApi(bienId, bailId, etatDesLieuxId, payload),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useSignerEtatDesLieuxOwner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
    }) => signerEtatDesLieuxOwnerApi(bienId, bailId, etatDesLieuxId),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useAddEtatDesLieuxItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      payload,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      payload: { piece: string; element: string; etat: EtatElement; commentaire?: string; ordre?: number };
    }) => addEtatDesLieuxItemApi(bienId, bailId, etatDesLieuxId, payload),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useUpdateEtatDesLieuxItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      itemId,
      payload,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      itemId: string;
      payload: Partial<{ piece: string; element: string; etat: EtatElement; commentaire: string; ordre: number }>;
    }) => updateEtatDesLieuxItemApi(bienId, bailId, etatDesLieuxId, itemId, payload),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useDeleteEtatDesLieuxItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      itemId,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      itemId: string;
    }) => deleteEtatDesLieuxItemApi(bienId, bailId, etatDesLieuxId, itemId),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useAddEtatDesLieuxPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      itemId,
      photo,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      itemId: string;
      photo: File;
    }) => addEtatDesLieuxPhotoApi(bienId, bailId, etatDesLieuxId, itemId, photo),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};

export const useDeleteEtatDesLieuxPhoto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      etatDesLieuxId,
      itemId,
      photoId,
    }: {
      bienId: string;
      bailId: string;
      etatDesLieuxId: string;
      itemId: string;
      photoId: string;
    }) => deleteEtatDesLieuxPhotoApi(bienId, bailId, etatDesLieuxId, itemId, photoId),
    onSuccess: (_data, vars) => invalidate(qc, vars.bienId, vars.bailId),
  });
};
