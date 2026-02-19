import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, AlertCircle, Loader2, Building2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import {
  useTypeLogementsAdmin,
  useCreateTypeLogement,
  useUpdateTypeLogement,
  useDeleteTypeLogement,
} from "@/hooks/useTypeLogements";
import type { TypeLogement } from "@/api/typeLogement";
import ConfirmModal from "@/components/admin/ConfirmModal";

// ─── Schéma ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  nom:   z.string().min(2, "Minimum 2 caractères").max(50),
  image: z.string().url("URL invalide").or(z.literal("")).optional(),
  ordre: z.coerce.number().int().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

// ─── Modal de formulaire ──────────────────────────────────────────────────────

function TypeForm({
  initial,
  onClose,
  onSuccess,
}: {
  initial?: TypeLogement;
  onClose: () => void;
  onSuccess: (isEdit: boolean) => void;
}) {
  const create = useCreateTypeLogement();
  const update = useUpdateTypeLogement();
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom:   initial?.nom   ?? "",
      image: initial?.image ?? "",
      ordre: initial?.ordre ?? 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = { nom: data.nom, image: data.image || undefined, ordre: data.ordre };
    if (isEdit && initial) {
      await update.mutateAsync({ id: initial.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
    onSuccess(isEdit);
  };

  const error = create.error ?? update.error;
  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as any)?.message ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">
            {isEdit ? "Modifier le type" : "Nouveau type de logement"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Nom *</label>
            <input
              type="text"
              placeholder="ex : Appartement"
              {...register("nom")}
              className={`w-full h-10 rounded-xl border px-3 text-sm outline-none transition
                focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30
                ${errors.nom ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.nom && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.nom.message}
              </p>
            )}
          </div>

          {/* Image */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">URL de l'image</label>
            <input
              type="text"
              placeholder="https://..."
              {...register("image")}
              className={`w-full h-10 rounded-xl border px-3 text-sm outline-none transition
                focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30
                ${errors.image ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}
            />
            {errors.image && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.image.message}
              </p>
            )}
          </div>

          {/* Ordre */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Ordre d'affichage</label>
            <input
              type="number"
              min={0}
              {...register("ordre")}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm
                outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition"
            />
          </div>

          {/* Erreur serveur */}
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
                text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm
                font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TypesLogement() {
  const { data: types = [], isLoading } = useTypeLogementsAdmin();
  const deleteType  = useDeleteTypeLogement();
  const toggleActif = useUpdateTypeLogement();

  const [modalOpen, setModalOpen]         = useState(false);
  const [editing, setEditing]             = useState<TypeLogement | undefined>(undefined);
  const [deleteTarget, setDeleteTarget]   = useState<TypeLogement | null>(null);
  const [togglingId, setTogglingId]       = useState<string | null>(null);

  const openCreate = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit   = (t: TypeLogement) => { setEditing(t); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleFormSuccess = (isEdit: boolean) => {
    toast.success(isEdit ? "Type mis à jour avec succès" : "Type créé avec succès");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteType.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.nom}" a été supprimé`);
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
        setDeleteTarget(null);
      },
    });
  };

  const handleToggle = (t: TypeLogement) => {
    setTogglingId(t.id);
    toggleActif.mutate(
      { id: t.id, payload: { actif: !t.actif } },
      {
        onSuccess: () => {
          toast.success(t.actif ? `"${t.nom}" désactivé` : `"${t.nom}" activé`);
          setTogglingId(null);
        },
        onError: () => {
          toast.error("Erreur lors du changement de statut");
          setTogglingId(null);
        },
      },
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Gestion de biens
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Types de logement</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {types.length} type{types.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A843] hover:bg-[#C09535]
            text-white text-sm font-semibold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : types.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Aucun type de logement. Commencez par en créer un.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Aperçu
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Nom
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Slug
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Ordre
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {types.map((type) => {
                const isToggling = togglingId === type.id;
                return (
                  <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Image */}
                    <td className="px-5 py-3">
                      {type.image ? (
                        <img
                          src={type.image}
                          alt={type.nom}
                          className="w-12 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </td>

                    {/* Nom */}
                    <td className="px-4 py-3 font-semibold text-[#0C1A35]">{type.nom}</td>

                    {/* Slug */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        {type.slug}
                      </span>
                    </td>

                    {/* Ordre */}
                    <td className="px-4 py-3 text-center text-slate-500">{type.ordre}</td>

                    {/* Statut toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => !isToggling && handleToggle(type)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        title={type.actif ? "Désactiver" : "Activer"}
                      >
                        {isToggling ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            <span className="text-slate-400">...</span>
                          </>
                        ) : type.actif ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-600">Actif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-slate-300" />
                            <span className="text-slate-400">Inactif</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(type)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                            hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(type)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                            hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal formulaire */}
      {modalOpen && (
        <TypeForm
          initial={editing}
          onClose={closeModal}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer le type"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        isLoading={deleteType.isPending}
        onConfirm={handleDelete}
        onCancel={() => !deleteType.isPending && setDeleteTarget(null)}
      />
    </div>
  );
}
