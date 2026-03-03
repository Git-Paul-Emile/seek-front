import { useState } from "react";
import {
  Shield,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Loader2,
  X,
  ZoomIn,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  usePendingVerifications,
  useApproveVerification,
  useRejectVerification,
} from "@/hooks/useAdminVerification";
import type { PendingVerification } from "@/api/ownerAuth";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

// Motifs de rejet standards
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

export default function AdminVerificationsPage() {
  const { data: verifications, isLoading, refetch } = usePendingVerifications();
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMotif, setSelectedMotif] = useState("");
  const [customMotif, setCustomMotif] = useState("");
  const [checklist, setChecklist] = useState<ValidationChecklist>({
    documentLisible: false,
    documentComplet: false,
    documentNonExpire: false,
    nomCorrespond: false,
    selfieCorrespond: false,
  });
  // État pour l'image agrandie (lightbox)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const handleApprove = () => {
    if (!selectedVerification) return;
    approveMutation.mutate(selectedVerification.id);
  };

  const handleReject = () => {
    if (!selectedVerification) return;
    const motif = selectedMotif === "autre" ? customMotif : selectedMotif;
    if (!motif) {
      toast.error("Veuillez sélectionner ou saisir un motif de rejet");
      return;
    }
    rejectMutation.mutate({ proprietaireId: selectedVerification.id, motif });
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/proprietaires"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <Shield className="w-3.5 h-3.5" />
              Vérifications d'identité
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35]">
              Demandes en attente
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {verifications?.length ?? 0} demande{verifications?.length !== 1 ? "s" : ""} en attente de validation
            </p>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      {(!verifications || verifications.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#0C1A35] mb-2">Aucune demande en attente</h3>
          <p className="text-slate-500">
            Toutes les demandes de vérification ont été traitées.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0C1A35]">
                  {v.prenom} {v.nom}
                </p>
                <p className="text-sm text-slate-500">
                  {v.telephone} · {v.email || "Pas d'email"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {v.verification?.typePiece === "CNI" ? "CNI" : "Passeport"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Soumise le {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVerification(v)}
                className="shrink-0 px-4 py-2 bg-[#0C1A35] text-white rounded-xl text-sm font-medium hover:bg-[#162540] transition-colors"
              >
                Examiner
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détail */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0C1A35]">
                  {selectedVerification.prenom} {selectedVerification.nom}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedVerification.telephone} · {selectedVerification.email || "Pas d'email"}
                </p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Checklist de validation */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-[#0C1A35] mb-4">Checklist de validation</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentLisible}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentLisible: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">Document lisible (net, bien éclairé, 4 coins visibles)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentComplet}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentComplet: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">Document complet (toutes les informations visibles)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.documentNonExpire}
                      onChange={(e) => setChecklist(prev => ({ ...prev, documentNonExpire: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">Document non expiré (date d'expiration visible)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.nomCorrespond}
                      onChange={(e) => setChecklist(prev => ({ ...prev, nomCorrespond: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">Nom et prénom correspondent au compte</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.selfieCorrespond}
                      onChange={(e) => setChecklist(prev => ({ ...prev, selfieCorrespond: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">Selfie correspond à la photo du document</span>
                  </label>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-6">
                {/* Pièce d'identité */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Pièce d'identité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recto */}
                    {selectedVerification.verification?.pieceIdentiteRecto && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500">
                          {selectedVerification.verification.typePiece === "CNI" ? "CNI - Recto" : "Passeport - Page identité"}
                        </p>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-pointer" onClick={() => setLightboxImage({ src: selectedVerification.verification!.pieceIdentiteRecto!, alt: "Recto" })}>
                          <img
                            src={selectedVerification.verification.pieceIdentiteRecto}
                            alt="Recto"
                            className="w-full aspect-[4/3] object-contain"
                            style={{ maxHeight: '300px' }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verso (si CNI) */}
                    {selectedVerification.verification?.pieceIdentiteVerso && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500">CNI - Verso</p>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group cursor-pointer" onClick={() => setLightboxImage({ src: selectedVerification.verification!.pieceIdentiteVerso!, alt: "Verso" })}>
                          <img
                            src={selectedVerification.verification.pieceIdentiteVerso}
                            alt="Verso"
                            className="w-full aspect-[4/3] object-contain"
                            style={{ maxHeight: '300px' }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selfie */}
                {selectedVerification.verification?.selfie && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Photo selfie</h3>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-[300px] relative group cursor-pointer" onClick={() => setLightboxImage({ src: selectedVerification.verification!.selfie!, alt: "Selfie" })}>
                      <img
                        src={selectedVerification.verification.selfie}
                        alt="Selfie"
                        className="w-full aspect-square object-contain"
                        style={{ maxHeight: '300px' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex items-center justify-between">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={allChecksPassed}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
              <button
                onClick={handleApprove}
                disabled={!allChecksPassed || approveMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
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
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
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
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
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
        isPending={rejectMutation.isPending}
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedMotif("");
          setCustomMotif("");
        }}
      />

      {/* Lightbox pour afficher les photos en grand */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image agrandie */}
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Indicateur de l'image */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-sm font-medium">{lightboxImage.alt}</p>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-xs">Cliquez en dehors ou sur X pour fermer</p>
          </div>
        </div>
      )}
    </div>
  );
}
