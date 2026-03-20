import { useState } from "react";
import { TrendingUp, Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useAdminMisesEnAvant, useConfirmerMiseEnAvant } from "@/hooks/useMonetisation";
import type { StatutPromotion } from "@/api/monetisation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<StatutPromotion, { label: string; cls: string }> = {
  EN_ATTENTE: { label: "En attente", cls: "bg-yellow-100 text-yellow-700" },
  ACTIVE: { label: "Active", cls: "bg-green-100 text-green-700" },
  TERMINEE: { label: "Terminée", cls: "bg-slate-100 text-slate-500" },
  ARRETEE: { label: "Arrêtée", cls: "bg-orange-100 text-orange-600" },
  EXPIREE: { label: "Expirée", cls: "bg-red-100 text-red-600" },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const fmtMontant = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MisesEnAvantAdminPage() {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading } = useAdminMisesEnAvant({
    page,
    limit: 20,
    statut: statutFilter || undefined,
  });

  const confirmer = useConfirmerMiseEnAvant();

  const items = data?.data ?? [];
  const meta = data?.meta;

  const handleConfirmer = (id: string) => {
    confirmer.mutate(id, {
      onSuccess: () => toast.success("Mise en avant confirmée et activée"),
      onError: (err: unknown) => toast.error((err as any)?.response?.data?.message ?? "Erreur"),
    });
  };

  return (
    <div className="max-w-5xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Monétisation", to: "/admin/monetisation/config" },
          { label: "Mises en avant" },
        ]}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0C1A35]">Mises en avant</h1>
            <p className="text-sm text-slate-400">{meta?.total ?? 0} demande(s)</p>
          </div>
        </div>
        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
            outline-none focus:border-[#D4A843]/60 transition-all"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ACTIVE">Active</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ARRETEE">Arrêtée</option>
          <option value="EXPIREE">Expirée</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucune mise en avant trouvée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Annonce</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Propriétaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Formule</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Référence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Période</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => {
                const statutConf = STATUT_CONFIG[item.statut] ?? {
                  label: item.statut,
                  cls: "bg-slate-100 text-slate-500",
                };
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0C1A35] text-xs line-clamp-1">
                        {item.bien?.titre ?? ""}
                      </p>
                      <p className="text-xs text-slate-400">{item.bien?.ville ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-700">
                        {item.proprietaire?.prenom} {item.proprietaire?.nom}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.formuleNom}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{fmtMontant(item.montant)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{item.reference ?? ""}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {fmtDate(item.dateDebut)} → {fmtDate(item.dateFin)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statutConf.cls}`}>
                        {statutConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.statut === "EN_ATTENTE" && (
                        <button
                          onClick={() => handleConfirmer(item.id)}
                          disabled={confirmer.isPending}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700
                            bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Confirmer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{meta.total} demandes</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
                hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-medium text-[#0C1A35]">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
                hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
