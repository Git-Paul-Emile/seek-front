import { useMemo } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Eye, Loader2, TrendingUp, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useBiens } from "@/hooks/useBien";

export default function StatsVues() {
  const { data: biens = [], isLoading } = useBiens();

  const sorted = useMemo(
    () => [...biens].sort((a, b) => (b.nbVues ?? 0) - (a.nbVues ?? 0)),
    [biens]
  );

  const totalVues = biens.reduce((sum, b) => sum + (b.nbVues ?? 0), 0);
  const topBien = sorted[0];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Statistiques de vues" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Statistiques de vues</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance de vos annonces</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-[#D4A843]" />
            <p className="text-xs text-slate-400 font-medium">Vues totales</p>
          </div>
          <p className="text-2xl font-bold text-[#0C1A35]">{totalVues.toLocaleString("fr-FR")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-slate-400 font-medium">Annonces</p>
          </div>
          <p className="text-2xl font-bold text-[#0C1A35]">{biens.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs text-slate-400 font-medium">Moy. vues / annonce</p>
          </div>
          <p className="text-2xl font-bold text-[#0C1A35]">
            {biens.length > 0 ? Math.round(totalVues / biens.length).toLocaleString("fr-FR") : 0}
          </p>
        </div>
      </div>

      {/* Classement */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-[#0C1A35]">Classement par vues</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Eye className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune annonce publiée</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sorted.map((bien, i) => {
              const vues = bien.nbVues ?? 0;
              const maxVues = topBien?.nbVues ?? 1;
              const pct = maxVues > 0 ? Math.round((vues / maxVues) * 100) : 0;
              return (
                <div key={bien.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/owner/biens/${bien.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-[#D4A843] transition-colors truncate block"
                    >
                      {bien.titre ?? "Sans titre"}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[200px]">
                        <div
                          className="h-full bg-[#D4A843] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {bien.ville ?? ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#0C1A35]">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {vues.toLocaleString("fr-FR")}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bien.statutAnnonce}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
