import { useState } from "react";
import { CreditCard, TrendingUp, Loader2 } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useAdminHistoriqueTransactions, useAdminStatsTransactions } from "@/hooks/usePremium";
import { SkTableRows } from "@/components/ui/Skeleton";

const TYPE_LABELS: Record<string, string> = {
  LOYER: "Loyer",
  PREMIUM: "Premium",
  CAUTION: "Caution",
};

const STATUT_COLORS: Record<string, string> = {
  CONFIRME: "bg-green-100 text-green-700",
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  ECHOUE: "bg-red-100 text-red-700",
  REMBOURSE: "bg-slate-100 text-slate-500",
};

function fmtMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

export default function TransactionsAdmin() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading } = useAdminHistoriqueTransactions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
  });
  const { data: stats } = useAdminStatsTransactions();

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Transactions" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Transactions</h1>
        <p className="text-sm text-slate-500 mt-0.5">Historique global des paiements</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total confirmé", value: stats.totalConfirme },
            { label: "Montant total", value: fmtMontant(stats.montantTotal) },
            { label: "Ce mois", value: fmtMontant(stats.montantMois) },
            { label: "Cette année", value: fmtMontant(stats.montantAnnee) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-[#0C1A35]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les types</option>
          <option value="LOYER">Loyer</option>
          <option value="PREMIUM">Premium</option>
          <option value="CAUTION">Caution</option>
        </select>
        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les statuts</option>
          <option value="CONFIRME">Confirmé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ECHOUE">Échoué</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <SkTableRows rows={8} />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <CreditCard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune transaction</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode paiement</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bien</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                      <CreditCard className="w-3 h-3" />
                      {TYPE_LABELS[t.type] ?? t.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[#0C1A35]">{fmtMontant(t.montant)}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{t.modePaiement}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[t.statut] ?? "bg-slate-100 text-slate-500"}`}>
                      {t.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs truncate max-w-[150px]">
                    {t.bien?.titre ?? ""}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(t.dateInitiation).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">{pagination.total} transaction{pagination.total !== 1 ? "s" : ""}</span>
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
