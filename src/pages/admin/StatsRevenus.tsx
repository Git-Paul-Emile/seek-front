import { TrendingUp, Loader2, DollarSign, Calendar } from "lucide-react";
import { useRevenusStats } from "@/hooks/useStats";

function fmtMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

export default function StatsRevenus() {
  const { data: stats, isLoading } = useRevenusStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Statistiques des revenus</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue globale des revenus de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenus totaux", value: fmtMontant(stats?.totalRevenus ?? 0), icon: TrendingUp, color: "text-[#D4A843]" },
          { label: "Ce mois", value: fmtMontant(stats?.revenusMois ?? 0), icon: Calendar, color: "text-blue-500" },
          { label: "Revenus premium", value: fmtMontant(stats?.revenusPremium ?? 0), icon: DollarSign, color: "text-green-500" },
          { label: "Revenus loyer", value: fmtMontant((stats?.totalRevenus ?? 0) - (stats?.revenusPremium ?? 0)), icon: DollarSign, color: "text-purple-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <p className="text-xs text-slate-400 font-medium">{kpi.label}</p>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 12 derniers mois - Loyer */}
      {stats?.revenus12Mois && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">Revenus loyer — 12 derniers mois</h2>
          <div className="space-y-2">
            {stats.revenus12Mois.map((m) => {
              const max = Math.max(...stats.revenus12Mois.map((x) => x.total), 1);
              const pct = Math.round((m.total / max) * 100);
              return (
                <div key={m.mois} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{m.mois}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#D4A843] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-32 text-right shrink-0">
                    {fmtMontant(m.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 12 derniers mois - Premium */}
      {stats?.revenus12MoisPremium && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">Revenus premium — 12 derniers mois</h2>
          <div className="space-y-2">
            {stats.revenus12MoisPremium.map((m) => {
              const max = Math.max(...stats.revenus12MoisPremium.map((x) => x.total), 1);
              const pct = Math.round((m.total / max) * 100);
              return (
                <div key={m.mois} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{m.mois}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-32 text-right shrink-0">
                    {fmtMontant(m.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top propriétaires */}
      {stats?.topProprietairesLoyer && stats.topProprietairesLoyer.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">Top propriétaires par loyer</h2>
          <div className="space-y-3">
            {stats.topProprietairesLoyer.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.prenom} {p.nom}</p>
                  <p className="text-xs text-slate-400">{p.telephone}</p>
                </div>
                <span className="text-sm font-semibold text-[#D4A843] shrink-0">{fmtMontant(p.totalLoyer)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
