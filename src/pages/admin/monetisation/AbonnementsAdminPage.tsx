import { useState } from "react";
import { Users, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useAdminAbonnements, useConfirmerAbonnement, useResilierAbonnement } from "@/hooks/useMonetisation";
import type { StatutAbonnement } from "@/api/monetisation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<StatutAbonnement, { label: string; cls: string }> = {
  EN_ATTENTE: { label: "En attente", cls: "bg-yellow-100 text-yellow-700" },
  ACTIF: { label: "Actif", cls: "bg-green-100 text-green-700" },
  EXPIRE: { label: "Expiré", cls: "bg-slate-100 text-slate-500" },
  RESILIE: { label: "Résilié", cls: "bg-red-100 text-red-600" },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const fmtMontant = (n: number) =>
  n === 0 ? "Gratuit" : new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AbonnementsAdminPage() {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading } = useAdminAbonnements({
    page,
    limit: 20,
    statut: statutFilter || undefined,
  });

  const confirmer = useConfirmerAbonnement();
  const resilier = useResilierAbonnement();

  const items = data?.data ?? [];
  const meta = data?.meta;

  const handleConfirmer = (id: string) => {
    confirmer.mutate(id, {
      onSuccess: () => toast.success("Abonnement confirmé et activé"),
      onError: (err: unknown) => toast.error((err as any)?.response?.data?.message ?? "Erreur"),
    });
  };

  const handleResilier = (id: string) => {
    resilier.mutate(id, {
      onSuccess: () => toast.success("Abonnement résilié"),
      onError: (err: unknown) => toast.error((err as any)?.response?.data?.message ?? "Erreur"),
    });
  };

  return (
    <div className="max-w-5xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Monétisation", to: "/admin/monetisation/config" },
          { label: "Abonnements" },
        ]}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0C1A35]">Abonnements propriétaires</h1>
            <p className="text-sm text-slate-400">{meta?.total ?? 0} abonnement(s)</p>
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
          <option value="ACTIF">Actif</option>
          <option value="EXPIRE">Expiré</option>
          <option value="RESILIE">Résilié</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucun abonnement trouvé.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Propriétaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Période</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Référence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => {
                const statutConf = STATUT_CONFIG[item.statut] ?? { label: item.statut, cls: "bg-slate-100 text-slate-500" };
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0C1A35]">
                        {item.proprietaire?.prenom} {item.proprietaire?.nom}
                      </p>
                      <p className="text-xs text-slate-400">{item.proprietaire?.telephone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">{item.plan.nom}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{fmtMontant(item.montant)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {fmtDate(item.dateDebut)} → {fmtDate(item.dateFin)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{item.reference ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statutConf.cls}`}>
                        {statutConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
                        {item.statut === "ACTIF" && (
                          <button
                            onClick={() => handleResilier(item.id)}
                            disabled={resilier.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600
                              bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Résilier
                          </button>
                        )}
                      </div>
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
          <span>{meta.total} abonnements</span>
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
