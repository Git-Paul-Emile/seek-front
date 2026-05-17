import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Tag, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCategoriesChamp,
  useCreateCategorieChamp,
  useUpdateCategorieChamp,
  useDeleteCategorieChamp,
} from "@/hooks/useCategorieChamp";
import type { CategorieChamp } from "@/api/categorieChamp";
import ConfirmModal from "@/components/admin/ConfirmModal";

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all";

function CategorieForm({
  initial,
  onClose,
}: {
  initial?: CategorieChamp;
  onClose: () => void;
}) {
  const create = useCreateCategorieChamp();
  const update = useUpdateCategorieChamp();
  const isEdit = !!initial;

  const [nom, setNom]     = useState(initial?.nom ?? "");
  const [ordre, setOrdre] = useState(String(initial?.ordre ?? 0));
  const [err, setErr]     = useState("");

  const isPending = create.isPending || update.isPending;
  const apiErr =
    (create.error as any)?.response?.data?.message ??
    (update.error as any)?.response?.data?.message ?? "";

  const handleSubmit = async () => {
    if (!nom.trim()) { setErr("Le nom est requis"); return; }
    setErr("");
    if (isEdit && initial) {
      await update.mutateAsync({ id: initial.id, payload: { nom: nom.trim(), ordre: Number(ordre) } });
    } else {
      await create.mutateAsync({ nom: nom.trim(), ordre: Number(ordre) });
    }
    toast.success(isEdit ? "Catégorie mise à jour" : "Catégorie créée");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">
            {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie de champ"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex : Superficie"
              className={inputCls}
              autoFocus
            />
            {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Ordre d'affichage</label>
            <input
              type="number"
              value={ordre}
              onChange={(e) => setOrdre(e.target.value)}
              className={inputCls}
              min={0}
            />
          </div>

          {apiErr && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{apiErr}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesChampPage() {
  const { data: categories = [], isLoading } = useCategoriesChamp();
  const deleteCategorie = useDeleteCategorieChamp();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<CategorieChamp | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CategorieChamp | null>(null);

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Champs dynamiques" }, { label: "Catégories" }]} />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <Tag className="w-3.5 h-3.5" /> Champs dynamiques
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Catégories de champs</h1>
          <p className="text-slate-400 text-sm mt-0.5">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
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
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucune catégorie. Créez-en une pour commencer.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Ordre</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-[#0C1A35]">{cat.nom}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{cat.ordre}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(cat); setModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <CategorieForm initial={editing} onClose={() => setModalOpen(false)} />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer la catégorie"
        message={`Supprimer "${deleteTarget?.nom}" ? Cette action est irréversible.`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCategorie.mutate(deleteTarget.id, {
            onSuccess: () => { toast.success("Catégorie supprimée"); setDeleteTarget(null); },
            onError: (e: any) => { toast.error(e?.response?.data?.message ?? "Erreur lors de la suppression"); setDeleteTarget(null); },
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
