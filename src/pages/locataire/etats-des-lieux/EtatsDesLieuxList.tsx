import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gavel,
  FileText,
  ChevronRight,
  Home,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getAllEtatsDesLieuxLocataire, type EtatDesLieux, type StatutEtatDesLieux, type TypeEtatDesLieux } from "@/api/etatDesLieux.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const TYPE_CFG: Record<TypeEtatDesLieux, { label: string; cls: string }> = {
  ENTREE: { label: "Entrée",  cls: "bg-blue-100 text-blue-700" },
  SORTIE: { label: "Sortie",  cls: "bg-orange-100 text-orange-700" },
};

const STATUT_CFG: Record<StatutEtatDesLieux, { label: string; icon: React.ReactNode; cls: string }> = {
  BROUILLON:             { label: "Brouillon",           icon: <FileText className="w-3.5 h-3.5" />,        cls: "bg-slate-100 text-slate-600" },
  EN_ATTENTE_VALIDATION: { label: "À valider",           icon: <Clock className="w-3.5 h-3.5" />,           cls: "bg-amber-100 text-amber-700" },
  VALIDE:                { label: "Validé",               icon: <CheckCircle2 className="w-3.5 h-3.5" />,    cls: "bg-emerald-100 text-emerald-700" },
  CONTESTE:              { label: "Contesté",             icon: <AlertTriangle className="w-3.5 h-3.5" />,   cls: "bg-red-100 text-red-700" },
  EN_LITIGE:             { label: "En litige",            icon: <Gavel className="w-3.5 h-3.5" />,           cls: "bg-purple-100 text-purple-700" },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function EdlCard({ edl }: { edl: EtatDesLieux }) {
  const type   = TYPE_CFG[edl.type];
  const statut = STATUT_CFG[edl.statut] ?? { label: edl.statut, icon: null, cls: "bg-slate-100 text-slate-500" };
  const bien   = (edl as any).bien;
  const titre  = bien?.titre ?? "Logement";
  const adresse = [bien?.adresse, bien?.ville?.nom ?? bien?.ville].filter(Boolean).join(", ");

  const isActionable = edl.statut === "EN_ATTENTE_VALIDATION";

  return (
    <Link
      to={`/locataire/etats-des-lieux/${edl.id}`}
      className={`block bg-white rounded-2xl border transition-all duration-150 hover:shadow-md group ${
        isActionable ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-100"
      }`}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isActionable ? "bg-amber-100" : "bg-slate-100"
        }`}>
          <ClipboardList className={`w-5 h-5 ${isActionable ? "text-amber-600" : "text-slate-500"}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${type.cls}`}>
              {type.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statut.cls}`}>
              {statut.icon}
              {statut.label}
            </span>
            {isActionable && (
              <span className="text-xs text-amber-600 font-medium">Action requise</span>
            )}
          </div>

          <p className="text-sm font-semibold text-[#0C1A35] truncate">{titre}</p>
          {adresse && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Home className="w-3 h-3" />
              {adresse}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Réalisé le {fmtDate(edl.dateRealisation)}
            {edl.dateValidation && ` · Validé le ${fmtDate(edl.dateValidation)}`}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EtatsDesLieuxList() {
  const { data: edls = [], isLoading } = useQuery({
    queryKey: ["locataire-etats-des-lieux"],
    queryFn: getAllEtatsDesLieuxLocataire,
  });

  const actionables = edls.filter(
    (e) => e.statut === "EN_ATTENTE_VALIDATION" || e.statut === "CONTESTE"
  );
  const others = edls.filter(
    (e) => e.statut !== "EN_ATTENTE_VALIDATION" && e.statut !== "CONTESTE"
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Mon espace", to: "/locataire/dashboard" },
          { label: "États des lieux" },
        ]}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0C1A35]">États des lieux</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Tous vos états des lieux d'entrée et de sortie
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && edls.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Aucun état des lieux pour l'instant</p>
          <p className="text-xs text-slate-400 mt-1">
            Votre propriétaire vous notifiera par SMS lorsqu'un état des lieux sera disponible.
          </p>
        </div>
      )}

      {!isLoading && actionables.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Action requise
          </h2>
          {actionables.map((edl) => <EdlCard key={edl.id} edl={edl} />)}
        </section>
      )}

      {!isLoading && others.length > 0 && (
        <section className="space-y-3">
          {actionables.length > 0 && (
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Historique
            </h2>
          )}
          {others.map((edl) => <EdlCard key={edl.id} edl={edl} />)}
        </section>
      )}
    </div>
  );
}
