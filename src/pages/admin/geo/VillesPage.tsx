import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { MapPin, Plus, Pencil, Trash2, X, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  useAllPaysAdmin,
  useAllVillesAdmin,
  useCreateVille,
  useUpdateVille,
  useDeleteVille,
} from "@/hooks/useGeo";
import type { Pays, Ville } from "@/api/geo";
import ConfirmModal from "@/components/admin/ConfirmModal";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

// ─── Modal formulaire ─────────────────────────────────────────────────────────

function VilleForm({
  initial,
  paysList,
  onClose,
}: {
  initial?: Ville;
  paysList: Pays[];
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const create = useCreateVille();
  const update = useUpdateVille();

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [paysId, setPaysId] = useState(initial?.paysId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = "Le nom est requis";
    if (!paysId) errs.paysId = "Choisissez un pays";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, data: { nom: nom.trim(), paysId } });
        toast.success("Ville mise à jour");
      } else {
        await create.mutateAsync({ nom: nom.trim(), paysId });
        toast.success("Ville créée");
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
            {isEdit ? "Modifier la ville" : "Nouvelle ville"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Pays *</label>
            <div className="relative">
              <select
                value={paysId}
                onChange={(e) => setPaysId(e.target.value)}
                className={`${inputCls} cursor-pointer appearance-none pr-8`}
              >
                <option value="">- Choisir un pays -</option>
                {paysList.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.paysId && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.paysId}</p>}
          </div>

          <div>
            <label className={labelCls}>Nom de la ville *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex : Dakar"
              className={inputCls}
              autoFocus
            />
            {errors.nom && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nom}</p>}
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

export default function VillesPage() {
  const { data: paysList = [] } = useAllPaysAdmin();
  const [filterPaysId, setFilterPaysId] = useState<string>("");

  const { data: villes = [], isLoading } = useAllVillesAdmin(filterPaysId || undefined);
  const deleteVille = useDeleteVille();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ville | undefined>();
  const [toDelete, setToDelete] = useState<Ville | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteVille.mutateAsync(toDelete.id);
      toast.success("Ville supprimée");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Géographie" }, { label: "Villes" }]} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
            <MapPin className="w-3.5 h-3.5" /> Géographie
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Villes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gérez les villes associées à chaque pays.</p>
        </div>
        <button
          onClick={() => { setEditing(undefined); setShowForm(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A843] text-sm font-semibold text-[#0C1A35] hover:bg-[#C89A3A] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter une ville
        </button>
      </div>

      {/* Filtre pays */}
      <div className="mb-4">
        <div className="relative w-64">
          <select
            value={filterPaysId}
            onChange={(e) => setFilterPaysId(e.target.value)}
            className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#D4A843]/60 transition-all cursor-pointer appearance-none"
          >
            <option value="">Tous les pays</option>
            {paysList.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : villes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MapPin className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucune ville enregistrée</p>
            <p className="text-xs mt-1">Commencez par ajouter une ville.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Ville</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Pays</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Quartiers</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {villes.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#0C1A35]">{v.nom}</td>
                  <td className="px-5 py-3.5">
                    {v.pays && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-500">
                        <span className="font-bold">{v.pays.code}</span> {v.pays.nom}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {v._count?.quartiers ?? 0} quartier{(v._count?.quartiers ?? 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(v); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#D4A843] hover:bg-[#D4A843]/8 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setToDelete(v)}
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
        <VilleForm
          initial={editing}
          paysList={paysList}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Supprimer cette ville ?"
          message={`"${toDelete.nom}" sera supprimée. Les quartiers associés seront également supprimés.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          isPending={deleteVille.isPending}
        />
      )}
    </div>
  );
}
