import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Bell,
  FileText,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useBienById } from "@/hooks/useBien";
import {
  useBailActif,
  useEcheancier,
  useSolde,
  useMobileMoney,
  useProlongerEcheancesAnnee,
} from "@/hooks/useBail";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { generateQuittancePDF } from "@/lib/generateQuittance";
import { generateRelancePDF } from "@/lib/generateRelance";
import { genererQuittanceApi } from "@/api/quittance";
import { useEnvoyerRappel } from "@/hooks/useQuittance";
import type { Echeance } from "@/api/bail";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutFilter = "TOUT" | "EN_RETARD" | "EN_ATTENTE" | "A_VENIR" | "PAYE" | "PARTIEL";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, {
  label: string;
  icon: React.ElementType;
  rowCls: string;
  iconCls: string;
  badgeCls: string;
}> = {
  A_VENIR:    { label: "À venir",             icon: CircleDashed,  rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-500" },
  EN_ATTENTE: { label: "En attente",          icon: Clock,         rowCls: "bg-amber-50 border-amber-100",   iconCls: "text-amber-400",  badgeCls: "bg-amber-100 text-amber-700" },
  EN_RETARD:  { label: "En retard",           icon: AlertCircle,   rowCls: "bg-red-50 border-red-100",       iconCls: "text-red-400",    badgeCls: "bg-red-100 text-red-700" },
  PAYE:       { label: "Payé",                icon: CheckCircle2,  rowCls: "bg-green-50 border-green-100",   iconCls: "text-green-500",  badgeCls: "bg-green-100 text-green-700" },
  PARTIEL:    { label: "Partiellement payé",  icon: CheckCircle2,  rowCls: "bg-orange-50 border-orange-100", iconCls: "text-orange-400", badgeCls: "bg-orange-100 text-orange-700" },
  ANNULE:     { label: "Annulé",              icon: CircleDashed,  rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-400" },
};

const ORDER: Record<string, number> = {
  EN_RETARD: 0, EN_ATTENTE: 1, PARTIEL: 2, A_VENIR: 3, PAYE: 4, ANNULE: 5,
};

const canDownload = (s: string) => s === "PAYE" || s === "PARTIEL";

const joursRetard = (dateEcheance: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(dateEcheance).getTime()) / 86400000));

const fmt = (n: number) => n.toLocaleString("fr-FR");

// ─── Bouton rappel SMS ────────────────────────────────────────────────────────

