import { useState } from "react";
import { Star, Loader2, TrendingUp } from "lucide-react";
import { useAdminHistoriquePromotions, useAdminStatsPromotions } from "@/hooks/usePremium";

const STATUT_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TERMINEE: "bg-slate-100 text-slate-500",
  ARRETEE: "bg-orange-100 text-orange-700",
  EXPIREE: "bg-red-100 text-red-600",
};

function fmtMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

export default function PromotionsAdmin() {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading } = useAdminHistoriquePromotions({
    page,
    limit: 20,
    statut: statutFilter || undefined,
  });
  const { data: stats } = useAdminStatsPromotions();

  const promotions = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Mises en avant premium</h1>
        <p className="text-sm text-slate-500 mt-0.5">Historique des promotions payantes</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Actives", value: stats.actives },
            { label: "Revenus total", value: fmtMontant(stats.montantTotal) },
            { label: "Ce mois", value: fmtMontant(stats.montantMois) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-[#0C1A35]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Par formule */}
      {stats?.parFormule && stats.parFormule.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">Répartition par formule</h2>
          <div className="space-y-2">
            {stats.parFormule.map((f) => (
              <div key={f.formuleNom} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">{f.formuleNom}</span>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{f.count} promotion{f.count !== 1 ? "s" : ""}</span>
                  <span className="font-medium text-[#D4A843]">{fmtMontant(f.montant)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtre */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Active</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ARRETEE">Arrêtée</option>
          <option value="EXPIREE">Expirée</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Star className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune promotion</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bien</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Formule</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Début</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-700 font-medium max-w-[150px] truncate">
                    {p.bien?.titre ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{p.formuleNom}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#D4A843]">{fmtMontant(p.montant)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[p.statut] ?? "bg-slate-100 text-slate-500"}`}>
                      {p.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(p.dateDebut).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(p.dateFin).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">{pagination.total} promotion{pagination.total !== 1 ? "s" : ""}</span>
            <div className="flex gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Précédent
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
