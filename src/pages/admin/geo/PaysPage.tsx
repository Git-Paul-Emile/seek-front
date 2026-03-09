import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Globe, Plus, Pencil, Trash2, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAllPaysAdmin, useCreatePays, useUpdatePays, useDeletePays } from "@/hooks/useGeo";
import type { Pays } from "@/api/geo";
import ConfirmModal from "@/components/admin/ConfirmModal";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

// ─── Modal formulaire ─────────────────────────────────────────────────────────

function PaysForm({
  initial,
  onClose,
}: {
  initial?: Pays;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const create = useCreatePays();
  const update = useUpdatePays();

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = "Le nom est requis";
    if (!code.trim()) errs.code = "Le code est requis";
    else if (code.trim().length > 3) errs.code = "Maximum 3 caractères";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, data: { nom: nom.trim(), code: code.trim().toUpperCase() } });
        toast.success("Pays mis à jour");
      } else {
        await create.mutateAsync({ nom: nom.trim(), code: code.trim().toUpperCase() });
        toast.success("Pays créé");
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-[#0C1A35]">
            {isEdit ? "Modifier le pays" : "Nouveau pays"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nom du pays *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex : Sénégal"
              className={inputCls}
              autoFocus
            />
            {errors.nom && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nom}</p>}
          </div>

          <div>
            <label className={labelCls}>Code ISO *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex : SN"
              maxLength={3}
              className={inputCls}
            />
            {errors.code && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.code}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-[#D4A843] text-sm font-semibold text-[#0C1A35] hover:bg-[#C89A3A] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PaysPage() {
  const { data: pays = [], isLoading } = useAllPaysAdmin();
  const deletePays = useDeletePays();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pays | undefined>();
  const [toDelete, setToDelete] = useState<Pays | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePays.mutateAsync(toDelete.id);
      toast.success("Pays supprimé");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Géographie" }, { label: "Pays" }]} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
            <Globe className="w-3.5 h-3.5" /> Géographie
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Pays</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gérez les pays disponibles sur la plateforme.</p>
        </div>
        <button
          onClick={() => { setEditing(undefined); setShowForm(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A843] text-sm font-semibold text-[#0C1A35] hover:bg-[#C89A3A] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un pays
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : pays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Globe className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucun pays enregistré</p>
            <p className="text-xs mt-1">Commencez par ajouter un pays.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Villes</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {pays.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#0C1A35]">{p.nom}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      {p.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {p._count?.villes ?? 0} ville{(p._count?.villes ?? 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(p); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setToDelete(p)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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

      {/* Modals */}
      {showForm && (
        <PaysForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Supprimer ce pays ?"
          message={`"${toDelete.nom}" sera supprimé. Les villes associées seront également supprimées.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isPending={deletePays.isPending}
        />
      )}
    </div>
  );
}
