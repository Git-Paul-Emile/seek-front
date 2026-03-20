import { useState } from "react";
import { X, Loader2, Banknote, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Echeance } from "@/api/bail";
import { useEnregistrerPaiementEspeces } from "@/hooks/useBail";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("fr-FR");
const todayIso = () => new Date().toISOString().split("T")[0];

// ─── Props ────────────────────────────────────────────────────────────────────

interface EnregistrerEspecesModalProps {
  bienId: string;
  bailId: string;
  echeancier: Echeance[];
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function EnregistrerEspecesModal({
  bienId,
  bailId,
  echeancier,
  onClose,
}: EnregistrerEspecesModalProps) {
  const unpaid = echeancier
    .filter(e => e.statut !== "PAYE" && e.statut !== "PARTIEL" && e.statut !== "ANNULE" && e.statut !== "EN_ATTENTE_CONFIRMATION")
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

  const [selectedEcheanceId, setSelectedEcheanceId] = useState(unpaid[0]?.id ?? "");
  const [datePaiement, setDatePaiement] = useState(todayIso());
  const [montantSaisi, setMontantSaisi] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const { mutate, isPending } = useEnregistrerPaiementEspeces();

  const selectedEch = echeancier.find(e => e.id === selectedEcheanceId);
  const montant = montantSaisi ? parseFloat(montantSaisi) : (selectedEch?.montant ?? 0);

  const canSubmit =
    !!selectedEcheanceId &&
    datePaiement.length > 0 &&
    new Date(datePaiement) <= new Date(todayIso()) &&
    montant > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutate(
      {
        bienId,
        bailId,
        echeanceId: selectedEcheanceId,
        payload: {
          datePaiement,
          montant: montantSaisi ? parseFloat(montantSaisi) : undefined,
          note: note || undefined,
        },
      },
      {
        onSuccess: () => {
          setDone(true);
          toast.success("Paiement espèces enregistré — le locataire doit confirmer");
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg ?? "Erreur lors de l'enregistrement");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#D4A843]" />
            <h2 className="font-semibold text-[#0C1A35]">Enregistrer un paiement espèces</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          /* ─── Succès ─── */
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-[#0C1A35]">Paiement enregistré</p>
            <p className="text-sm text-slate-500">
              Le locataire a reçu une notification et doit confirmer ce paiement depuis son espace SEEK.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49a38] transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ─── Formulaire ─── */
          <div className="px-5 py-5 space-y-4">

            {/* Info mode */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Banknote className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Le paiement passera en <strong>attente de confirmation</strong> jusqu'à ce que le locataire valide depuis son espace.
              </p>
            </div>

            {/* Type — auto */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <input
                readOnly
                value="Paiement de loyer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Échéance à payer */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Échéance concernée</label>
              {unpaid.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune échéance impayée disponible.</p>
              ) : (
                <select
                  value={selectedEcheanceId}
                  onChange={e => setSelectedEcheanceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
                >
                  {unpaid.map(e => (
                    <option key={e.id} value={e.id}>
                      {new Date(e.dateEcheance).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      {" — "}
                      {fmt(e.montant)} FCFA
                      {" ("}
                      {e.statut === "EN_RETARD" ? "En retard" : e.statut === "EN_ATTENTE" ? "En attente" : "À venir"}
                      {")"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mode — fixe */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mode de paiement</label>
              <input
                readOnly
                value="Espèces"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Montant reçu (FCFA)
                {selectedEch && (
                  <span className="ml-1 text-slate-400 font-normal">
                    — loyer: {fmt(selectedEch.montant)} FCFA
                  </span>
                )}
              </label>
              <input
                type="number"
                value={montantSaisi}
                onChange={e => setMontantSaisi(e.target.value)}
                placeholder={selectedEch ? String(selectedEch.montant) : "Montant"}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date de réception</label>
              <input
                type="date"
                value={datePaiement}
                max={todayIso()}
                onChange={e => setDatePaiement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Note (optionnel)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Ex: remise en main propre au bureau…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isPending || unpaid.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49a38] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                Valider
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
