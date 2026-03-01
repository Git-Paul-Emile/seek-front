import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Clock,
  CheckCircle,
  FileText,
  XCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  PlusCircle,
  MapPin,
  Banknote,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { useOwnerStats } from "@/hooks/useBien";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_COLOR: Record<string, string> = {
  PUBLIE:     "#22c55e",
  EN_ATTENTE: "#eab308",
  REJETE:     "#ef4444",
  BROUILLON:  "#94a3b8",
  ANNULE:     "#6b7280",
};

const STATUT_LABEL: Record<string, string> = {
  PUBLIE:     "Publiés",
  EN_ATTENTE: "En attente",
  REJETE:     "Rejetés",
  BROUILLON:  "Brouillons",
  ANNULE:     "Annulés",
};

const STATUT_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; text: string }
> = {
  PUBLIE:     { icon: CheckCircle, bg: "bg-green-50",   text: "text-green-600" },
  EN_ATTENTE: { icon: Clock,       bg: "bg-yellow-50",  text: "text-yellow-600" },
  REJETE:     { icon: XCircle,     bg: "bg-red-50",     text: "text-red-600" },
  BROUILLON:  { icon: FileText,    bg: "bg-slate-50",   text: "text-slate-500" },
  ANNULE:     { icon: XCircle,     bg: "bg-gray-50",    text: "text-gray-500" },
};

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function StatCard({
  statut,
  count,
}: {
  statut: string;
  count: number;
}) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className={`rounded-2xl border border-slate-100 p-4 flex items-center gap-3 ${cfg.bg}`}>
      <Icon className={`w-5 h-5 shrink-0 ${cfg.text}`} />
      <div>
        <p className="text-xl font-bold text-[#0C1A35]">{count}</p>
        <p className={`text-xs font-medium ${cfg.text}`}>{STATUT_LABEL[statut] ?? statut}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#0C1A35]">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} bien{payload[0].value > 1 ? "s" : ""}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const { owner } = useOwnerAuth();
  const { data: stats, isLoading } = useOwnerStats();

  const pieData = (stats?.byStatut ?? [])
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: STATUT_LABEL[s.statut] ?? s.statut,
      value: s.count,
      color: STATUT_COLOR[s.statut] ?? "#94a3b8",
    }));

  const statutOrder = ["PUBLIE", "EN_ATTENTE", "BROUILLON", "REJETE", "ANNULE"];
  const statutsSorted = (stats?.byStatut ?? []).sort(
    (a, b) => statutOrder.indexOf(a.statut) - statutOrder.indexOf(b.statut)
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
            Bonjour,{" "}
            <span className="text-[#D4A843]">
              {owner?.prenom} {owner?.nom}
            </span>
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            Bienvenue dans votre espace propriétaire
          </p>
        </div>
        <Link
          to="/owner/biens/ajouter"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-[#D4A843] hover:bg-[#D4A843]/90 text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un bien
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
        </div>
      ) : stats?.totalBiens === 0 ? (
        /* État vide */
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-200" />
          <p className="text-[#0C1A35] font-semibold">Vous n'avez pas encore de bien</p>
          <p className="text-sm text-slate-400">
            Ajoutez votre premier bien pour commencer à recevoir des locataires ou acheteurs.
          </p>
          <Link
            to="/owner/biens/ajouter"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-[#D4A843] hover:bg-[#D4A843]/90 text-white shadow-sm transition-all mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter un bien
          </Link>
        </div>
      ) : (
        <>
          {/* Compteurs par statut */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statutsSorted.map((s) => (
              <StatCard key={s.statut} statut={s.statut} count={s.count} />
            ))}
          </div>

          {/* Stats locataires & paiements */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3 bg-indigo-50">
              <Users className="w-5 h-5 shrink-0 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-[#0C1A35]">{stats?.nbLocatairesActifs ?? 0}</p>
                <p className="text-xs font-medium text-indigo-600">Locataires actifs</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3 bg-emerald-50">
              <Building2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-[#0C1A35]">{stats?.nbBailsActifs ?? 0}</p>
                <p className="text-xs font-medium text-emerald-600">Baux actifs</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3 bg-[#D4A843]/10">
              <TrendingUp className="w-5 h-5 shrink-0 text-[#D4A843]" />
              <div className="min-w-0">
                <p className="text-xl font-bold text-[#0C1A35] truncate">
                  {(stats?.montantMensuelLoyers ?? 0).toLocaleString("fr-FR")}
                </p>
                <p className="text-xs font-medium text-[#D4A843]">FCFA / mois</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3 bg-red-50">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <div>
                <p className="text-xl font-bold text-[#0C1A35]">{stats?.nbEcheancesEnRetard ?? 0}</p>
                <p className="text-xs font-medium text-red-500">Loyers en retard</p>
              </div>
            </div>
          </div>

          {/* Donut + biens récents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Donut */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                  Répartition de vos biens
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-slate-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total centré visuel (label en dessous) */}
                <p className="text-center text-xs text-slate-400 mt-1">
                  {stats?.totalBiens} bien{(stats?.totalBiens ?? 0) > 1 ? "s" : ""} au total
                </p>
              </div>
            )}

            {/* Biens récents */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                Activité récente
              </h3>
              {!stats?.recentBiens.length ? (
                <p className="text-sm text-slate-400 text-center py-6">Aucun bien</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {stats.recentBiens.map((b) => {
                    const cfg = STATUT_CONFIG[b.statutAnnonce];
                    const Icon = cfg?.icon ?? Building2;
                    const effectiveStatut =
                      b.statutAnnonce === "PUBLIE" && b.hasPendingRevision
                        ? "EN_ATTENTE"
                        : b.statutAnnonce;
                    const effectiveCfg = STATUT_CONFIG[effectiveStatut];

                    return (
                      <div key={b.id} className="flex items-center justify-between py-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${effectiveCfg?.bg ?? cfg?.bg ?? "bg-slate-50"}`}>
                            {b.hasPendingRevision && b.statutAnnonce === "PUBLIE" ? (
                              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Icon className={`w-3.5 h-3.5 ${effectiveCfg?.text ?? cfg?.text ?? "text-slate-400"}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0C1A35] truncate">
                              {b.titre || "Sans titre"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              {b.ville && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {b.ville}
                                </span>
                              )}
                              {b.prix && (
                                <span className="flex items-center gap-0.5">
                                  <Banknote className="w-3 h-3" />
                                  {b.prix.toLocaleString("fr-FR")} F
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/owner/biens/${b.id}`}
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50
                            hover:bg-slate-100 text-slate-500 hover:text-[#0C1A35] transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-50">
                <Link
                  to="/owner/biens"
                  className="text-xs font-semibold text-[#D4A843] hover:text-[#D4A843]/80 transition-colors flex items-center gap-1"
                >
                  Voir tous mes biens
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
