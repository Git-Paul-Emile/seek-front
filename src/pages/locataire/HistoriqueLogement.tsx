import { Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Home, MapPin, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getLocataireHistoriqueApi, type BailHistorique } from "@/api/locataireAuth";
import { SkPropertyCards } from "@/components/ui/Skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("fr-FR");
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const STATUT_CFG: Record<string, { label: string; cls: string }> = {
  ACTIF:         { label: "En cours",  cls: "bg-emerald-100 text-emerald-700" },
  TERMINE:       { label: "Terminé",   cls: "bg-slate-100 text-slate-600" },
  RESILIE:       { label: "Résilié",   cls: "bg-red-100 text-red-600" },
  EN_ATTENTE:    { label: "En attente",cls: "bg-amber-100 text-amber-700" },
  EN_PREAVIS:    { label: "Préavis",   cls: "bg-orange-100 text-orange-600" },
  ARCHIVE:       { label: "Archivé",   cls: "bg-slate-100 text-slate-400" },
};

function BailCard({ bail }: { bail: BailHistorique }) {
  const statut = STATUT_CFG[bail.statut] ?? { label: bail.statut, cls: "bg-slate-100 text-slate-500" };
  const photo = bail.bien.photos?.[0];
  const pct = bail.stats.total > 0 ? Math.round((bail.stats.payes / bail.stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Photo + statut */}
      <div className="relative h-36 bg-slate-100">
        {photo ? (
          <img src={photo} alt={bail.bien.titre ?? "logement"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${statut.cls}`}>
          {statut.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Titre + adresse */}
        <div>
          <p className="font-semibold text-[#0C1A35] text-sm truncate">
            {bail.bien.titre ?? "Logement sans titre"}
          </p>
          {(bail.bien.ville || bail.bien.pays) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {[bail.bien.adresse, bail.bien.ville, bail.bien.pays].filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{fmtDate(bail.dateDebutBail)}</span>
          {bail.dateFinBail && (
            <>
              <span>→</span>
              <span>{fmtDate(bail.dateFinBail)}</span>
            </>
          )}
          {!bail.dateFinBail && bail.statut === "ACTIF" && (
            <span className="text-emerald-600 font-medium">— en cours</span>
          )}
        </div>

        {/* Loyer */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Loyer mensuel</span>
          <span className="font-semibold text-[#0C1A35]">{fmt(bail.montantLoyer)} FCFA</span>
        </div>

        {/* Progression paiements */}
        {bail.stats.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{bail.stats.payes}/{bail.stats.total} échéances payées</span>
              <span className="font-medium text-[#0C1A35]">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HistoriqueLogement() {
  const { data: bails, isLoading } = useQuery({
    queryKey: ["locataire-historique"],
    queryFn: getLocataireHistoriqueApi,
  });

  const actifs  = bails?.filter((b) => b.statut === "ACTIF") ?? [];
  const anciens = bails?.filter((b) => b.statut !== "ACTIF") ?? [];

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[{ label: "Mon espace", to: "/locataire/dashboard" }, { label: "Mes logements" }]} />
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/locataire/dashboard"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
            text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-0.5">
            <Home className="w-3.5 h-3.5" />
            Mes logements
          </div>
          <h1 className="font-display text-xl font-bold text-[#0C1A35]">Historique des logements</h1>
        </div>
      </div>

      {isLoading && (
        <SkPropertyCards count={4} />
      )}

      {!isLoading && (!bails || bails.length === 0) && (
        <div className="text-center py-16 text-slate-400">
          <Home className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucun logement trouvé.</p>
        </div>
      )}

      {/* Bail actif */}
      {actifs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Logement actuel
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actifs.map((b) => <BailCard key={b.id} bail={b} />)}
          </div>
        </section>
      )}

      {/* Anciens bails */}
      {anciens.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Logements précédents
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {anciens.map((b) => <BailCard key={b.id} bail={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
