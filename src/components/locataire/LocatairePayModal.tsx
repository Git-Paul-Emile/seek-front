import { useState } from "react";
import {
  X,
  Smartphone,
  Loader2,
  Send,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { initierPaiementLocataireApi } from "@/api/quittance";
import type { Echeance } from "@/api/bail";
import type { InitierPaiementResult } from "@/api/quittance";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PROVIDERS = ["Orange Money", "Wave"];

const PROVIDER_INFO: Record<string, string> = {
  "Orange Money": "Composez *144# puis suivez les instructions pour envoyer le montant.",
  "Wave": "Ouvrez l'application Wave et effectuez un envoi d'argent.",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

// ─── Props ────────────────────────────────────────────────────────────────────

interface LocatairePayModalProps {
  /** Toutes les échéances du bail (pour calculer les impayées) */
  echeancier: Echeance[];
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function LocatairePayModal({ echeancier, onClose }: LocatairePayModalProps) {
  // Échéances impayées triées chronologiquement
  const unpaid = echeancier
    .filter(e => e.statut !== "PAYE" && e.statut !== "ANNULE")
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

  const nextPayable = unpaid[0];
  const unpaidCount = unpaid.length;

  const [nombreMois, setNombreMois] = useState(1);
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [showProviderInfo, setShowProviderInfo] = useState(true);
  const [result, setResult] = useState<InitierPaiementResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Échéances à payer selon le nombre de mois sélectionné
  const echeancesToPay = unpaid.slice(0, nombreMois);
  const totalAmount = echeancesToPay.reduce((s, e) => s + e.montant, 0);

  const handleSubmit = async () => {
    setIsPending(true);
    setResult(null);
    try {
      let lastResult: InitierPaiementResult | null = null;
      for (const ech of echeancesToPay) {
        lastResult = await initierPaiementLocataireApi({ echeanceId: ech.id, provider });
      }
      setResult(lastResult);
      toast.success(
        nombreMois > 1
          ? `${nombreMois} mois initiés — votre propriétaire a été notifié`
          : "Initiation enregistrée — votre propriétaire a été notifié"
      );
    } catch {
      toast.error("Erreur lors de l'initiation du paiement");
    } finally {
      setIsPending(false);
    }
  };

  if (!nextPayable) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-[#0C1A35]">Payer mon loyer</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Résumé prochaine échéance */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-0.5">Prochaine échéance</p>
            <p className="font-semibold text-[#0C1A35] text-sm">
              {new Date(nextPayable.dateEcheance).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {fmt(nextPayable.montant)} FCFA / mois
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
              {nombreMois > 1 && (
                <div className="mt-2 flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg px-3 py-2">
                  <Layers className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                  <p className="text-xs text-[#0C1A35]">
                    <span className="font-bold">{nombreMois} mois</span> d'un coup ·{" "}
                    <span className="font-bold">{fmt(totalAmount)} FCFA</span> au total
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Mobile Money */}
          <div className="border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowProviderInfo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#D4A843]/10 hover:bg-[#D4A843]/15 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4A843]" />
                <span className="text-sm font-semibold text-[#0C1A35]">
                  Payer via Mobile Money
                </span>
              </div>
              {showProviderInfo
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>
            {showProviderInfo && (
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-bold text-[#0C1A35]">{provider}</p>
                <p className="text-xs text-slate-500">{PROVIDER_INFO[provider]}</p>
              </div>
            )}
          </div>

          {/* Choix opérateur */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Opérateur</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Résultat de l'initiation */}
          {result && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">{result.statut}</p>
              {result.instructions && <p>{result.instructions}</p>}
              {result.message && <p className="text-blue-400">{result.message}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {result ? "Fermer" : "Annuler"}
            </button>
            {!result && (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-semibold hover:bg-[#c49a38] disabled:opacity-60 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isPending
                  ? "Envoi..."
                  : nombreMois > 1
                  ? `Initier ${nombreMois} mois`
                  : "Initier le paiement"}
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Votre propriétaire recevra une notification et confirmera le paiement.
          </p>
        </div>
      </div>
    </div>
  );
}
