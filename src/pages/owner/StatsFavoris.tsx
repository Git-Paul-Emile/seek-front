import { Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Heart, Loader2, Home } from "lucide-react";
import { useStatsFavorisOwner } from "@/hooks/useBien";

// ─── Ligne de stats d'un bien ─────────────────────────────────────────────────

function BienRow({ bien, rank }: {
  bien: { id: string; titre: string | null; ville: string | null; nbFavoris: number };
  rank: number;
}) {
  const isPopular = bien.nbFavoris >= 10;

  return (
    <>
      <div
        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/owner/biens/${bien.id}`}
              className="text-sm font-medium text-slate-700 hover:text-[#D4A843] transition-colors truncate"
            >
              {bien.titre ?? "Sans titre"}
            </Link>
            {isPopular && (
              <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-600">
                <Heart className="w-2.5 h-2.5" /> Populaire
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{bien.ville ?? ""}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-right text-xs text-slate-500">
          <div>
            <div className="flex items-center gap-1 font-semibold text-sm text-[#0C1A35]">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              {bien.nbFavoris.toLocaleString("fr-FR")}
            </div>
            <p className="text-slate-400">Favoris</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function StatsFavoris() {
  const { data, isLoading } = useStatsFavorisOwner();

  const kpis = [
    {
      icon: Heart,
      color: "text-pink-500",
      label: "Favoris totaux",
      value: data?.favorisTotaux ?? 0,
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
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Statistiques de favoris" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Statistiques de favoris</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance de vos annonces auprès des utilisateurs</p>
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
          <h2 className="text-sm font-semibold text-[#0C1A35]">Classement par favoris</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : !data || data.topAnnonces.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Heart className="w-10 h-10 mb-3 opacity-30" />
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
