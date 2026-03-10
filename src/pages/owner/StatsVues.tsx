import { useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Eye, Loader2, TrendingUp, Home, Calendar, BarChart2, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useStatsVuesOwner, useStatsVuesBien } from "@/hooks/useBien";

// ─── Mini graphique en barres (7 jours) ──────────────────────────────────────

function MiniBarChart({ evolution }: { evolution: { date: string; count: number }[] }) {
  const max = Math.max(...evolution.map((e) => e.count), 1);
  const days = ["D", "L", "M", "M", "J", "V", "S"];
  return (
    <div className="flex items-end gap-1 h-14">
      {evolution.map((e, i) => {
        const pct = Math.round((e.count / max) * 100);
        const d = new Date(e.date + "T00:00:00");
        const label = days[d.getDay()];
        return (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
            <span className="text-[9px] text-slate-400">{e.count > 0 ? e.count : ""}</span>
            <div className="w-full flex items-end" style={{ height: "32px" }}>
              <div
                className="w-full rounded-t bg-[#D4A843] transition-all"
                style={{ height: `${pct}%`, minHeight: pct > 0 ? "2px" : "0" }}
              />
            </div>
            <span className="text-[9px] text-slate-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Ligne de stats d'un bien avec graphe expandable ─────────────────────────

function BienRow({ bien, rank }: {
  bien: { id: string; titre: string | null; ville: string | null; nbVues: number; vuesAujourdhui: number; vuesCetteSemaine: number };
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = useStatsVuesBien(expanded ? bien.id : undefined);
  const isPopular = bien.nbVues >= 50;

  return (
    <>
      <div
        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/owner/biens/${bien.id}`}
              className="text-sm font-medium text-slate-700 hover:text-[#D4A843] transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {bien.titre ?? "Sans titre"}
            </Link>
            {isPopular && (
              <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-600">
                <Flame className="w-2.5 h-2.5" /> Populaire
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{bien.ville ?? ""}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-right text-xs text-slate-500">
          <div className="hidden sm:block">
            <p className="font-semibold text-slate-700">{bien.vuesAujourdhui}</p>
            <p className="text-slate-400">Aujourd'hui</p>
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-slate-700">{bien.vuesCetteSemaine}</p>
            <p className="text-slate-400">7 jours</p>
          </div>
          <div>
            <div className="flex items-center gap-1 font-semibold text-sm text-[#0C1A35]">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {bien.nbVues.toLocaleString("fr-FR")}
            </div>
            <p className="text-slate-400">Total</p>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-4 bg-slate-50/60 border-t border-slate-50">
          {isLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement...
            </div>
          ) : detail ? (
            <div className="pt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" /> Évolution sur 7 jours
              </p>
              <MiniBarChart evolution={detail.evolution} />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function StatsVues() {
  const { data, isLoading } = useStatsVuesOwner();

  const kpis = [
    {
      icon: Eye,
      color: "text-[#D4A843]",
      label: "Vues totales",
      value: data?.vuesTotales ?? 0,
    },
    {
      icon: Calendar,
      color: "text-blue-500",
      label: "Aujourd'hui",
      value: data?.vuesAujourdhui ?? 0,
    },
    {
      icon: TrendingUp,
      color: "text-green-500",
      label: "7 derniers jours",
      value: data?.vuesCetteSemaine ?? 0,
    },
    {
      icon: Home,
      color: "text-purple-500",
      label: "Annonces actives",
      value: data?.topAnnonces.length ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Statistiques de vues" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Statistiques de vues</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance de vos annonces publiées</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <p className="text-xs text-slate-400 font-medium">{kpi.label}</p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-[#0C1A35]">{kpi.value.toLocaleString("fr-FR")}</p>
            )}
          </div>
        ))}
      </div>

      {/* Classement */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0C1A35]">Classement par vues</h2>
          <p className="text-xs text-slate-400">Cliquer sur une ligne pour voir l'évolution</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : !data || data.topAnnonces.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Eye className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune annonce publiée</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.topAnnonces.map((bien, i) => (
              <BienRow key={bien.id} bien={bien} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
