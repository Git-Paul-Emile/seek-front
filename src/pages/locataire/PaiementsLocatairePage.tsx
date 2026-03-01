import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
  Smartphone,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wallet,
  Clock,
  Send,
} from "lucide-react";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useLocataireEcheancier } from "@/hooks/useLocataireEcheancier";
import { useQuittancesLocataire } from "@/hooks/useQuittance";
import { generateQuittancePDF } from "@/lib/generateQuittance";
import type { StatutPaiement } from "@/api/bail";
import LocatairePayModal from "@/components/locataire/LocatairePayModal";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, {
  label: string;
  icon: React.ElementType;
  rowCls: string;
  iconCls: string;
  badgeCls: string;
}> = {
  A_VENIR:    { label: "À venir",             icon: CircleDashed, rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-500" },
  EN_ATTENTE: { label: "En attente",          icon: Clock,        rowCls: "bg-amber-50 border-amber-100",   iconCls: "text-amber-400",  badgeCls: "bg-amber-100 text-amber-700" },
  EN_RETARD:  { label: "En retard",           icon: AlertCircle,  rowCls: "bg-red-50 border-red-100",       iconCls: "text-red-400",    badgeCls: "bg-red-100 text-red-700" },
  PAYE:       { label: "Payé",               icon: CheckCircle2, rowCls: "bg-green-50 border-green-100",   iconCls: "text-green-500",  badgeCls: "bg-green-100 text-green-700" },
  PARTIEL:    { label: "Partiellement payé", icon: CheckCircle2, rowCls: "bg-orange-50 border-orange-100", iconCls: "text-orange-400", badgeCls: "bg-orange-100 text-orange-700" },
  ANNULE:     { label: "Annulé",             icon: CircleDashed, rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-400" },
};

const ORDER: Record<string, number> = {
  EN_RETARD: 0, EN_ATTENTE: 1, PARTIEL: 2, A_VENIR: 3, PAYE: 4, ANNULE: 5,
};

const isUnpaid = (s: string) => s !== "PAYE" && s !== "ANNULE";
const canDownload = (s: string) => s === "PAYE" || s === "PARTIEL";
const fmt = (n: number) => n.toLocaleString("fr-FR");

type StatutFilter = "TOUT" | "EN_RETARD" | "EN_ATTENTE" | "A_VENIR" | "PAYE" | "PARTIEL";

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PaiementsLocatairePage() {
  const { locataire } = useLocataireAuth();
  const bailActif = locataire?.bails?.find(b => b.statut === "ACTIF");
  const hasBailActif = !!bailActif;

  const { data: echeancier = [], isLoading } = useLocataireEcheancier(hasBailActif);
  const { data: quittances = [] } = useQuittancesLocataire(hasBailActif);

  const [filter, setFilter] = useState<StatutFilter>("TOUT");
  const [showPayModal, setShowPayModal] = useState(false);
  const [showMM, setShowMM] = useState(false);

  // Stats calculées depuis l'échéancier
  const nbPaye    = echeancier.filter(e => e.statut === "PAYE").length;
  const nbPartiel = echeancier.filter(e => e.statut === "PARTIEL").length;
  const nbEnRetard = echeancier.filter(e => e.statut === "EN_RETARD").length;
  const nbEnAttente = echeancier.filter(e => e.statut === "EN_ATTENTE").length;
  const nbAVenir  = echeancier.filter(e => e.statut === "A_VENIR").length;
  const nbPayeTotal = nbPaye + nbPartiel;
  const montantEnRetard = echeancier.filter(e => e.statut === "EN_RETARD").reduce((s, e) => s + e.montant, 0);
  const solde = echeancier.filter(e => isUnpaid(e.statut)).reduce((s, e) => s + e.montant, 0);

  // Prochaine échéance payable
  const nextPayable = echeancier
    .slice()
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime())
    .find(e => isUnpaid(e.statut));

  // Filtrage + tri
  const filtered = echeancier.filter(e => filter === "TOUT" || e.statut === filter);
  const sorted = [...filtered].sort(
    (a, b) =>
      (ORDER[a.statut] ?? 9) - (ORDER[b.statut] ?? 9) ||
      new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
  );

  const handleDownload = (ech: Echeance) => {
    const quittance = quittances.find(q => q.echeanceId === ech.id);
    if (!quittance || !ech.datePaiement) return;
    generateQuittancePDF({
      numero: quittance.numero,
      dateGeneration: new Date(quittance.dateGeneration).toLocaleDateString("fr-FR"),
      dateEcheance: ech.dateEcheance,
      datePaiement: ech.datePaiement,
      modePaiement: ech.modePaiement ?? undefined,
      reference: ech.reference ?? undefined,
      note: ech.note ?? undefined,
      montantLoyer: ech.montant,
      statut: ech.statut,
      bienTitre: bailActif?.bien?.titre ?? undefined,
      bienVille: bailActif?.bien?.ville ?? undefined,
      proprietaireNom: "Votre propriétaire",
      locataireNom: `${locataire?.prenom ?? ""} ${locataire?.nom ?? ""}`.trim(),
      locataireTelephone: locataire?.telephone ?? undefined,
    });
  };

  const FILTER_TABS: { key: StatutFilter; label: string; count?: number }[] = [
    { key: "TOUT",       label: "Tout",         count: echeancier.length },
    { key: "EN_RETARD",  label: "En retard",    count: nbEnRetard },
    { key: "EN_ATTENTE", label: "En attente",   count: nbEnAttente },
    { key: "A_VENIR",    label: "À venir",      count: nbAVenir },
    { key: "PAYE",       label: "Payés",        count: nbPaye },
    { key: "PARTIEL",    label: "Partiels",     count: nbPartiel },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (!bailActif) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Aucun bail actif.</p>
        <Link to="/locataire/dashboard" className="text-[#D4A843] text-sm font-medium mt-2 inline-block">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/locataire/dashboard"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Mes paiements
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35] truncate">
              {bailActif.bien?.titre || "Mon logement"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Bail depuis{" "}
              {new Date(bailActif.dateDebutBail).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Cartes de stats */}
      {echeancier.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-500">Payés</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">
              {nbPayeTotal}/{echeancier.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-slate-500">En retard</span>
            </div>
            <p className="text-xl font-bold text-red-600">{nbEnRetard}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {fmt(montantEnRetard)} FCFA
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#D4A843]" />
              <span className="text-xs font-medium text-slate-500">Solde dû</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">{fmt(solde)}</p>
            <p className="text-xs text-slate-400 mt-0.5">FCFA restants</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Total bail</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">
              {fmt(echeancier.reduce((s, e) => s + e.montant, 0))}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">FCFA sur {echeancier.length} éch.</p>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      {echeancier.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Progression des paiements</span>
            <span className="text-xs font-bold text-green-600">
              {Math.round((nbPayeTotal / echeancier.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(nbPayeTotal / echeancier.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
            <span className="text-green-600 font-medium">{nbPayeTotal} payés</span>
            {nbEnRetard > 0 && (
              <span className="text-red-500 font-medium">{nbEnRetard} en retard</span>
            )}
            {nbEnAttente > 0 && (
              <span className="text-amber-500 font-medium">{nbEnAttente} en attente</span>
            )}
            {nbAVenir > 0 && <span>{nbAVenir} à venir</span>}
          </div>
        </div>
      )}

      {/* Mobile Money */}
      <div className="bg-white rounded-2xl border border-[#D4A843]/20 p-4">
        <button
          type="button"
          onClick={() => setShowMM(v => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#D4A843]" />
            <span className="text-sm font-semibold text-[#0C1A35]">
              Moyens de paiement Mobile Money
            </span>
          </div>
          {showMM ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {showMM && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-3">
              <p className="text-xs font-bold text-[#0C1A35] mb-1">Orange Money</p>
              <p className="text-[11px] text-slate-500">
                Composez *144# puis suivez les instructions pour envoyer le montant.
              </p>
            </div>
            <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-3">
              <p className="text-xs font-bold text-[#0C1A35] mb-1">Wave</p>
              <p className="text-[11px] text-slate-500">
                Ouvrez l'application Wave et effectuez un envoi d'argent.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filtres + liste */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === tab.key
                  ? "bg-[#D4A843] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                    filter === tab.key
                      ? "bg-white/30 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste des échéances */}
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Aucune échéance pour ce filtre.
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map(ech => {
              const cfg = STATUT_CFG[ech.statut as StatutPaiement] ?? STATUT_CFG.A_VENIR;
              const Icon = cfg.icon;
              const isNext = nextPayable?.id === ech.id;
              const quittance = quittances.find(q => q.echeanceId === ech.id);

              return (
                <div
                  key={ech.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.rowCls}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${cfg.iconCls}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#0C1A35]">
                        {new Date(ech.dateEcheance).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeCls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmt(ech.montant)} FCFA
                    </p>
                    {ech.datePaiement && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Payé le{" "}
                        {new Date(ech.datePaiement).toLocaleDateString("fr-FR")}
                        {ech.modePaiement ? ` · ${ech.modePaiement}` : ""}
                        {ech.reference ? ` · Réf: ${ech.reference}` : ""}
                      </p>
                    )}
                    {ech.note && (
                      <p className="text-xs text-slate-400 italic mt-0.5">{ech.note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-bold text-[#0C1A35] whitespace-nowrap">
                      {fmt(ech.montant)} F
                    </p>
                    {/* Bouton initier paiement sur la prochaine échéance */}
                    {isNext && (
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#D4A843] hover:text-[#c49a38]
                          px-2.5 py-1.5 rounded-lg border border-[#D4A843]/30 hover:bg-[#D4A843]/10 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Payer
                      </button>
                    )}
                    {/* Télécharger quittance si disponible */}
                    {canDownload(ech.statut) && ech.datePaiement && quittance && (
                      <button
                        onClick={() => handleDownload(ech)}
                        title="Télécharger la quittance"
                        className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800
                          px-2.5 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Quittance
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal paiement */}
      {showPayModal && (
        <LocatairePayModal
          echeancier={echeancier}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
}