function RappelButton({
  bienId,
  bailId,
  echeanceId,
}: {
  bienId: string;
  bailId: string;
  echeanceId: string;
}) {
  const { mutate, isPending } = useEnvoyerRappel();
  return (
    <button
      onClick={() =>
        mutate(
          { bienId, bailId, echeanceId },
          {
            onSuccess: (data) =>
              toast.success(data.message ?? "Rappel programmé"),
            onError: () => toast.error("Erreur lors de l'envoi du rappel"),
          }
        )
      }
      disabled={isPending}
      title="Envoyer un rappel SMS au locataire"
      className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800
        px-2.5 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Bell className="w-3 h-3" />
      )}
      Rappel
    </button>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PaiementsPage() {
  const { id } = useParams<{ id: string }>();
  const { owner } = useOwnerAuth();

  const { data: bien, isLoading: bienLoading } = useBienById(id ?? "");
  const { data: bail, isLoading: bailLoading } = useBailActif(id ?? "");
  const { data: echeancier = [], isLoading: echLoading } = useEcheancier(
    id ?? "",
    bail?.id ?? ""
  );
  const { data: solde } = useSolde(id ?? "", bail?.id ?? "");
  const { data: mobileMoney } = useMobileMoney(id ?? "");

  const { mutate: prolongerAnnee, isPending: isProlonging } = useProlongerEcheancesAnnee();

  const [filter, setFilter] = useState<StatutFilter>("TOUT");
  const [showAllMM, setShowAllMM] = useState(false);

  const currentYear = new Date().getFullYear();
  // displayYear contrôle jusqu'à quelle année les A_VENIR sont affichées
  const [displayYear, setDisplayYear] = useState(currentYear);

  // N'afficher les A_VENIR que jusqu'à displayYear (masque les années futures pré-générées)
  const visibleEcheancier = echeancier.filter(
    e => e.statut !== "A_VENIR" || new Date(e.dateEcheance).getFullYear() <= displayYear
  );

  // Bannière : dernière échéance visible est en décembre de displayYear, bail continue au-delà
  const lastVisible = visibleEcheancier.length > 0
    ? visibleEcheancier.reduce((a, b) =>
        new Date(a.dateEcheance) > new Date(b.dateEcheance) ? a : b
      )
    : null;
  const showRenewalBanner =
    !!bail &&
    ["ACTIF", "EN_PREAVIS", "EN_RENOUVELLEMENT"].includes(bail.statut) &&
    !!lastVisible &&
    new Date(lastVisible.dateEcheance).getFullYear() === displayYear &&
    new Date(lastVisible.dateEcheance).getMonth() === 11 &&
    (!bail.dateFinBail || new Date(bail.dateFinBail).getFullYear() > displayYear);

  const isLoading = bienLoading || bailLoading || echLoading;

  // Filtrage + tri sur les échéances visibles
  const filtered = visibleEcheancier.filter(
    e => filter === "TOUT" || e.statut === filter
  );
  const sorted = [...filtered].sort(
    (a, b) =>
      (ORDER[a.statut] ?? 9) - (ORDER[b.statut] ?? 9) ||
      new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
  );

  const handleDownload = async (ech: Echeance) => {
    if (!bail || !bien || !owner) return;
    // Génère (ou récupère) la quittance en DB → vrai numéro
    let quittanceNumero = ech.id.slice(0, 8).toUpperCase();
    let dateGeneration = new Date().toLocaleDateString("fr-FR");
    try {
      const q = await genererQuittanceApi(id!, bail.id, ech.id);
      quittanceNumero = q.numero;
      dateGeneration = new Date(q.dateGeneration).toLocaleDateString("fr-FR");
    } catch {
      // fallback sur l'ID local si l'API échoue
    }
    generateQuittancePDF({
      numero: quittanceNumero,
      dateGeneration,
      dateEcheance: ech.dateEcheance,
      datePaiement: ech.datePaiement!,
      modePaiement: ech.modePaiement ?? undefined,
      reference: ech.reference ?? undefined,
      note: ech.note ?? undefined,
      montantLoyer: ech.montant,
      statut: ech.statut,
      bienTitre: bien.titre ?? undefined,
      bienAdresse:
        [bien.adresse, bien.quartier].filter(Boolean).join(", ") || undefined,
      bienVille: bien.ville ?? undefined,
      bienPays: bien.pays ?? undefined,
      proprietaireNom: `${owner.prenom} ${owner.nom}`,
      proprietaireTelephone: owner.telephone,
      locataireNom: `${bail.locataire.prenom} ${bail.locataire.nom}`,
      locataireTelephone: bail.locataire.telephone,
    });
  };

  const FILTER_TABS: { key: StatutFilter; label: string; count?: number }[] = [
    { key: "TOUT",       label: "Tout",       count: visibleEcheancier.length },
    { key: "EN_RETARD",  label: "En retard",  count: visibleEcheancier.filter(e => e.statut === "EN_RETARD").length },
    { key: "EN_ATTENTE", label: "En attente", count: visibleEcheancier.filter(e => e.statut === "EN_ATTENTE").length },
    { key: "A_VENIR",    label: "À venir",    count: visibleEcheancier.filter(e => e.statut === "A_VENIR").length },
    { key: "PAYE",       label: "Payés",      count: visibleEcheancier.filter(e => e.statut === "PAYE").length },
    { key: "PARTIEL",    label: "Partiels",   count: visibleEcheancier.filter(e => e.statut === "PARTIEL").length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Bien introuvable.</p>
        <Link to="/owner/biens" className="text-[#D4A843] text-sm font-medium mt-2 inline-block">
          Retour à mes biens
        </Link>
      </div>
    );
  }

  if (!bail) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Aucun bail actif pour ce bien.</p>
        <Link
          to={`/owner/biens/${id}`}
          className="text-[#D4A843] text-sm font-medium mt-2 inline-block"
        >
          Retour au bien
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
            to={`/owner/biens/${id}`}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Historique des paiements
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35] truncate">
              {bien.titre || "Logement"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {bail.locataire.prenom} {bail.locataire.nom} — bail depuis{" "}
              {new Date(bail.dateDebutBail).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Cartes de solde */}
      {solde && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-500">Payés</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">
              {solde.nbPaye}/{solde.totalEcheances}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {fmt(solde.montantPaye)} FCFA
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-slate-500">En retard</span>
            </div>
            <p className="text-xl font-bold text-red-600">{solde.nbEnRetard}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {fmt(solde.montantEnRetard)} FCFA
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#D4A843]" />
              <span className="text-xs font-medium text-slate-500">Solde dû</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">
              {fmt(solde.solde)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">FCFA restants</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Total bail</span>
            </div>
            <p className="text-xl font-bold text-[#0C1A35]">
              {fmt(solde.montantTotalDu)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">FCFA sur {solde.totalEcheances} éch.</p>
          </div>
        </div>
      )}

      {/* Barre de progression globale */}
      {solde && solde.totalEcheances > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Progression des paiements</span>
            <span className="text-xs font-bold text-green-600">
              {Math.round((solde.nbPaye / solde.totalEcheances) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(solde.nbPaye / solde.totalEcheances) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
            <span className="text-green-600 font-medium">{solde.nbPaye} payés</span>
            {solde.nbEnRetard > 0 && (
              <span className="text-red-500 font-medium">{solde.nbEnRetard} en retard</span>
            )}
            {solde.nbEnAttente > 0 && (
              <span className="text-amber-500 font-medium">{solde.nbEnAttente} en attente</span>
            )}
            {solde.nbAVenir > 0 && <span>{solde.nbAVenir} à venir</span>}
          </div>
        </div>
      )}

      {/* Mobile Money */}
      {mobileMoney && mobileMoney.providers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#D4A843]/20 p-4">
          <button
            type="button"
            onClick={() => setShowAllMM(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#D4A843]" />
              <span className="text-sm font-semibold text-[#0C1A35]">
                Moyens de paiement Mobile Money
                {mobileMoney.pays ? ` — ${mobileMoney.pays}` : ""}
              </span>
            </div>
            {showAllMM ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {showAllMM && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {mobileMoney.providers.map((p, i) => (
                <div key={i} className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-[#0C1A35] mb-1">{p.nom}</p>
                  <p className="text-[11px] text-slate-500">{p.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bannière renouvellement annuel */}
      {showRenewalBanner && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-100">
            <CalendarPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-800">
              Paiements planifiés jusqu'en décembre {currentYear}
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Renouvelez le bail pour générer les paiements de {currentYear + 1}.
            </p>
          </div>
          <button
            onClick={() =>
              prolongerAnnee(
                { bienId: id!, bailId: bail!.id, anneeActuelle: displayYear },
                {
                  onSuccess: (res) => {
                    setDisplayYear(res.annee);
                    toast.success(
                      res.generated > 0
                        ? `${res.generated} paiement(s) générés pour ${res.annee}`
                        : `Paiements de ${res.annee} affichés`
                    );
                  },
                  onError: () =>
                    toast.error("Impossible de générer les paiements"),
                }
              )
            }
            disabled={isProlonging}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isProlonging ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarPlus className="w-4 h-4" />
            )}
            Générer {currentYear + 1}
          </button>
        </div>
      )}

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
              const cfg = STATUT_CFG[ech.statut] ?? STATUT_CFG.A_VENIR;
              const Icon = cfg.icon;
              const total = ech.montant;

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
                      {(ech.statut === "PAYE" || ech.statut === "PARTIEL") && ech.sourceEnregistrement && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          ech.sourceEnregistrement === "LOCATAIRE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {ech.sourceEnregistrement === "LOCATAIRE" ? "Locataire" : "Propriétaire"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmt(total)} FCFA
                    </p>
                    {ech.statut === "EN_RETARD" && (
                      <p className="text-xs text-red-500 font-semibold mt-0.5">
                        {joursRetard(ech.dateEcheance)} jours de retard
                      </p>
                    )}
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
                      {fmt(total)} F
                    </p>
                    {/* Relance PDF sur EN_RETARD */}
                    {ech.statut === "EN_RETARD" && (
                      <button
                        onClick={() => {
                          if (!bail || !bien || !owner) return;
                          generateRelancePDF({
                            numero: ech.id.slice(0, 8).toUpperCase(),
                            dateGeneration: new Date().toLocaleDateString("fr-FR"),
                            dateEcheance: ech.dateEcheance,
                            joursRetard: joursRetard(ech.dateEcheance),
                            montant: ech.montant,
                            bienTitre: bien.titre ?? undefined,
                            bienAdresse: [bien.adresse, bien.quartier].filter(Boolean).join(", ") || undefined,
                            bienVille: bien.ville ?? undefined,
                            bienPays: bien.pays ?? undefined,
                            proprietaireNom: `${owner.prenom} ${owner.nom}`,
                            proprietaireTelephone: owner.telephone,
                            locataireNom: `${bail.locataire.prenom} ${bail.locataire.nom}`,
                            locataireTelephone: bail.locataire.telephone,
                          });
                        }}
                        title="Télécharger la lettre de relance"
                        className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Relance
                      </button>
                    )}
                    {/* Rappel SMS sur EN_RETARD / EN_ATTENTE */}
                    {(ech.statut === "EN_RETARD" || ech.statut === "EN_ATTENTE") && bail && (
                      <RappelButton
                        bienId={id!}
                        bailId={bail.id}
                        echeanceId={ech.id}
                      />
                    )}
                    {canDownload(ech.statut) && ech.datePaiement && (
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

    </div>
  );
}
