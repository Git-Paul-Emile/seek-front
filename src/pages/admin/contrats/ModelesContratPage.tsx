import { useState } from "react";
import {
  Plus, Pencil, Trash2, X, FileText, Copy, Check,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  useModelesAdmin,
  useCreateModele,
  useUpdateModele,
  useDeleteModele,
} from "@/hooks/useModeleContrat";
import type { ModeleContrat, ModeleContratPayload } from "@/api/modeleContrat";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import RichTextEditor from "@/components/form/RichTextEditor";

// ─── Constantes ───────────────────────────────────────────────────────────────

const TYPES_BAIL = ["Meublé", "Non meublé", "Saisonnier", "Commercial", "Mixte"];

const VARIABLES = [
  { key: "{{nom_bailleur}}",         label: "Nom du bailleur" },
  { key: "{{prenom_bailleur}}",      label: "Prénom du bailleur" },
  { key: "{{nom_locataire}}",        label: "Nom du locataire" },
  { key: "{{prenom_locataire}}",     label: "Prénom du locataire" },
  { key: "{{profession_locataire}}", label: "Profession du locataire" },
  { key: "{{adresse_bien}}",         label: "Adresse du bien" },
  { key: "{{ville}}",                label: "Ville" },
  { key: "{{quartier}}",             label: "Quartier" },
  { key: "{{loyer}}",                label: "Montant du loyer" },
  { key: "{{caution}}",              label: "Montant de la caution" },
  { key: "{{date_debut}}",           label: "Date de début du bail" },
  { key: "{{date_fin}}",             label: "Date de fin du bail" },
  { key: "{{type_bail}}",            label: "Type de bail" },
  { key: "{{frequence_paiement}}",   label: "Fréquence de paiement" },
  { key: "{{date_signature}}",       label: "Date de signature" },
];

// ─── Panneau variables ────────────────────────────────────────────────────────

function VariablesPanel() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-amber-800 mb-3">Variables disponibles</h3>
      <div className="space-y-1.5">
        {VARIABLES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => copy(key)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg
              hover:bg-amber-100 transition-colors text-left group"
            title="Cliquer pour copier"
          >
            <span className="text-xs text-amber-700 font-mono">{key}</span>
            <span className="text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 flex items-center gap-1">
              {copied === key ? (
                <><Check className="w-3 h-3" /> Copié</>
              ) : (
                <><Copy className="w-3 h-3" /> Copier</>
              )}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-amber-600">
        Cliquez sur une variable pour la copier, puis collez-la dans le contenu du modèle.
      </p>
    </div>
  );
}

// ─── Modal formulaire ─────────────────────────────────────────────────────────

function ModeleForm({
  initial,
  onClose,
}: {
  initial?: ModeleContrat;
  onClose: () => void;
}) {
  const isEdit = Boolean(initial);
  const create = useCreateModele();
  const update = useUpdateModele();

  const [form, setForm] = useState<ModeleContratPayload>({
    titre:   initial?.titre   ?? "",
    typeBail: initial?.typeBail ?? null,
    contenu: initial?.contenu ?? "",
    actif:   initial?.actif   ?? true,
    ordre:   initial?.ordre   ?? 0,
  });

  const set = (key: keyof ModeleContratPayload, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [showVars, setShowVars] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error("Le titre est requis"); return; }
    if (!form.contenu.trim() || form.contenu === "<p></p>") { toast.error("Le contenu est requis"); return; }

    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, payload: form });
        toast.success("Modèle mis à jour");
      } else {
        await create.mutateAsync(form);
        toast.success("Modèle créé");
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Modifier le modèle" : "Nouveau modèle de contrat"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Colonne principale (2/3) */}
            <div className="col-span-2 space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.titre}
                  onChange={(e) => set("titre", e.target.value)}
                  placeholder="Ex: Contrat de location meublée"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Type + Ordre + Actif */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de bail
                  </label>
                  <select
                    value={form.typeBail ?? ""}
                    onChange={(e) => set("typeBail", e.target.value || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Tous les types</option>
                    {TYPES_BAIL.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input
                    type="number"
                    min={0}
                    value={form.ordre ?? 0}
                    onChange={(e) => set("ordre", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.actif}
                      onChange={(e) => set("actif", e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Actif</span>
                  </label>
                </div>
              </div>

              {/* Éditeur */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenu <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowVars((v) => !v)}
                    className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                  >
                    {showVars ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showVars ? "Masquer variables" : "Voir variables"}
                  </button>
                </div>
                <RichTextEditor
                  value={form.contenu}
                  onChange={(html) => set("contenu", html)}
                  minHeight="400px"
                />
              </div>
            </div>

            {/* Colonne variables (1/3) */}
            {showVars && (
              <div className="col-span-1">
                <VariablesPanel />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le modèle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ModelesContratPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filterTypeBail, setFilterTypeBail] = useState("");

  const { data, isLoading } = useModelesAdmin({
    page,
    limit,
    typeBail: filterTypeBail || undefined,
  });

  const updateModele = useUpdateModele();
  const deleteModele = useDeleteModele();

  const items = data?.items ?? [];
  const meta  = data?.meta;

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<ModeleContrat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModeleContrat | null>(null);

  const openEdit = (m: ModeleContrat) => {
    setSelected(m);
    setModal("edit");
  };

  const toggleActif = async (m: ModeleContrat) => {
    try {
      await updateModele.mutateAsync({ id: m.id, payload: { actif: !m.actif } });
      toast.success(m.actif ? "Modèle désactivé" : "Modèle activé");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteModele.mutateAsync(deleteTarget.id);
      toast.success("Modèle supprimé");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur";
      toast.error(msg);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modèles de contrat</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les templates utilisés pour générer les contrats de bail
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau modèle
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrer par type :</label>
        <select
          value={filterTypeBail}
          onChange={(e) => { setFilterTypeBail(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Tous les types</option>
          {TYPES_BAIL.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {meta && (
          <span className="ml-auto text-sm text-gray-500">{meta.total} modèle{meta.total > 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucun modèle de contrat</p>
            <button
              onClick={() => { setSelected(null); setModal("create"); }}
              className="mt-3 text-sm text-amber-600 hover:underline"
            >
              Créer le premier modèle
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type de bail</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ordre</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{m.titre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {m.typeBail ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {m.typeBail}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Tous types</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600">{m.ordre}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleActif(m)}
                      title={m.actif ? "Désactiver" : "Activer"}
                    >
                      {m.actif ? (
                        <ToggleRight className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={limit}
          goTo={setPage}
          goNext={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
          goPrev={() => setPage((p) => Math.max(p - 1, 1))}
        />
      )}

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <ModeleForm
          initial={modal === "edit" ? selected ?? undefined : undefined}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer le modèle"
          message={`Supprimer "${deleteTarget.titre}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
