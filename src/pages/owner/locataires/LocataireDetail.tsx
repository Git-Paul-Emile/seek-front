import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Users,
  Baby,
  Link2,
  Copy,
  Check,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  Calendar,
  Banknote,
  Trash2,
  FileText,
  Shield,
  ZoomIn,
  Loader2,
} from "lucide-react";

// helper for displaying sexe values (owner detail view)
const displaySexe = (s?: string | null) => {
  if (!s) return "";
  const up = s.trim().toUpperCase();
  if (up === "M" || up.startsWith("MASC")) return "Masculin";
  if (up === "F" || up.startsWith("FEM")) return "Féminin";
  return s;
};
import { 
  useLocataireById, 
  useDeleteLocataire, 
  useGetLienActivation,
  useApproveLocataireVerification,
  useRejectLocataireVerification,
} from "@/hooks/useLocataire";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import type { StatutLocataire, LocataireVerification } from "@/api/locataire";
import ContratModal from "../biens/ContratModal";
import type { Bail } from "@/api/bail";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<
  StatutLocataire,
  { label: string; color: string; icon: React.ReactNode }
> = {
  INVITE: {
    label: "En attente d'activation",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ACTIF: {
    label: "Actif",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  INACTIF: {
    label: "Inactif",
    color: "bg-slate-100 text-slate-500",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const fmt = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR") : "";

const fmtMontant = (n?: number | null) =>
  n != null ? `${n.toLocaleString("fr-FR")} FCFA` : "";

// Motifs de rejet pour les propriétaires
const REJECTION_MOTIFS = [
  "Document illisible",
  "Document expiré",
  "Informations non conformes au compte",
  "Photo non correspondante",
  "Document incomplet",
  "Suspicion de fraude",
];

// Checklist pour la validation
interface ValidationChecklist {
  documentLisible: boolean;
  documentComplet: boolean;
  documentNonExpire: boolean;
  nomCorrespond: boolean;
  selfieCorrespond: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: locataire, isLoading } = useLocataireById(id!);
  const deleteLocataire = useDeleteLocataire();
  const getLien = useGetLienActivation();
  const approveVerification = useApproveLocataireVerification();
  const rejectVerification = useRejectLocataireVerification();
  const [lien, setLien] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedBail, setSelectedBail] = useState<Bail | null>(null);
  
  // States pour la vérification
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [checklist, setChecklist] = useState<ValidationChecklist>({
    documentLisible: false,
    documentComplet: false,
    documentNonExpire: false,
    nomCorrespond: false,
    selfieCorrespond: false,
  });
  const [selectedMotif, setSelectedMotif] = useState("");
  const [customMotif, setCustomMotif] = useState("");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Forcer refresh si paramètre refreshed=true
  useEffect(() => {
    if (searchParams.get('refreshed') === 'true') {
      queryClient.invalidateQueries({ queryKey: ["locataires", id] });
    }
  }, [searchParams, queryClient, id]);

  // Afficher le lien d'activation si le locataire est en attente d'activation
  // ET qu'il a au moins un bail avec un contrat actif
  const peutAfficherLien = Boolean(
    locataire &&
    locataire.statut === "INVITE" &&
    Array.isArray(locataire.bails) &&
    locataire.bails.some((bail) => bail.contrat && bail.contrat.statut === "ACTIF")
  );

  // Auto-fetch lien d'activation au chargement si contrat validé
  const handleGetLien = useCallback(async () => {
    try {
      const result = await getLien.mutateAsync(id!);
      setLien(result.lien);
    } catch {
      toast.error("Erreur lors de la récupération du lien");
    }
  }, [getLien, id]);

  useEffect(() => {
    if (peutAfficherLien && !lien && !getLien.isPending) {
      handleGetLien();
    }
  }, [peutAfficherLien, lien, getLien.isPending, handleGetLien]);

  const handleCopy = () => {
    if (!lien) return;
    navigator.clipboard.writeText(lien);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteLocataire.mutateAsync(id!);
      toast.success("Locataire supprimé");
      navigate("/owner/locataires");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la suppression";
      toast.error(msg);
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveVerification.mutateAsync(id!);
      toast.success("Vérification approuvée");
      setShowVerifyModal(false);
      setChecklist({
        documentLisible: false,
        documentComplet: false,
        documentNonExpire: false,
        nomCorrespond: false,
        selfieCorrespond: false,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de l'approbation";
      toast.error(msg);
    }
  };

  const handleReject = async () => {
    const motif = selectedMotif === "autre" ? customMotif : selectedMotif;
    if (!motif) {
      toast.error("Veuillez sélectionner ou saisir un motif de rejet");
      return;
    }
    try {
      await rejectVerification.mutateAsync({ locataireId: id!, motif });
      toast.success("Vérification rejetée");
      setShowRejectModal(false);
      setSelectedMotif("");
      setCustomMotif("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors du rejet";
      toast.error(msg);
    }
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (!locataire) {
    return (
      <div className="text-center py-20 text-slate-400">Locataire introuvable</div>
    );
  }

  const cfg = STATUT_CONFIG[locataire.statut] ?? { label: locataire.statut, color: "bg-slate-100 text-slate-500", icon: null };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Locataires", to: "/owner/locataires" }, { label: locataire ? `${locataire.prenom} ${locataire.nom}` : "Détail" }]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/owner/locataires")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-full bg-[#0C1A35] flex items-center justify-center font-bold text-white">
            {locataire.prenom[0]}{locataire.nom[0]}
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-[#0C1A35]">
              {locataire.prenom} {locataire.nom}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Lien d'activation - uniquement si contrat validé ET locataire pas encore actif */}
      {peutAfficherLien && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-sm">
                {locataire.statut === 'INVITE' 
                  ? 'Contrat validé - partagez ce lien d\'activation avec le locataire'
                  : 'Le locataire peut désormais se connecter à son espace'}
              </p>
              {lien ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={lien}
                    readOnly
                    className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-slate-700 min-w-0 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A843] text-white rounded-lg text-xs font-medium hover:bg-[#c49a3a] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGetLien}
                  disabled={getLien.isPending}
                  className="mt-3 px-4 py-1.5 bg-[#D4A843] text-white rounded-lg text-xs font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
                >
                  {getLien.isPending ? "Génération..." : "Générer le lien"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Infos de base */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Informations de base
          </h2>
          <div className="space-y-3 text-sm">
            <a
              href={`tel:${locataire.telephone}`}
              className="flex items-center gap-2 text-slate-600 hover:text-[#D4A843] transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-slate-300" />
              {locataire.telephone}
            </a>
            {locataire.email && (
              <a
                href={`mailto:${locataire.email}`}
                className="flex items-center gap-2 text-slate-600 hover:text-[#D4A843] transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-300" />
                {locataire.email}
              </a>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-300" />
              {locataire.nbOccupants} occupant
              {locataire.nbOccupants > 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Baby className="w-4 h-4 text-slate-300" />
              Enfants :{" "}
              <span
                className={
                  locataire.presenceEnfants
                    ? "text-green-600 font-medium"
                    : "text-slate-400"
                }
              >
                {locataire.presenceEnfants ? "Oui" : "Non"}
              </span>
            </div>
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Identité
            {locataire.statut === "INVITE" && (
              <span className="normal-case text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium tracking-normal">
                À compléter
              </span>
            )}
          </h2>
          {locataire.statut === "INVITE" ? (
            <p className="text-sm text-slate-400 italic">
              Le locataire doit activer son compte pour renseigner ces informations.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label="Date de naissance" value={fmt(locataire.dateNaissance)} />
              <Row label="Lieu de naissance" value={locataire.lieuNaissance} />
              <Row label="Nationalité" value={locataire.nationalite} />
              <Row label="Sexe" value={displaySexe(locataire.sexe)} />
              <Row
                label="Pièce d'identité"
                value={
                  locataire.typePiece
                    ? `${locataire.typePiece} - ${locataire.numPieceIdentite ?? ""}`
                    : undefined
                }
              />
              <Row label="Délivrée le" value={fmt(locataire.dateDelivrance)} />
              <Row label="Expire le" value={fmt(locataire.dateExpirationPiece)} />
              <Row label="Autorité de délivrance" value={locataire.autoriteDelivrance} />
              <Row label="Situation professionnelle" value={locataire.situationProfessionnelle} />
            </div>
          )}
        </div>
      </div>

      {/* Vérification d'identité */}
      {locataire.verification && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Vérification d'identité
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-normal ${
              locataire.verification.statut === "VERIFIED" ? "bg-green-100 text-green-700" :
              locataire.verification.statut === "PENDING" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {locataire.verification.statut === "VERIFIED" ? "Vérifié" :
               locataire.verification.statut === "PENDING" ? "En attente" : "Rejeté"}
            </span>
          </h2>
          
          {/* Afficher le motif de rejet si rejeté */}
          {locataire.verification.statut === "REJECTED" && locataire.verification.motifRejet && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-medium text-red-800">Motif du rejet :</p>
              <p className="text-sm text-red-700">{locataire.verification.motifRejet}</p>
            </div>
          )}

          {/* Documents */}
          {(locataire.verification.pieceIdentiteRecto || locataire.verification.selfie) && (
            <div className="space-y-4">
              {/* Pièce d'identité */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Pièce d'identité</p>
                <div className="grid grid-cols-2 gap-3">
                  {locataire.verification.pieceIdentiteRecto && (
                    <div 
                      className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                      onClick={() => setLightboxImage({ src: locataire.verification!.pieceIdentiteRecto!, alt: "Recto" })}
                    >
                      <img 
                        src={locataire.verification.pieceIdentiteRecto!} 
                        alt="Recto" 
                        className="w-full aspect-[4/3] object-contain"
                      />
                      <p className="text-[10px] text-center py-1 text-slate-500 bg-slate-100">
                        {locataire.verification.typePiece === "CNI" ? "CNI - Recto" : "Page identité"}
                      </p>
                    </div>
                  )}
                  {locataire.verification.pieceIdentiteVerso && (
                    <div 
                      className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer"
                      onClick={() => setLightboxImage({ src: locataire.verification!.pieceIdentiteVerso!, alt: "Verso" })}
                    >
                      <img 
                        src={locataire.verification.pieceIdentiteVerso!} 
                        alt="Verso" 
                        className="w-full aspect-[4/3] object-contain"
                      />
                      <p className="text-[10px] text-center py-1 text-slate-500 bg-slate-100">CNI - Verso</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie */}
              {locataire.verification.selfie && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Photo selfie</p>
                  <div 
                    className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-w-[200px] cursor-pointer"
                    onClick={() => setLightboxImage({ src: locataire.verification!.selfie!, alt: "Selfie" })}
                  >
                    <img 
                      src={locataire.verification.selfie!} 
                      alt="Selfie" 
                      className="w-full aspect-square object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action - uniquement si en attente */}
          {locataire.verification.statut === "PENDING" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowVerifyModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approuver
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Baux */}
      {locataire.bails && locataire.bails.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
            <Home className="w-3.5 h-3.5" />
            Baux ({locataire.bails.length})
          </h2>
          <div className="space-y-3">
            {locataire.bails.map((bail) => (
              <div
                key={bail.id}
                className={`rounded-xl p-4 text-sm border ${
                  bail.statut === "ACTIF"
                    ? "border-green-100 bg-green-50/50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/owner/biens/${bail.bien?.id}`}
                    className="font-medium text-[#0C1A35] hover:text-[#D4A843] transition-colors"
                  >
                    {bail.bien?.titre || bail.bien?.ville || "Bien"}
                  </Link>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      bail.statut === "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {bail.statut === "ACTIF"
                      ? "Actif"
                      : bail.statut === "TERMINE"
                      ? "Terminé"
                      : "Résilié"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Du {fmt(bail.dateDebutBail)}
                    {bail.dateFinBail ? ` au ${fmt(bail.dateFinBail)}` : " (indéterminé)"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    {fmtMontant(bail.montantLoyer)} / mois
                  </span>
                </div>
                {/* Bouton voir le contrat */}
                {bail.contrat && (
                  <button
                    onClick={() => setSelectedBail(bail as unknown as Bail)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Voir le contrat
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={confirmDelete}
        title="Supprimer ce locataire ?"
        message="La fiche sera définitivement supprimée. Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isPending={deleteLocataire.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Modal contrat */}
      {selectedBail && (
        <ContratModal
          bail={selectedBail}
          onClose={() => setSelectedBail(null)}
          isCreationFlow={false}
        />
      )}

      {/* Modal de vérification - Checklist + Approbation */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#0C1A35] mb-4">
                Vérifier l'identité de {locataire.prenom} {locataire.nom}
              </h3>
              
              {/* Checklist */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-sm text-[#0C1A35] mb-3">Checklist de validation</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentLisible}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentLisible: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-xs text-slate-700">Document lisible</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentComplet}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentComplet: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-xs text-slate-700">Document complet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentNonExpire}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentNonExpire: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-xs text-slate-700">Document non expiré</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.nomCorrespond}
                      onChange={(e) => setChecklist(prev => ({ ...prev, nomCorrespond: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-xs text-slate-700">Nom correspond au compte</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.selfieCorrespond}
                      onChange={(e) => setChecklist(prev => ({ ...prev, selfieCorrespond: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-xs text-slate-700">Selfie correspond à la photo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!allChecksPassed || approveVerification.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {approveVerification.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && (
        <ConfirmModal
          open={showRejectModal}
          title="Rejeter la demande"
          message={
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Veuillez sélectionner le motif de rejet :
              </p>
              <div className="space-y-2">
                {REJECTION_MOTIFS.map((motif) => (
                  <label
                    key={motif}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="motif"
                      value={motif}
                      checked={selectedMotif === motif}
                      onChange={(e) => setSelectedMotif(e.target.value)}
                      className="w-4 h-4 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">{motif}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                  <input
                    type="radio"
                    name="motif"
                    value="autre"
                    checked={selectedMotif === "autre"}
                    onChange={(e) => setSelectedMotif(e.target.value)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">Autre motif</span>
                </label>
                {selectedMotif === "autre" && (
                  <input
                    type="text"
                    value={customMotif}
                    onChange={(e) => setCustomMotif(e.target.value)}
                    placeholder="Saisissez le motif..."
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                )}
              </div>
            </div>
          }
          confirmLabel="Confirmer le rejet"
          cancelLabel="Annuler"
          variant="danger"
          isPending={rejectVerification.isPending}
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectModal(false);
            setSelectedMotif("");
            setCustomMotif("");
          }}
        />
      )}

      {/* Lightbox pour les images */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-sm font-medium">{lightboxImage.alt}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

const Row = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex justify-between gap-2">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-700 font-medium text-right">{value || ""}</span>
  </div>
);
