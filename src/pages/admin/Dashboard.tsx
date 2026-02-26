import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Clock,
  CheckCircle,
  Users,
  MapPin,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useAdminStats } from "@/hooks/useStats";

// ─── Couleurs par statut ──────────────────────────────────────────────────────

const STATUT_COLOR: Record<string, string> = {
  PUBLIE:     "#22c55e",
  EN_ATTENTE: "#eab308",
  REJETE:     "#ef4444",
  ANNULE:     "#6b7280",
};

const STATUT_LABEL: Record<string, string> = {
  PUBLIE:     "Publiées",
  EN_ATTENTE: "En attente",
  REJETE:     "Rejetées",
  ANNULE:     "Annulées",
};

const BAR_COLORS = ["#D4A843", "#0C1A35", "#22c55e", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#0C1A35]">
          {value !== undefined ? value.toLocaleString("fr-FR") : "—"}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Custom tooltip recharts ──────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#0C1A35]">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value.toLocaleString("fr-FR")}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { admin } = useAuth();
  const { data: stats, isLoading } = useAdminStats();

  const totalEnAttente = stats?.annoncesByStatut.find((s) => s.statut === "EN_ATTENTE")?.count ?? 0;
  const totalPublie = stats?.annoncesByStatut.find((s) => s.statut === "PUBLIE")?.count ?? 0;

  const pieData = (stats?.annoncesByStatut ?? [])
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: STATUT_LABEL[s.statut] ?? s.statut,
      value: s.count,
      color: STATUT_COLOR[s.statut] ?? "#94a3b8",
    }));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Bienvenue, <span className="text-[#D4A843]">{admin?.email}</span>
        </h1>
        <p className="text-slate-400 mt-0.5 text-sm">Vue d'ensemble de la plateforme</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={CheckCircle}  label="Annonces publiées"  value={totalPublie}                   color="bg-green-500" />
            <KpiCard icon={Clock}        label="En attente"         value={totalEnAttente}                color="bg-yellow-500" />
            <KpiCard icon={Users}        label="Propriétaires"      value={stats?.totalProprietaires}     color="bg-[#0C1A35]" />
            <KpiCard icon={Building2}    label="Annonces (hors brouillon)"  value={stats?.totalBiens}  color="bg-[#D4A843]" />
          </div>

          {/* Ligne 2 : donut + bar type logement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Donut — répartition par statut */}
            <SectionCard title="Répartition par statut">
              {pieData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
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
              )}
            </SectionCard>

            {/* Bar — type de logement */}
            <SectionCard title="Annonces publiées par type de logement">
              {!stats?.annoncesByTypeLogement.length ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.annoncesByTypeLogement} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="nom"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Annonces" radius={[0, 6, 6, 0]}>
                      {stats.annoncesByTypeLogement.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Ligne 3 : bar type transaction + top villes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Bar — type de transaction */}
            <SectionCard title="Annonces publiées par type de transaction">
              {!stats?.annoncesByTypeTransaction.length ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.annoncesByTypeTransaction} margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="nom" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Annonces" radius={[6, 6, 0, 0]}>
                      {stats.annoncesByTypeTransaction.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>

            {/* Bar horizontal — top villes */}
            <SectionCard title="Top villes (annonces publiées)">
              {!stats?.topVilles.length ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.topVilles} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="ville"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Annonces" fill="#0C1A35" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Dernières annonces EN_ATTENTE */}
          <SectionCard title="Annonces récentes en attente de modération">
            {!stats?.recentEnAttente.length ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Aucune annonce en attente de modération.
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats.recentEnAttente.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0C1A35] truncate">
                          {a.titre || "Sans titre"}
                        </p>
                        {a.hasPendingRevision && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 shrink-0">
                            <RefreshCw className="w-2.5 h-2.5" />
                            Révision
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {a.proprietaire
                          ? `${a.proprietaire.prenom ?? ""} ${a.proprietaire.nom ?? ""}`.trim()
                          : "Propriétaire inconnu"}
                        {a.ville && (
                          <>
                            {" "}·{" "}
                            <MapPin className="w-3 h-3 inline" />
                            {" "}{a.ville}
                          </>
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/admin/annonces/${a.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                        bg-[#0C1A35] hover:bg-[#0C1A35]/80 text-white transition-colors"
                    >
                      Voir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {(stats?.recentEnAttente.length ?? 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-50">
                <Link
                  to="/admin/annonces"
                  className="text-xs font-semibold text-[#D4A843] hover:text-[#D4A843]/80 transition-colors flex items-center gap-1"
                >
                  Voir toutes les annonces
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
