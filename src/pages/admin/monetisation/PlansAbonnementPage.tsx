import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Crown, Infinity } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/hooks/useMonetisation";
import type { PlanAbonnement } from "@/api/monetisation";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all";
const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

const EMPTY_FORM = {
  nom: "",
  prix: 0,
  maxAnnonces: "" as string | number,
  ordre: 0,
  actif: true,
  description: "",
};

function fmt(n: number) {
  return n === 0 ? "Gratuit" : new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

// ─── Formulaire plan ──────────────────────────────────────────────────────────

function PlanForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: typeof EMPTY_FORM;
  onSubmit: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);

  const set = (k: keyof typeof EMPTY_FORM, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Nom du plan *</label>
          <input
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Pro, Premium…"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Prix mensuel (FCFA)</label>
          <input
            type="number"
            min={0}
            value={form.prix}
            onChange={(e) => set("prix", parseFloat(e.target.value) || 0)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Max annonces (vide = illimité)</label>
          <input
            type="number"
            min={1}
            value={form.maxAnnonces === null ? "" : form.maxAnnonces}
            onChange={(e) =>
              set("maxAnnonces", e.target.value === "" ? "" : parseInt(e.target.value))
            }
            placeholder="Illimité"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ordre d'affichage</label>
          <input
            type="number"
            min={0}
            value={form.ordre}
            onChange={(e) => set("ordre", parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description (optionnel)</label>
        <input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Idéal pour…"
          className={inputCls}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="actif"
          checked={form.actif}
          onChange={(e) => set("actif", e.target.checked)}
          className="rounded"
        />
        <label htmlFor="actif" className="text-sm text-slate-600">
          Plan actif (visible par les owners)
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.nom.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A843] text-white text-sm font-medium
            rounded-xl hover:bg-[#c49a36] transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200
            rounded-xl hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlansAbonnementPage() {
  const { data: plans = [], isLoading } = useAdminPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanAbonnement | null>(null);

  const handleCreate = (form: typeof EMPTY_FORM) => {
    createPlan.mutate(
      {
        nom: form.nom,
        prix: form.prix,
        maxAnnonces: form.maxAnnonces === "" ? null : Number(form.maxAnnonces),
        actif: form.actif,
        ordre: form.ordre,
        description: form.description || null,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          toast.success("Plan créé");
        },
        onError: () => toast.error("Erreur lors de la création"),
      }
    );
  };

  const handleUpdate = (id: string, form: typeof EMPTY_FORM) => {
    updatePlan.mutate(
      {
        id,
        data: {
          nom: form.nom,
          prix: form.prix,
          maxAnnonces: form.maxAnnonces === "" ? null : Number(form.maxAnnonces),
          actif: form.actif,
          ordre: form.ordre,
          description: form.description || null,
        },
      },
      {
        onSuccess: () => {
          setEditId(null);
          toast.success("Plan mis à jour");
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePlan.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Plan supprimé");
      },
      onError: (err: unknown) => {
        setDeleteTarget(null);
        const msg = (err as any)?.response?.data?.message ?? "Erreur lors de la suppression";
        toast.error(msg);
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Monétisation", to: "/admin/monetisation/config" },
          { label: "Plans d'abonnement" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0C1A35]">Plans d'abonnement</h1>
            <p className="text-sm text-slate-400">{plans.length} plan(s) configuré(s)</p>
          </div>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A843] text-white text-sm
              font-semibold rounded-xl hover:bg-[#c49a36] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau plan
          </button>
        )}
      </div>

      {showCreate && (
        <PlanForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createPlan.isPending}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Crown className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucun plan configuré. Créez le premier plan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) =>
            editId === plan.id ? (
              <PlanForm
                key={plan.id}
                initial={{
                  nom: plan.nom,
                  prix: plan.prix,
                  maxAnnonces: plan.maxAnnonces ?? "",
                  ordre: plan.ordre,
                  actif: plan.actif,
                  description: plan.description ?? "",
                }}
                onSubmit={(form) => handleUpdate(plan.id, form)}
                onCancel={() => setEditId(null)}
                loading={updatePlan.isPending}
              />
            ) : (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    plan.actif ? "bg-[#D4A843]/10" : "bg-slate-100"
                  }`}
                >
                  <Crown
                    className={`w-5 h-5 ${plan.actif ? "text-[#D4A843]" : "text-slate-300"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0C1A35] text-sm">{plan.nom}</span>
                    {!plan.actif && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full">
                        INACTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fmt(plan.prix)} / mois •{" "}
                    {plan.maxAnnonces === null ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Infinity className="w-3 h-3" /> annonces illimitées
                      </span>
                    ) : (
                      `${plan.maxAnnonces} annonce(s)`
                    )}
                    {plan.description ? ` • ${plan.description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditId(plan.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                      hover:bg-slate-50 hover:text-[#D4A843] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(plan)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                      hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {!!deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          title="Supprimer ce plan ?"
          description={`Le plan "${deleteTarget.nom}" sera définitivement supprimé.`}
          confirmLabel="Supprimer"
          isLoading={deletePlan.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
