import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Pencil, Trash2, X, AlertCircle, Loader2,
  Sofa, Zap, ToggleLeft, ToggleRight, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useMeublesAdmin, useCreateMeubles, useUpdateMeuble, useDeleteMeuble } from "@/hooks/useMeubles";
import { useEquipementsAdmin, useCreateEquipements, useUpdateEquipement, useDeleteEquipement } from "@/hooks/useEquipements";
import type { Meuble } from "@/api/meuble";
import type { Equipement } from "@/api/equipement";
import ConfirmModal from "@/components/admin/ConfirmModal";

// ─── Catégories disponibles ───────────────────────────────────────────────────

export const CATEGORIES = [
  "Salon",
  "Chambre",
  "Cuisine",
  "Salle de bain",
  "Bureau",
  "Équipements généraux",
  "Local commercial",
  "Immeuble",
] as const;
export type Categorie = typeof CATEGORIES[number];

// ─── Types internes ───────────────────────────────────────────────────────────

type Item = { id: string; nom: string; categorie: string; actif: boolean };

// ─── Schémas Zod ─────────────────────────────────────────────────────────────

const addSchema = z.object({
  categorie:   z.string().min(1, "Sélectionnez une catégorie"),
  meubles:     z.string(),
  equipements: z.string(),
});
type AddFormData = z.infer<typeof addSchema>;

const editSchema = z.object({
  nom:       z.string().min(2, "Minimum 2 caractères").max(100),
  categorie: z.string().min(1, "Sélectionnez une catégorie"),
});
type EditFormData = z.infer<typeof editSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseLines(raw: string): string[] {
  return raw.split("\n").map((s) => s.trim()).filter((s) => s.length >= 2);
}

// ─── Pill catégorie ───────────────────────────────────────────────────────────

