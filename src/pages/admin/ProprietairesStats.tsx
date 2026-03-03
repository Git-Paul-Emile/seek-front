import { Link } from "react-router-dom";
import { 
  Users, 
  Building2, 
  Home, 
  UserCheck, 
  UserX, 
  Clock, 
  MapPin, 
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useProprietairesStats, useProprietaireDetail } from "@/hooks/useStats";

// ─── Carte statistique ────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color = "gold",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: "gold" | "blue" | "green" | "red" | "purple" | "yellow";
}) {
  const colors = {
    gold: "bg-[#D4A843]/10 text-[#D4A843]",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0C1A35]">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Badge statut vérification ────────────────────────────────────────────────

function VerificationBadge({ statut }: { statut: string }) {
  const styles: Record<string, string> = {
    NOT_VERIFIED: "bg-slate-100 text-slate-600",
    PENDING: "bg-yellow-100 text-yellow-700",
    VERIFIED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const labels: Record<string, string> = {
    NOT_VERIFIED: "Non vérifié",
    PENDING: "En attente",
    VERIFIED: "Vérifié",
    REJECTED: "Rejeté",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statut] || styles.NOT_VERIFIED}`}>
      {labels[statut] || statut}
    </span>
  );
}

// ─── Liste des propriétaires récents ─────────────────────────────────────────

function RecentProprietaires({ 
  proprietaires, 
  loading 
}: { 
  proprietaires: any[]; 
  loading: boolean 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#D4A843] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proprietaires.map((p) => (
        <div 
          key={p.id}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0C1A35]/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-[#0C1A35]">
                {p.prenom?.[0]}{p.nom?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#0C1A35]">
                {p.prenom} {p.nom}
              </p>
              <p className="text-xs text-slate-500">{p.telephone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VerificationBadge statut={p.statutVerification} />
            <span className="text-xs text-slate-400">
              {new Date(p.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Top propriétaires ───────────────────────────────────────────────────────

function TopProprietaires({ proprietaires, loading }: { proprietaires: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#D4A843] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proprietaires.map((p, index) => (
        <div 
          key={p.id}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-[#0C1A35]">
                {p.prenom} {p.nom}
              </p>
              <p className="text-xs text-slate-500">{p.telephone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-bold text-[#0C1A35]">{p.totalBiens}</p>
              <p className="text-xs text-slate-400">biens</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600">{p.biensActifs}</p>
              <p className="text-xs text-slate-400">actifs</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{p.totalLocataires}</p>
              <p className="text-xs text-slate-400">locataires</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Graphique répartition par ville ────────────────────────────────────────

function VilleChart({ data }: { data: { ville: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.ville} className="flex items-center gap-3">
          <div className="w-24 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.ville}</span>
          </div>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D4A843] rounded-full transition-all duration-500"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm font-medium text-slate-600">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Graphique répartition par statut ───────────────────────────────────────

function StatutChart({ data }: { data: { statut: string; count: number }[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const colors: Record<string, string> = {
    NOT_VERIFIED: "bg-slate-400",
    PENDING: "bg-yellow-400",
    VERIFIED: "bg-green-500",
    REJECTED: "bg-red-400",
  };
  const labels: Record<string, string> = {
    NOT_VERIFIED: "Non vérifié",
    PENDING: "En attente",
    VERIFIED: "Vérifié",
    REJECTED: "Rejeté",
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.statut} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors[item.statut] || "bg-slate-400"}`} />
              <span className="text-slate-600">{labels[item.statut] || item.statut}</span>
            </div>
            <span className="font-medium text-[#0C1A35]">{item.count}</span>
          </div>
        ))}
      </div>
      <div className="w-24 h-24 relative">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {data.reduce((acc, item, index) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            const prevPercent = acc.percent;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = -prevPercent;
            
            acc.elements.push(
              <circle
                key={item.statut}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={colors[item.statut]?.replace("bg-", "") || "#94a3b8"}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
            acc.percent += percent;
            return acc;
          }, { elements: [] as JSX.Element[], percent: 0 }).elements}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#0C1A35]">{total}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function ProprietairesStats() {
  const { data: stats, isLoading, error } = useProprietairesStats();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium">Erreur lors du chargement des statistiques</p>
          <p className="text-sm text-slate-500 mt-1">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

  const verified = stats?.byStatutVerification.find(s => s.statut === "VERIFIED")?.count || 0;
  const pending = stats?.byStatutVerification.find(s => s.statut === "PENDING")?.count || 0;
  const notVerified = stats?.byStatutVerification.find(s => s.statut === "NOT_VERIFIED")?.count || 0;
  const rejected = stats?.byStatutVerification.find(s => s.statut === "REJECTED")?.count || 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1A35]">Gestion des Propriétaires</h1>
          <p className="text-slate-500 mt-1">Statistiques et gestion des propriétaires</p>
        </div>
        <Link
          to="/admin/verifications"
          className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-xl font-medium hover:bg-[#c49933] transition-colors"
        >
          <Clock className="w-4 h-4" />
          Vérifications
          {pending > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white text-[#D4A843] text-xs font-bold rounded-full">
              {pending}
            </span>
          )}
        </Link>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Propriétaires"
          value={stats?.total || 0}
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Vérifiés"
          value={verified}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="En attente"
          value={pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Non vérifiés"
          value={notVerified}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Graphiques et classements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0C1A35] mb-4">Répartition par statut</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#D4A843] animate-spin" />
            </div>
          ) : (
            <StatutChart data={stats?.byStatutVerification || []} />
          )}
        </div>

        {/* Top villes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0C1A35] mb-4">Top Villes</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#D4A843] animate-spin" />
            </div>
          ) : stats?.byVille && stats.byVille.length > 0 ? (
            <VilleChart data={stats.byVille} />
          ) : (
            <p className="text-slate-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Top propriétaires */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0C1A35]">Top Propriétaires</h2>
            <TrendingUp className="w-5 h-5 text-[#D4A843]" />
          </div>
          <TopProprietaires 
            proprietaires={stats?.topProprietaires || []} 
            loading={isLoading} 
          />
        </div>

        {/* Propriétaires récents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0C1A35]">Inscriptions Récentes</h2>
            <Clock className="w-5 h-5 text-[#D4A843]" />
          </div>
          <RecentProprietaires 
            proprietaires={stats?.recentProprietaires || []} 
            loading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
