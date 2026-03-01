import { useState } from "react";
import {
  X,
  Smartphone,
  Loader2,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Echeance } from "@/api/bail";
import { usePayerEcheancesLocataire } from "@/hooks/useLocataireEcheancier";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PROVIDERS = ["Orange Money", "Wave", "Autre"];

const PROVIDER_INFO: Record<string, string> = {
  "Orange Money": "Composez *144# puis suivez les instructions pour envoyer le montant.",
  "Wave": "Ouvrez l'application Wave et effectuez un envoi d'argent.",
  "Autre": "Conservez votre référence de transaction pour la saisir ci-dessous.",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");
const todayIso = () => new Date().toISOString().split("T")[0];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LocatairePayModalProps {
  echeancier: Echeance[];
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function LocatairePayModal({ echeancier, onClose }: LocatairePayModalProps) {
  const unpaid = echeancier
    .filter(e => e.statut !== "PAYE" && e.statut !== "ANNULE")
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

  const unpaidCount = unpaid.length;

  const [nombreMois, setNombreMois] = useState(1);
  const [datePaiement, setDatePaiement] = useState(todayIso());
  const [modePaiement, setModePaiement] = useState(PROVIDERS[0]);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [showProviderInfo, setShowProviderInfo] = useState(false);

  const { mutate, isPending } = usePayerEcheancesLocataire();

  const echeancesToPay = unpaid.slice(0, nombreMois);
  const totalAmount = echeancesToPay.reduce((s, e) => s + e.montant, 0);

  const canSubmit =
    datePaiement.length > 0 &&
    new Date(datePaiement) <= new Date(todayIso()) &&
    totalAmount > 0 &&
    !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutate(
      {
        nombreMois,
        datePaiement,
        modePaiement,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(
            res.paye > 1
              ? `${res.paye} mois enregistrés avec succès`
              : "Paiement enregistré avec succès"
          );
          onClose();
        },
        onError: () => {
          toast.error("Erreur lors de l'enregistrement du paiement");
        },
      }
    );
  };

  if (unpaidCount === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-[#0C1A35]">Enregistrer un paiement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Résumé prochaine échéance */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-0.5">Prochaine échéance</p>
            <p className="font-semibold text-[#0C1A35] text-sm">
              {new Date(unpaid[0].dateEcheance).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {fmt(unpaid[0].montant)} FCFA / mois
            </p>
          </div>

          {/* Slider nombre de mois */}
          {unpaidCount > 1 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre de mois à payer
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={unpaidCount}
                  value={nombreMois}
                  onChange={e => setNombreMois(Number(e.target.value))}
                  className="flex-1 accent-[#D4A843]"
                />
                <span className="text-sm font-bold text-[#0C1A35] w-6 text-center">
                  {nombreMois}
                </span>
              </div>
            </div>
          )}

          {/* Résumé montant */}
          {nombreMois > 0 && (
            <div className="flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg px-3 py-2">
              <Layers className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
              <p className="text-xs text-[#0C1A35]">
                <span className="font-bold">{nombreMois} mois</span>
                {nombreMois > 1 ? " d'un coup" : ""} ·{" "}
                <span className="font-bold">{fmt(totalAmount)} FCFA</span> au total
              </p>
            </div>
          )}

          {/* Mois concernés */}
          {echeancesToPay.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Mois concernés</p>
              <div className="flex flex-wrap gap-1.5">
                {echeancesToPay.map(e => (
                  <span
                    key={e.id}
                    className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 capitalize"
                  >
                    {new Date(e.dateEcheance).toLocaleDateString("fr-FR", {
                      month: "short", year: "numeric",
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date de paiement */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date de paiement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datePaiement}
              max={todayIso()}
              onChange={e => setDatePaiement(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
            />
          </div>

          {/* Opérateur / mode de paiement */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Opérateur / Mode de paiement <span className="text-red-500">*</span>
            </label>
            <select
              value={modePaiement}
              onChange={e => setModePaiement(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Référence transaction */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Référence de transaction <span className="text-slate-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Ex : TXN-123456"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Note <span className="text-slate-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Remarque éventuelle"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
            />
          </div>

          {/* Instructions Mobile Money (collapsible) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowProviderInfo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  Comment payer via {modePaiement}
                </span>
              </div>
              {showProviderInfo
                ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              }
            </button>
            {showProviderInfo && (
              <div className="px-4 py-3 bg-white">
                <p className="text-xs text-slate-500">
                  {PROVIDER_INFO[modePaiement] ?? "Effectuez votre paiement et notez la référence."}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a38] disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isPending
                ? "Enregistrement..."
                : nombreMois > 1
                ? `Enregistrer ${nombreMois} mois`
                : "Enregistrer le paiement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
