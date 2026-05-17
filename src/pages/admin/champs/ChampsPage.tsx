import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SlidersHorizontal, Plus, Pencil, Trash2, X, Loader2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useChampsAdmin, useCreateChamp, useUpdateChamp, useDeleteChamp } from "@/hooks/useChamp";
import { useCategoriesChamp } from "@/hooks/useCategorieChamp";
import type { Champ, TypeChamp, CreateChampPayload } from "@/api/champ";
import { TYPE_CHAMP_LABELS } from "@/api/champ";
import ConfirmModal from "@/components/admin/ConfirmModal";

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all";

const TYPE_CHAMP_OPTIONS: TypeChamp[] = ["TEXTE", "NOMBRE", "SURFACE", "PRIX", "BOOLEEN", "SELECT", "DATE"];

function ChampForm({ initial, onClose }: { initial?: Champ; onClose: () => void }) {
  const { data: categories = [] } = useCategoriesChamp();
  const create = useCreateChamp();
  const update = useUpdateChamp();
  const isEdit = !!initial;

  const [nom,         setNom]         = useState(initial?.nom ?? "");
  const [type,        setType]        = useState<TypeChamp>(initial?.type ?? "TEXTE");
  const [unite,       setUnite]       = useState(initial?.unite ?? "");
  const [optionsStr,  setOptionsStr]  = useState((initial?.options ?? []).join(", "));
  const [categorieId, setCategorieId] = useState(initial?.categorieId ?? "");
  const [errs,        setErrs]        = useState<Record<string, string>>({});

  const isPending = create.isPending || update.isPending;
  const apiErr = (create.error as any)?.response?.data?.message ?? (update.error as any)?.response?.data?.message ?? "";

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!nom.trim())      e.nom        = "Le nom est requis";
    if (!categorieId)     e.categorie  = "Choisissez une catégorie";
    if (type === "SELECT" && !optionsStr.trim()) e.options = "Ajoutez au moins une option";
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({});

    const payload: CreateChampPayload = {
      nom:         nom.trim(),
      type,
      unite:       unite.trim() || null,
      options:     type === "SELECT" ? optionsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      categorieId,
    };

    if (isEdit && initial) {
      await update.mutateAsync({ id: initial.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    toast.success(isEdit ? "Champ mis à jour" : "Champ créé");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">
            {isEdit ? "Modifier le champ" : "Nouveau champ dynamique"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Catégorie */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Catégorie *</label>
            <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            {errs.categorie && <p className="mt-1 text-xs text-red-500">{errs.categorie}</p>}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom du champ *</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex : Superficie" className={inputCls} autoFocus />
            {errs.nom && <p className="mt-1 text-xs text-red-500">{errs.nom}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Type de champ *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPE_CHAMP_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    type === t
                      ? "bg-[#D4A843] border-[#D4A843] text-white"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {TYPE_CHAMP_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Unité (NOMBRE / SURFACE / PRIX) */}
          {(type === "NOMBRE" || type === "SURFACE" || type === "PRIX") && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Unité (optionnel)</label>
              <input
                type="text"
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                placeholder={type === "SURFACE" ? "m²" : type === "PRIX" ? "FCFA" : ""}
                className={inputCls}
              />
            </div>
          )}

          {/* Options pour SELECT */}
          {type === "SELECT" && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Options (séparées par des virgules) *</label>
              <textarea
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                placeholder="ex : Option A, Option B, Option C"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all resize-none"
              />
              {errs.options && <p className="mt-1 text-xs text-red-500">{errs.options}</p>}
            </div>
          )}

          {apiErr && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{apiErr}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="button" onClick={handleSubmit} disabled={isPending} className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChampsPage() {
  const { data: champs = [], isLoading } = useChampsAdmin();
  const deleteChamp = useDeleteChamp();
  const updateChamp = useUpdateChamp();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Champ | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Champ | null>(null);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);

  const handleToggle = (c: Champ) => {
    setTogglingId(c.id);
    updateChamp.mutate(
      { id: c.id, payload: { actif: !c.actif } },
      {
        onSuccess: () => { toast.success(c.actif ? `"${c.nom}" désactivé` : `"${c.nom}" activé`); setTogglingId(null); },
        onError:   () => { toast.error("Erreur"); setTogglingId(null); },
      }
    );
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Champs dynamiques" }, { label: "Champs" }]} />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Champs dynamiques
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Champs de formulaire</h1>
          <p className="text-slate-400 text-sm mt-0.5">{champs.length} champ{champs.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setEditing(undefined); setModalOpen(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold shadow-sm shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" /></div>
        ) : champs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucun champ. Commencez par créer des catégories de champs.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Unité / Options</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {champs.map((c) => {
                const isToggling = togglingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-[#0C1A35]">{c.nom}</td>
                    <td className="px-4 py-3 text-slate-500">{c.categorie.nom}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        {TYPE_CHAMP_LABELS[c.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {c.type === "SELECT"
                        ? c.options.join(", ") || "—"
                        : c.unite || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => !isToggling && handleToggle(c)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {isToggling ? (
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        ) : c.actif ? (
                          <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Actif</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-slate-300" /><span className="text-slate-400">Inactif</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(c); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors" title="Modifier">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Supprimer">
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

      {modalOpen && <ChampForm initial={editing} onClose={() => setModalOpen(false)} />}

      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer le champ"
        message={`Supprimer "${deleteTarget?.nom}" ? Cette action est irréversible.`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteChamp.mutate(deleteTarget.id, {
            onSuccess: () => { toast.success("Champ supprimé"); setDeleteTarget(null); },
            onError:   (e: any) => { toast.error(e?.response?.data?.message ?? "Erreur"); setDeleteTarget(null); },
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
