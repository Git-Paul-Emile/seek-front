import { useEffect, useState } from "react";
import { MessageSquare, Mail, MessageCircle, Loader2, Save, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useCanauxNotification, useUpdateCanauxNotification } from "@/hooks/useNotificationPreferences";
import type { CanalNotification } from "@/api/notificationPreferences";

const CANAL_INFO: Record<CanalNotification, { label: string; icon: typeof MessageSquare }> = {
  SMS: { label: "SMS", icon: MessageSquare },
  EMAIL: { label: "Email", icon: Mail },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle },
};

export default function NotificationChannelsSettings() {
  const { data, isLoading } = useCanauxNotification();
  const updateMutation = useUpdateCanauxNotification();

  const [selection, setSelection] = useState<CanalNotification[]>(["SMS"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState<string | null>(null);

  useEffect(() => {
    if (data?.canaux) setSelection(data.canaux);
  }, [data?.canaux]);

  const toggleCanal = (canal: CanalNotification) => {
    setSelection((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal]
    );
  };

  const hasChanged = data ? JSON.stringify([...selection].sort()) !== JSON.stringify([...data.canaux].sort()) : false;
  const needsPayment = selection.length > 1 && !data?.canauxPayes;

  const handleSave = () => {
    if (selection.length === 0) {
      toast.error("Sélectionnez au moins un canal de notification");
      return;
    }
    if (needsPayment) {
      setModalOpen(true);
      return;
    }
    updateMutation.mutate(
      { canaux: selection },
      {
        onSuccess: () => toast.success("Canaux de notification mis à jour"),
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Erreur lors de la mise à jour"),
      }
    );
  };

  const handlePayerEtEnregistrer = () => {
    if (!selectedPaiement) return;
    updateMutation.mutate(
      { canaux: selection, modePaiement: selectedPaiement },
      {
        onSuccess: () => {
          toast.success("Paiement effectué, canaux de notification mis à jour");
          setModalOpen(false);
          setSelectedPaiement(null);
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Erreur lors du paiement"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-10 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-[#0C1A35] mb-1">Canaux de notification</h2>
      <p className="text-sm text-slate-500 mb-4">
        Choisissez comment recevoir vos notifications. Par défaut, seul le SMS est actif et gratuit.
        Sélectionner plusieurs canaux à la fois nécessite un paiement unique de{" "}
        <strong>{data?.fraisCanauxSupplementaires?.toLocaleString()} FCFA</strong>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {(data?.canauxDisponibles ?? ["SMS", "EMAIL", "WHATSAPP"]).map((canal) => {
          const info = CANAL_INFO[canal];
          const Icon = info.icon;
          const isSelected = selection.includes(canal);
          return (
            <button
              key={canal}
              type="button"
              onClick={() => toggleCanal(canal)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected ? "border-[#D4A843] bg-amber-50" : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-amber-100" : "bg-slate-100"}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? "text-[#D4A843]" : "text-slate-400"}`} />
                </div>
                <span className="font-medium text-[#0C1A35]">{info.label}</span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4A843] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {needsPayment && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          Vous avez sélectionné plusieurs canaux : un paiement unique de {data?.fraisCanauxSupplementaires?.toLocaleString()} FCFA
          sera demandé pour débloquer définitivement cette option.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanged || updateMutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>

      {/* Modal de paiement pour débloquer le multi-canaux */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Fermer">
              <XCircle className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-[#0C1A35] pr-8">Débloquer les canaux multiples</h2>
            <p className="text-sm text-slate-600">
              Frais unique de <strong>{data?.fraisCanauxSupplementaires?.toLocaleString()} FCFA</strong> pour activer
              définitivement la sélection de plusieurs canaux.
            </p>
            <div className="space-y-3">
              {(data?.moyensPaiement ?? []).map((moyen) => {
                const isSelected = selectedPaiement === moyen.id;
                const isOrange = moyen.couleur === "orange";
                return (
                  <button
                    key={moyen.id}
                    type="button"
                    onClick={() => setSelectedPaiement(moyen.id)}
                    className={`relative w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected ? "border-[#D4A843] bg-amber-50" : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOrange ? "bg-orange-100" : "bg-blue-100"}`}>
                        <Smartphone className={`w-5 h-5 ${isOrange ? "text-orange-600" : "text-blue-600"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0C1A35]">{moyen.nom}</p>
                        <p className="text-xs text-slate-500">{moyen.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setModalOpen(false)} disabled={updateMutation.isPending} className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                Annuler
              </button>
              <button
                onClick={handlePayerEtEnregistrer}
                disabled={!selectedPaiement || updateMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#D4A843] text-white hover:bg-[#c49a3a] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Payer et enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