function CategoriePill({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
      bg-[#D4A843]/10 text-[#B8922E] border border-[#D4A843]/20">
      <Tag className="w-2.5 h-2.5" />
      {value}
    </span>
  );
}

// ─── Select catégorie ─────────────────────────────────────────────────────────

function CategorieSelect({ value, onChange, error }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500">Catégorie *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 rounded-xl border px-3 text-sm outline-none transition bg-slate-50
          focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30
          ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
      >
        <option value="">-- Choisir une catégorie --</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Modal ajout ─────────────────────────────────────────────────────────────

function AddModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const createMeubles     = useCreateMeubles();
  const createEquipements = useCreateEquipements();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<AddFormData>({
      defaultValues: { categorie: "", meubles: "", equipements: "" },
      resolver: zodResolver(addSchema),
    });

  const categorie = watch("categorie");

  const onSubmit = async (data: AddFormData) => {
    setGlobalError(null);
    const mItems = parseLines(data.meubles).map((nom) => ({ nom, categorie: data.categorie }));
    const eItems = parseLines(data.equipements).map((nom) => ({ nom, categorie: data.categorie }));

    if (mItems.length === 0 && eItems.length === 0) {
      setGlobalError("Renseignez au moins un élément (meuble ou équipement).");
      return;
    }

    try {
      const promises: Promise<any>[] = [];
      if (mItems.length > 0) promises.push(createMeubles.mutateAsync({ items: mItems }));
      if (eItems.length > 0) promises.push(createEquipements.mutateAsync({ items: eItems }));
      await Promise.all(promises);
      onClose();
      onSuccess();
    } catch (err: any) {
      setGlobalError(err?.response?.data?.message ?? err?.message ?? "Une erreur est survenue.");
    }
  };

  const textAreaCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none " +
    "focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">Ajouter des éléments</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <CategorieSelect
            value={categorie}
            onChange={(v) => setValue("categorie", v, { shouldValidate: true })}
            error={errors.categorie?.message}
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-1.5">
                <Sofa className="w-3.5 h-3.5" /> Meubles
              </p>
              <p className="text-[11px] text-slate-400 mb-1">Un nom par ligne (min. 2 caractères)</p>
              <textarea
                {...register("meubles")} rows={6}
                placeholder={"Canapé\nTable basse\nBibliothèque"}
                className={textAreaCls}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Équipements
              </p>
              <p className="text-[11px] text-slate-400 mb-1">Un nom par ligne (min. 2 caractères)</p>
              <textarea
                {...register("equipements")} rows={6}
                placeholder={"Climatisation\nVentilateur\nTélévision"}
                className={textAreaCls}
              />
            </div>
          </div>

          {globalError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{globalError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
                text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm
                font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal édition ────────────────────────────────────────────────────────────

function EditModal({ initial, onClose, onSave }: {
  initial: Item;
  onClose: () => void;
  onSave: (id: string, nom: string, categorie: string) => Promise<void>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<EditFormData>({
      resolver: zodResolver(editSchema),
      defaultValues: { nom: initial.nom, categorie: initial.categorie },
    });

  const categorie = watch("categorie");

  const onSubmit = async (data: EditFormData) => {
    setServerError(null);
    try {
      await onSave(initial.id, data.nom, data.categorie);
      onClose();
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? err?.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">Modifier</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Nom *</label>
            <input
              type="text" {...register("nom")}
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

          <CategorieSelect
            value={categorie}
            onChange={(v) => setValue("categorie", v, { shouldValidate: true })}
            error={errors.categorie?.message}
          />

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
                text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm
                font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tableau générique ────────────────────────────────────────────────────────

function ItemTable({ title, icon: Icon, color, items, isLoading, emptyMessage,
  togglingId, onToggle, onEdit, onDelete, showCategorie }: {
  title: string;
  icon: React.ElementType;
  color: string;
  items: Item[];
  isLoading: boolean;
  emptyMessage: string;
  togglingId: string | null;
  onToggle: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  showCategorie: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">{items.length}</span>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4A843]" />
        </div>
      ) : items.length === 0 ? (
        <p className="p-8 text-center text-slate-400 text-sm">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
              {showCategorie && (
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Catégorie</th>
              )}
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => {
              const isToggling = togglingId === item.id;
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-[#0C1A35]">{item.nom}</td>

                  {showCategorie && (
                    <td className="px-4 py-2.5">
                      <CategoriePill value={item.categorie} />
                    </td>
                  )}

                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => !isToggling && onToggle(item)}
                      disabled={isToggling}
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {isToggling ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      ) : item.actif ? (
                        <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Actif</span></>
                      ) : (
                        <><ToggleLeft className="w-5 h-5 text-slate-300" /><span className="text-slate-400">Inactif</span></>
                      )}
                    </button>
                  </td>

                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                          hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors" title="Modifier">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                          hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
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
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MeubleEquipement() {
  const { data: meubles     = [], isLoading: mLoading } = useMeublesAdmin();
  const { data: equipements  = [], isLoading: eLoading } = useEquipementsAdmin();

  const updateMeuble     = useUpdateMeuble();
  const deleteMeubleHook = useDeleteMeuble();
  const updateEquip      = useUpdateEquipement();
  const deleteEquipHook  = useDeleteEquipement();

  const [activeTab,          setActiveTab]          = useState<string>("Tous");
  const [addOpen,            setAddOpen]            = useState(false);
  const [editingMeuble,      setEditingMeuble]      = useState<Meuble | null>(null);
  const [editingEquip,       setEditingEquip]       = useState<Equipement | null>(null);
  const [deleteMeubleTarget, setDeleteMeubleTarget] = useState<Meuble | null>(null);
  const [deleteEquipTarget,  setDeleteEquipTarget]  = useState<Equipement | null>(null);
  const [togglingMeubleId,   setTogglingMeubleId]   = useState<string | null>(null);
  const [togglingEquipId,    setTogglingEquipId]    = useState<string | null>(null);

  const filteredMeubles    = activeTab === "Tous" ? meubles    : meubles.filter((m) => m.categorie === activeTab);
  const filteredEquipements = activeTab === "Tous" ? equipements : equipements.filter((e) => e.categorie === activeTab);
  const showCategorie = activeTab === "Tous";

  const tabs = [
    { label: "Tous", count: meubles.length + equipements.length },
    ...CATEGORIES.map((cat) => ({
      label: cat,
      count:
        meubles.filter((m) => m.categorie === cat).length +
        equipements.filter((e) => e.categorie === cat).length,
    })),
  ];

  // ── Handlers Meubles ──
  const handleToggleMeuble = (item: Item) => {
    setTogglingMeubleId(item.id);
    updateMeuble.mutate(
      { id: item.id, payload: { actif: !item.actif } },
      {
        onSuccess: () => { toast.success(item.actif ? `"${item.nom}" désactivé` : `"${item.nom}" activé`); setTogglingMeubleId(null); },
        onError:   () => { toast.error("Erreur lors du changement de statut"); setTogglingMeubleId(null); },
      }
    );
  };

  const handleSaveMeuble = async (id: string, nom: string, categorie: string) => {
    await updateMeuble.mutateAsync({ id, payload: { nom, categorie } });
    toast.success("Meuble mis à jour");
  };

  const handleDeleteMeuble = () => {
    if (!deleteMeubleTarget) return;
    deleteMeubleHook.mutate(deleteMeubleTarget.id, {
      onSuccess: () => { toast.success(`"${deleteMeubleTarget.nom}" supprimé`); setDeleteMeubleTarget(null); },
      onError:   () => { toast.error("Erreur lors de la suppression"); setDeleteMeubleTarget(null); },
    });
  };

  // ── Handlers Équipements ──
  const handleToggleEquip = (item: Item) => {
    setTogglingEquipId(item.id);
    updateEquip.mutate(
      { id: item.id, payload: { actif: !item.actif } },
      {
        onSuccess: () => { toast.success(item.actif ? `"${item.nom}" désactivé` : `"${item.nom}" activé`); setTogglingEquipId(null); },
        onError:   () => { toast.error("Erreur lors du changement de statut"); setTogglingEquipId(null); },
      }
    );
  };

  const handleSaveEquip = async (id: string, nom: string, categorie: string) => {
    await updateEquip.mutateAsync({ id, payload: { nom, categorie } });
    toast.success("Équipement mis à jour");
  };

  const handleDeleteEquip = () => {
    if (!deleteEquipTarget) return;
    deleteEquipHook.mutate(deleteEquipTarget.id, {
      onSuccess: () => { toast.success(`"${deleteEquipTarget.nom}" supprimé`); setDeleteEquipTarget(null); },
      onError:   () => { toast.error("Erreur lors de la suppression"); setDeleteEquipTarget(null); },
    });
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <Sofa className="w-3.5 h-3.5" />
            Gestion de biens
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Meublé / Équipement</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {meubles.length} meuble{meubles.length > 1 ? "s" : ""} · {equipements.length} équipement{equipements.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A843] hover:bg-[#C09535]
            text-white text-sm font-semibold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Onglets catégories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${activeTab === tab.label
                ? "bg-[#0C1A35] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-500 hover:border-[#D4A843] hover:text-[#D4A843]"
              }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full
              ${activeTab === tab.label ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Deux tableaux côte à côte */}
      <div className="grid grid-cols-2 gap-6">
        <ItemTable
          title="Meubles"
          icon={Sofa}
          color="bg-amber-50 text-amber-500"
          items={filteredMeubles}
          isLoading={mLoading}
          emptyMessage="Aucun meuble dans cette catégorie."
          togglingId={togglingMeubleId}
          onToggle={handleToggleMeuble}
          onEdit={(item) => setEditingMeuble(item as Meuble)}
          onDelete={(item) => setDeleteMeubleTarget(item as Meuble)}
          showCategorie={showCategorie}
        />

        <ItemTable
          title="Équipements"
          icon={Zap}
          color="bg-blue-50 text-blue-500"
          items={filteredEquipements}
          isLoading={eLoading}
          emptyMessage="Aucun équipement dans cette catégorie."
          togglingId={togglingEquipId}
          onToggle={handleToggleEquip}
          onEdit={(item) => setEditingEquip(item as Equipement)}
          onDelete={(item) => setDeleteEquipTarget(item as Equipement)}
          showCategorie={showCategorie}
        />
      </div>

      {/* Modal ajout */}
      {addOpen && (
        <AddModal onClose={() => setAddOpen(false)} onSuccess={() => toast.success("Éléments créés avec succès")} />
      )}

      {/* Modals édition */}
      {editingMeuble && (
        <EditModal initial={editingMeuble} onClose={() => setEditingMeuble(null)} onSave={handleSaveMeuble} />
      )}
      {editingEquip && (
        <EditModal initial={editingEquip} onClose={() => setEditingEquip(null)} onSave={handleSaveEquip} />
      )}

      {/* Modals confirmation suppression */}
      <ConfirmModal
        open={deleteMeubleTarget !== null}
        title="Supprimer le meuble"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteMeubleTarget?.nom}" ?`}
        confirmLabel="Supprimer"
        isLoading={deleteMeubleHook.isPending}
        onConfirm={handleDeleteMeuble}
        onCancel={() => !deleteMeubleHook.isPending && setDeleteMeubleTarget(null)}
      />
      <ConfirmModal
        open={deleteEquipTarget !== null}
        title="Supprimer l'équipement"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteEquipTarget?.nom}" ?`}
        confirmLabel="Supprimer"
        isLoading={deleteEquipHook.isPending}
        onConfirm={handleDeleteEquip}
        onCancel={() => !deleteEquipHook.isPending && setDeleteEquipTarget(null)}
      />
    </div>
  );
}
