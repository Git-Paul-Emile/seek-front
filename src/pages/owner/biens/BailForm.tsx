import { useState } from "react";
import { X, Plus, User } from "lucide-react";
import { useLocataires } from "@/hooks/useLocataire";
import { useCreerBail } from "@/hooks/useBail";
import { toast } from "sonner";

interface BailFormProps {
  bienId: string;
  montantLoyerInitial?: number | null;
  montantCautionInitial?: number | null;
  frequencePaiementInitial?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES_BAIL = ["Meublé", "Non meublé", "Saisonnier", "Commercial"];

export default function BailForm({
  bienId,
  montantLoyerInitial,
  montantCautionInitial,
  frequencePaiementInitial,
  onClose,
  onSuccess,
}: BailFormProps) {
  const { data: locataires = [] } = useLocataires();
  const creerBail = useCreerBail();

  const [form, setForm] = useState({
    locataireId: "",
    typeBail: "",
    dateDebutBail: "",
    dateFinBail: "",
    renouvellement: false,
    montantLoyer: montantLoyerInitial ?? 0,
    montantCaution: montantCautionInitial ?? 0,
    frequencePaiement: frequencePaiementInitial ?? "mensuel",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.locataireId) errs.locataireId = "Sélectionnez un locataire";
    if (!form.dateDebutBail) errs.dateDebutBail = "La date de début est requise";
    if (!form.montantLoyer || form.montantLoyer <= 0)
      errs.montantLoyer = "Le montant du loyer est requis";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await creerBail.mutateAsync({
        bienId,
        payload: {
          locataireId: form.locataireId,
          typeBail: form.typeBail || null,
          dateDebutBail: form.dateDebutBail,
          dateFinBail: form.dateFinBail || null,
          renouvellement: form.renouvellement,
          montantLoyer: form.montantLoyer,
          montantCaution: form.montantCaution || null,
          frequencePaiement: form.frequencePaiement || null,
        },
      });
      toast.success("Bail créé — le bien est maintenant Loué");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la création du bail";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Associer un locataire</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Sélection du locataire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Locataire <span className="text-red-500">*</span>
              </span>
            </label>

            {locataires.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p>Aucun locataire disponible.</p>
                <a
                  href="/owner/locataires/ajouter"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-600 font-medium hover:underline text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Créer un locataire
                </a>
              </div>
            ) : (
              <select
                value={form.locataireId}
                onChange={(e) => set("locataireId", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.locataireId ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">-- Sélectionner un locataire --</option>
                {locataires.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.prenom} {loc.nom} — {loc.telephone}
                  </option>
                ))}
              </select>
            )}
            {errors.locataireId && (
              <p className="text-xs text-red-500 mt-1">{errors.locataireId}</p>
            )}
          </div>

          {/* Type de bail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de bail
            </label>
            <select
              value={form.typeBail}
              onChange={(e) => set("typeBail", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Type de bail --</option>
              {TYPES_BAIL.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dateDebutBail}
                onChange={(e) => set("dateDebutBail", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dateDebutBail ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.dateDebutBail && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dateDebutBail}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={form.dateFinBail}
                onChange={(e) => set("dateFinBail", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Renouvellement */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.renouvellement}
              onChange={(e) => set("renouvellement", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Renouvellement possible
            </span>
          </label>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loyer (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.montantLoyer}
                onChange={(e) =>
                  set("montantLoyer", parseFloat(e.target.value) || 0)
                }
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.montantLoyer ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.montantLoyer && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.montantLoyer}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caution (FCFA)
              </label>
              <input
                type="number"
                min={0}
                value={form.montantCaution}
                onChange={(e) =>
                  set("montantCaution", parseFloat(e.target.value) || 0)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fréquence de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fréquence de paiement
            </label>
            <select
              value={form.frequencePaiement}
              onChange={(e) => set("frequencePaiement", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="journalier">Journalier</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creerBail.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {creerBail.isPending ? "Création..." : "Créer le bail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
