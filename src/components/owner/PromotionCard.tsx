import { useState } from "react";
import { Star, Clock, AlertCircle, CheckCircle, XCircle, Sparkles, X } from "lucide-react";
import { usePromotionStatus, useActivatePromotion, useDeactivatePromotion, useExtendPromotion } from "@/hooks/usePromotion";

interface PromotionCardProps {
  bienId: string;
  bienTitre: string;
}

const DUREES_PROMOTION = [
  { value: 7, label: "7 jours" },
  { value: 14, label: "14 jours" },
  { value: 30, label: "30 jours" },
];

type ModalType = "activate" | "deactivate" | "extend" | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function PromotionModal({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm: () => void;
  confirmLabel: string;
  isPending: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Fermer">
          <XCircle className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold text-[#0C1A35]">{title}</h2>
        <div className="text-sm text-slate-600">{children}</div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={isPending || isLoading} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#D4A843] text-white hover:bg-[#c49a3a] disabled:opacity-50 inline-flex items-center gap-2">
            {(isPending || isLoading) && <Sparkles className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionCard({ bienId, bienTitre }: PromotionCardProps) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedDuree, setSelectedDuree] = useState(7);
  const [selectedExtendDuree, setSelectedExtendDuree] = useState(7);

  const { data: status, isLoading } = usePromotionStatus(bienId);
  const activateMutation = useActivatePromotion();
  const deactivateMutation = useDeactivatePromotion();
  const extendMutation = useExtendPromotion();

  const isPromoted = status?.estMisEnAvant ?? false;
  const joursRestants = status?.joursRestants ?? 0;

  const handleActivate = async () => {
    activateMutation.mutate(
      { bienId, dureeJours: selectedDuree },
      { onSuccess: () => setModalType(null) }
    );
  };

  const handleDeactivate = async () => {
    deactivateMutation.mutate(bienId, { onSuccess: () => setModalType(null) });
  };

  const handleExtend = async () => {
    extendMutation.mutate(
      { bienId, joursSupplementaires: selectedExtendDuree },
      { onSuccess: () => setModalType(null) }
    );
  };

  if (isLoading) {
    return (
      <Section title="Mise en avant">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section title="Mise en avant">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPromoted ? "bg-amber-100" : "bg-slate-100"}`}>
                {isPromoted ? <Sparkles className="w-5 h-5 text-amber-600" /> : <Star className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0C1A35]">
                  {isPromoted ? "Annonce mise en avant" : "Booster la visibilité"}
                </p>
                <p className="text-xs text-slate-500">
                  {isPromoted ? "Apparaît en priorité" : "Apparaît en priorité"}
                </p>
              </div>
            </div>
            {isPromoted ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3" /> Actif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                <XCircle className="w-3 h-3" /> Inactif
              </span>
            )}
          </div>

          {/* Expiration info */}
          {isPromoted && status?.dateFinPromotion && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                Expire le {new Date(status.dateFinPromotion).toLocaleDateString("fr-FR")}
                {joursRestants > 0 && (
                  <span className="text-[#D4A843] font-medium"> ({joursRestants} jour{joursRestants > 1 ? "s" : ""})</span>
                )}
              </span>
            </div>
          )}

          {!isPromoted && (
            <p className="text-sm text-slate-600">
              Votre annonce apparaîtra en priorité dans les résultats de recherche et sur la page d'accueil.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isPromoted ? (
              <>
                <button onClick={() => setModalType("extend")} disabled={extendMutation.isPending} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0C1A35] text-white rounded-xl text-sm font-medium hover:bg-[#162540] disabled:opacity-50">
                  <Clock className="w-4 h-4" /> Prolonger
                </button>
                <button onClick={() => setModalType("deactivate")} disabled={deactivateMutation.isPending} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                  Désactiver
                </button>
              </>
            ) : (
              <button onClick={() => setModalType("activate")} disabled={activateMutation.isPending} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] disabled:opacity-50">
                <Star className="w-4 h-4" /> Mettre en avant
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Modal Activation */}
      <PromotionModal
        open={modalType === "activate"}
        onClose={() => setModalType(null)}
        title="Mettre en avant cette annonce"
        onConfirm={handleActivate}
        confirmLabel="Activer"
        isPending={activateMutation.isPending}
      >
        <div className="space-y-4">
          <p>
            Votre annonce « <strong>{bienTitre}</strong> » sera mise en avant et apparaîtra en priorité sur la page d'accueil.
          </p>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <p className="text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              La rotation intelligente assure une exposition équitable.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Durée de la promotion</label>
            <div className="grid grid-cols-3 gap-2">
              {DUREES_PROMOTION.map((duree) => (
                <button key={duree.value} onClick={() => setSelectedDuree(duree.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDuree === duree.value ? "bg-[#0C1A35] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {duree.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PromotionModal>

      {/* Modal Désactivation */}
      <PromotionModal
        open={modalType === "deactivate"}
        onClose={() => setModalType(null)}
        title="Désactiver la mise en avant"
        onConfirm={handleDeactivate}
        confirmLabel="Désactiver"
        isPending={deactivateMutation.isPending}
      >
        <p>Êtes-vous sûr de vouloir désactiver la mise en avant de « <strong>{bienTitre}</strong> » ?</p>
      </PromotionModal>

      {/* Modal Prolongation */}
      <PromotionModal
        open={modalType === "extend"}
        onClose={() => setModalType(null)}
        title="Prolonger la mise en avant"
        onConfirm={handleExtend}
        confirmLabel="Prolonger"
        isPending={extendMutation.isPending}
      >
        <div className="space-y-4">
          <p>Prolonger la mise en avant de « <strong>{bienTitre}</strong> »</p>
          {status?.dateFinPromotion && (
            <p className="text-sm text-slate-500">
              Expiration actuelle : {new Date(status.dateFinPromotion).toLocaleDateString("fr-FR")}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Durée supplémentaire</label>
            <div className="grid grid-cols-3 gap-2">
              {DUREES_PROMOTION.map((duree) => (
                <button key={duree.value} onClick={() => setSelectedExtendDuree(duree.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedExtendDuree === duree.value ? "bg-[#0C1A35] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  +{duree.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PromotionModal>
    </>
  );
}
