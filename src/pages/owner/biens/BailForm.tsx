import { useState } from "react";
import { X, User, Plus } from "lucide-react";
import { useLocataires } from "@/hooks/useLocataire";
import { useCreerBail } from "@/hooks/useBail";
import type { Bail } from "@/api/bail";
import { toast } from "sonner";

interface BailFormProps {
  bienId: string;
  bien: {
    prix?: number | null;
    caution?: number | null;
    frequencePaiement?: string | null;
    titre?: string | null;
    adresse?: string | null;
    ville?: string | null;
  };
  onClose: () => void;
  onBailCreated: (bail: Bail) => void;
}

const TYPES_BAIL = ["Habitation", "Commercial", "Mixte"];

export default function BailForm({ bienId, bien, onClose, onBailCreated }: BailFormProps) {
  const { data: locataires = [] } = useLocataires();
  const creerBail = useCreerBail();

  const [form, setForm] = useState({
    locataireId: "",
    typeBail: "",
    dateDebutBail: "",
    dateFinBail: "",
    renouvellement: false,
    cautionVersee: "" as "" | "oui" | "non",
    jourLimitePaiement: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.locataireId) errs.locataireId = "Sélectionnez un locataire";
    if (!form.typeBail) errs.typeBail = "Le type de bail est requis";
    if (!form.dateDebutBail) errs.dateDebutBail = "La date de début est requise";
    if (!form.cautionVersee) errs.cautionVersee = "Indiquez si la caution a été versée";
    if (form.jourLimitePaiement) {
      const j = Number(form.jourLimitePaiement);
      if (!Number.isInteger(j) || j < 1 || j > 28)
        errs.jourLimitePaiement = "Le jour doit être entre 1 et 28";
    }
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
      const createdBail = await creerBail.mutateAsync({
        bienId,
        payload: {
          locataireId: form.locataireId,
          typeBail: form.typeBail,
          dateDebutBail: form.dateDebutBail,
          dateFinBail: form.dateFinBail || null,
          renouvellement: form.renouvellement,
          montantLoyer: bien.prix ?? 0,
          montantCaution: bien.caution ?? null,
          cautionVersee: form.cautionVersee === "oui",
          jourLimitePaiement: form.jourLimitePaiement ? Number(form.jourLimitePaiement) : null,
          frequencePaiement: bien.frequencePaiement ?? null,
        },
      });
      toast.success("Bail créé — le bien est maintenant Loué");
      onBailCreated(createdBail);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la création du bail";
      toast.error(msg);
    }
  };

  const bienLabel = bien.titre || bien.adresse || "Bien";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Associer un locataire</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {bienLabel}{bien.ville ? ` · ${bien.ville}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
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
              Type de bail <span className="text-red-500">*</span>
            </label>
            <select
              value={form.typeBail}
              onChange={(e) => set("typeBail", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.typeBail ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="">-- Type de bail --</option>
              {TYPES_BAIL.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.typeBail && (
              <p className="text-xs text-red-500 mt-1">{errors.typeBail}</p>
            )}
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
                <p className="text-xs text-red-500 mt-1">{errors.dateDebutBail}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin <span className="text-xs text-gray-400">(optionnelle)</span>
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
            <span className="text-sm font-medium text-gray-700">Renouvellement possible</span>
          </label>

          {/* Tarifs depuis l'annonce — lecture seule + nouveaux champs */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Conditions financières
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Loyer</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bien.prix ? `${bien.prix.toLocaleString("fr-FR")} FCFA` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Caution</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bien.caution ? `${bien.caution.toLocaleString("fr-FR")} FCFA` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Fréquence</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {bien.frequencePaiement ?? "—"}
                </p>
              </div>
            </div>

            {/* Caution versée */}
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-2">
                Caution versée <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {(["oui", "non"] as const).map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cautionVersee"
                      value={val}
                      checked={form.cautionVersee === val}
                      onChange={() => set("cautionVersee", val)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">{val === "oui" ? "Oui" : "Non"}</span>
                  </label>
                ))}
              </div>
              {errors.cautionVersee && (
                <p className="text-xs text-red-500 mt-1">{errors.cautionVersee}</p>
              )}
            </div>

            {/* Date butoir de paiement */}
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Date butoir de paiement{" "}
                <span className="font-normal text-blue-500">(optionnel)</span>
              </label>
              <input
                type="number"
                min="1"
                max="28"
                placeholder="ex : 5"
                value={form.jourLimitePaiement}
                onChange={(e) => set("jourLimitePaiement", e.target.value)}
                className={`w-full border bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.jourLimitePaiement ? "border-red-400" : "border-blue-200"
                }`}
              />
              <p className="text-[11px] text-blue-500 mt-1">
                Jour du mois avant lequel le loyer doit être payé (ex : 5 → avant le 5 de chaque mois).
              </p>
              {errors.jourLimitePaiement && (
                <p className="text-xs text-red-500 mt-1">{errors.jourLimitePaiement}</p>
              )}
            </div>
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
