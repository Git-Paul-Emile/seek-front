import { useState, useRef } from "react";
import {
  Building2,
  Calendar,
  Banknote,
  CheckCircle,
  Home,
  LayoutDashboard,
  Phone,
  Mail,
  User,
  Clock,
  TrendingUp,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  ChevronDown,
  FileText,
  X,
  Loader2,
  Receipt,
  Download,
  ArrowRight,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import LocatairePayModal from "@/components/locataire/LocatairePayModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useLocataireEcheancier } from "@/hooks/useLocataireEcheancier";
import { useQuittancesLocataire } from "@/hooks/useQuittance";
import type { StatutPaiement } from "@/api/bail";
import { getLocataireContratApi, type ContratLocataireData } from "@/api/locataireAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const fmtMontant = (n?: number | null) =>
  n != null ? `${n.toLocaleString("fr-FR")} FCFA` : "—";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireDashboard() {
  const { locataire } = useLocataireAuth();

  const hasBailActif = locataire?.bails?.some((b) => b.statut === "ACTIF") ?? false;

  const [echeancierExpanded, setEcheancierExpanded] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const { data: echeancier = [] } = useLocataireEcheancier(hasBailActif);

  // Quittances
  const { data: quittances = [], isLoading: quittancesLoading } = useQuittancesLocataire(hasBailActif);

  // État pour le modal de contrat
  const [showContratModal, setShowContratModal] = useState(false);
  const [contratData, setContratData] = useState<ContratLocataireData | null>(null);
  const [loadingContrat, setLoadingContrat] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleVoirContrat = async () => {
    setShowContratModal(true);
    setLoadingContrat(true);
    try {
      const data = await getLocataireContratApi();
      setContratData(data);
    } catch (err) {
      console.error("Erreur chargement contrat:", err);
      setContratData(null);
    } finally {
      setLoadingContrat(false);
    }
  };

  const handleDownloadPdf = async () => {
    const el = pdfRef.current;
    if (!el) { toast.error("Élément non trouvé"); return; }
    const titre = contratData?.contrat?.titre ?? "Contrat de bail";
    try {
      toast.loading("Génération du PDF...", { id: "pdf" });
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight  = (canvas.height * pageWidth) / canvas.width;
      let y = 0;
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pageWidth, imgHeight);
        y += pageHeight;
      }
      pdf.save(`${titre.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF téléchargé", { id: "pdf" });
    } catch {
      toast.error("Erreur lors de la génération du PDF", { id: "pdf" });
    }
  };

  if (!locataire) return null;

  const bailActif = locataire.bails?.find((b) => b.statut === "ACTIF");

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Bonjour,{" "}
          <span className="text-[#D4A843]">
            {locataire.prenom} {locataire.nom}
          </span>
        </h1>
        <p className="text-slate-400 mt-0.5 text-sm">
          Bienvenue dans votre espace locataire
        </p>
      </div>

      {/* Statut du compte */}
      <div className="flex items-center gap-2">
        {locataire.statut === "ACTIF" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Compte actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            En attente d'activation
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Bail actif ── */}
        <div className="lg:col-span-2 space-y-5">
          {bailActif ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5 flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                Mon logement actuel
              </h2>

              {/* Bien */}
              <div className="bg-[#0C1A35] rounded-xl p-4 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A843]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#D4A843]" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {bailActif.bien?.titre || bailActif.bien?.ville || "Logement"}
                  </p>
                  {bailActif.bien?.ville && bailActif.bien?.titre && (
                    <p className="text-xs text-white/50 mt-0.5">{bailActif.bien.ville}</p>
                  )}
                </div>
              </div>

              {/* Infos bail */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Loyer mensuel"
                  value={fmtMontant(bailActif.montantLoyer)}
                  icon={<Banknote className="w-3.5 h-3.5 text-[#D4A843]" />}
                />
                <StatBox
                  label="Début du bail"
                  value={fmt(bailActif.dateDebutBail)}
                  icon={<Calendar className="w-3.5 h-3.5 text-[#D4A843]" />}
                />
                {bailActif.dateFinBail && (
                  <StatBox
                    label="Fin du bail"
                    value={fmt(bailActif.dateFinBail)}
                    icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
                  />
                )}
              </div>

              {/* Bouton voir le contrat */}
              <button
                onClick={handleVoirContrat}
                className="flex items-center justify-center gap-2 w-full mt-4 px-3 py-2.5 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Voir le contrat
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">Aucun bail actif</p>
              <p className="text-sm text-slate-400 mt-1">
                Votre propriétaire n'a pas encore associé de bien à votre compte.
              </p>
            </div>
          )}

          {/* ── Échéancier des loyers ── */}
          {bailActif && echeancier.length > 0 && (() => {
            const STATUT_CFG: Record<string, { label: string; icon: React.ElementType; rowCls: string; iconCls: string; badgeCls: string }> = {
              A_VENIR:    { label: "À venir",            icon: CircleDashed,  rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-500" },
              EN_ATTENTE: { label: "En attente",         icon: AlertCircle,   rowCls: "bg-amber-50 border-amber-100",   iconCls: "text-amber-400",  badgeCls: "bg-amber-100 text-amber-700" },
              EN_RETARD:  { label: "En retard",          icon: AlertCircle,   rowCls: "bg-red-50 border-red-100",       iconCls: "text-red-400",    badgeCls: "bg-red-100 text-red-700" },
              PAYE:       { label: "Payé",               icon: CheckCircle2,  rowCls: "bg-green-50 border-green-100",   iconCls: "text-green-500",  badgeCls: "bg-green-100 text-green-700" },
              PARTIEL:    { label: "Partiellement payé", icon: CheckCircle2,  rowCls: "bg-orange-50 border-orange-100", iconCls: "text-orange-400", badgeCls: "bg-orange-100 text-orange-700" },
              ANNULE:     { label: "Annulé",             icon: CircleDashed,  rowCls: "bg-slate-50 border-slate-100",   iconCls: "text-slate-300",  badgeCls: "bg-slate-100 text-slate-400" },
            };

            const total   = echeancier.length;
            const payes   = echeancier.filter(e => e.statut === "PAYE" || e.statut === "PARTIEL").length;
            const retards = echeancier.filter(e => e.statut === "EN_RETARD").length;

            const ORDER: Record<string, number> = { EN_RETARD: 0, EN_ATTENTE: 1, A_VENIR: 2, PARTIEL: 3, PAYE: 4, ANNULE: 5 };
            const sorted = [...echeancier].sort((a, b) =>
              (ORDER[a.statut] ?? 9) - (ORDER[b.statut] ?? 9) ||
              new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
            );
            const visible = echeancierExpanded ? sorted : sorted.slice(0, 4);
            const firstUnpaidId = sorted.find(e => e.statut !== "PAYE" && e.statut !== "ANNULE")?.id;

            return (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Mes loyers
                  </h2>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">{payes}/{total} payés</span>
                    {retards > 0 && <span className="font-semibold text-red-500">{retards} en retard</span>}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (payes / total) * 100 : 0}%` }}
                  />
                </div>

                {/* Liste */}
                <div className="space-y-1.5">
                  {visible.map((ech) => {
                    const cfg = STATUT_CFG[ech.statut as StatutPaiement] ?? STATUT_CFG.A_VENIR;
                    const Icon = cfg.icon;
                    return (
                      <div key={ech.id} className={`flex items-center justify-between p-2 rounded-lg border ${cfg.rowCls}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.iconCls}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-medium text-slate-700">
                                {new Date(ech.dateEcheance).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badgeCls}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {ech.montant.toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {(ech.statut === "PAYE" || ech.statut === "PARTIEL") && ech.datePaiement && (
                            <span className="text-[9px] text-slate-400">
                              {new Date(ech.datePaiement).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          {ech.id === firstUnpaidId && (
                            <button
                              onClick={() => setShowPayModal(true)}
                              className="flex items-center gap-1 text-[10px] font-semibold text-[#D4A843] hover:text-[#c49a38]
                                px-2 py-1 rounded-lg border border-[#D4A843]/30 hover:bg-[#D4A843]/10 transition-colors"
                            >
                              <Send className="w-2.5 h-2.5" />
                              Payer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {total > 4 && (
                  <button
                    onClick={() => setEcheancierExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mt-3"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${echeancierExpanded ? "rotate-180" : ""}`} />
                    {echeancierExpanded ? "Réduire" : `Voir tout (${total})`}
                  </button>
                )}
              </div>
            );
          })()}

        </div>

        {/* ── Infos personnelles ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Mes informations
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {locataire.telephone}
              </div>
              {locataire.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {locataire.email}
                </div>
              )}
              {locataire.nationalite && (
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {locataire.nationalite}
                </div>
              )}
              {locataire.situationProfessionnelle && (
                <div className="text-slate-500 text-xs bg-slate-50 rounded-lg px-2.5 py-1.5 mt-2">
                  {locataire.situationProfessionnelle}
                </div>
              )}
            </div>
          </div>

          {/* Identité — uniquement si remplie */}
          {(locataire.typePiece || locataire.dateNaissance) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                Identité
              </h2>
              <div className="space-y-2">
                {locataire.dateNaissance && (
                  <Row label="Naissance" value={fmt(locataire.dateNaissance)} />
                )}
                {locataire.typePiece && (
                  <Row label="Pièce" value={`${locataire.typePiece}${locataire.numPieceIdentite ? ` — ${locataire.numPieceIdentite}` : ""}`} />
                )}
                {locataire.dateExpiration && (
                  <Row label="Expire le" value={fmt(locataire.dateExpiration)} />
                )}
              </div>
            </div>
          )}

          {/* Lien vers la page paiements */}
          {bailActif && (
            <Link
              to="/locataire/paiements"
              className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between group hover:border-[#D4A843]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#D4A843]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C1A35]">Mes paiements</p>
                  <p className="text-xs text-slate-400 mt-0.5">Historique, statuts et paiement Mobile Money</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#D4A843] transition-colors shrink-0" />
            </Link>
          )}

          {/* Quittances */}
          {hasBailActif && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5" />
                Mes quittances
              </h2>
              {quittancesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : quittances.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Aucune quittance disponible.<br />
                  <span className="text-[10px]">Elles apparaissent après confirmation du paiement.</span>
                </p>
              ) : (
                <div className="space-y-2">
                  {quittances.map(q => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2.5 bg-green-50 border border-green-100 rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#0C1A35]">{q.numero}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {q.echeance
                            ? new Date(q.echeance.dateEcheance).toLocaleDateString("fr-FR", {
                                month: "long",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          {q.echeance?.statut === "PARTIEL" ? "Partiel" : "Payé"}
                        </span>
                        {q.echeance?.montant != null && (
                          <span className="text-[10px] text-slate-400">
                            {q.echeance.montant.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal paiement locataire */}
      {showPayModal && (
        <LocatairePayModal
          echeancier={echeancier}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {/* Modal de contrat */}
      {showContratModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {contratData?.contrat?.titre || "Contrat de bail"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Bail {contratData?.bail?.typeBail || "Standard"} · {contratData?.bien?.titre || contratData?.bien?.ville || ""}
                  </p>
                </div>
                {contratData?.contrat?.statut && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contratData.contrat.statut === "ACTIF"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}>
                    {contratData.contrat.statut === "ACTIF" && <CheckCircle className="w-3 h-3" />}
                    {contratData.contrat.statut === "ACTIF" ? "Actif" : "Brouillon"}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowContratModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Toolbar */}
            {!loadingContrat && contratData && (
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex-wrap flex-shrink-0">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger PDF
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {loadingContrat ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-500">Chargement du contrat...</p>
                </div>
              ) : !contratData ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <FileText className="w-12 h-12 text-gray-300" />
                  <p className="text-sm text-gray-500 text-center max-w-xs">
                    Aucun contrat n'a été trouvé pour votre bail.
                  </p>
                </div>
              ) : (
                <div
                  ref={pdfRef}
                  className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
                >
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: contratData.contrat.contenu }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composants helpers ────────────────────────────────────────────────────────

const StatBox = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-[#F8F5EE] rounded-xl p-4">
    <p className="text-xs text-slate-400 uppercase font-medium mb-1.5 flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="font-bold text-[#0C1A35] text-sm">{value}</p>
  </div>
);

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  ) : null;
