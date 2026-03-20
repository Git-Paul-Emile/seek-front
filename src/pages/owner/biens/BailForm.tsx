import { useState } from "react";
import { X, User, Plus, Search, UserCheck, Send, AlertCircle } from "lucide-react";
import { useLocataires, useSearchLocataire } from "@/hooks/useLocataire";
import { useCreerBail } from "@/hooks/useBail";
import { useCreateBailInvitation } from "@/hooks/useBailInvitation";
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

type LocataireMode = "MES_LOCATAIRES" | "RECHERCHE";

export default function BailForm({ bienId, bien, onClose, onBailCreated }: BailFormProps) {
  const { data: locataires = [] } = useLocataires();
  const creerBail = useCreerBail();
  const creerInvitation = useCreateBailInvitation();

  // ─── Mode locataire ────────────────────────────────────────────────────────
  const [locataireMode, setLocataireMode] = useState<LocataireMode>("MES_LOCATAIRES");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResult, isFetching: searching } = useSearchLocataire(
    searchQuery ? { telephone: searchQuery } : {}
  );

  // Locataire externe trouvé (pas dans ma liste)
  const foundExternal =
    searchResult?.found && searchResult.locataire && !searchResult.locataire.estDansMaListe
      ? searchResult.locataire
      : null;

  // ─── Formulaire bail ───────────────────────────────────────────────────────
  const [form, setForm] = useState({
    locataireId: "",
    typeBail: "",
    dateDebutBail: "",
    dateFinBail: "",
    renouvellement: true,
    cautionVersee: "" as "" | "oui" | "non",
    jourLimitePaiement: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (locataireMode === "MES_LOCATAIRES" && !form.locataireId)
      errs.locataireId = "Sélectionnez un locataire";
    if (!form.typeBail) errs.typeBail = "Le type de bail est requis";
    if (!form.dateDebutBail) errs.dateDebutBail = "La date de début est requise";
    if (!form.cautionVersee) errs.cautionVersee = "Indiquez si la caution a été versée";
    if (!form.jourLimitePaiement) {
      errs.jourLimitePaiement = "La date butoir de paiement est requise";
    } else {
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

    // ── Mode invitation (locataire externe) ──
    if (locataireMode === "RECHERCHE" && foundExternal) {
      try {
        await creerInvitation.mutateAsync({
          bienId,
          locataireId: foundExternal.id,
          typeBail: form.typeBail,
          dateDebutBail: form.dateDebutBail,
          dateFinBail: form.dateFinBail || null,
          renouvellement: form.renouvellement,
          montantLoyer: bien.prix ?? 0,
          montantCaution: bien.caution ?? null,
          cautionVersee: form.cautionVersee === "oui",
          jourLimitePaiement: form.jourLimitePaiement ? Number(form.jourLimitePaiement) : null,
          frequencePaiement: bien.frequencePaiement ?? null,
        });
        toast.success(`Invitation envoyée à ${foundExternal.prenom} ${foundExternal.nom}`);
        onClose();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Erreur lors de l'envoi de l'invitation";
        toast.error(msg);
      }
      return;
    }

    // ── Mode bail direct ──
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
      toast.success("Bail créé, le bien est maintenant Loué");
      onBailCreated(createdBail);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la création du bail";
      toast.error(msg);
    }
  };

  const handleSearch = () => {
    const phone = searchPhone.trim().replace(/\s/g, "");
    if (phone) setSearchQuery(phone);
  };

  const handleSelectFoundInList = () => {
    // Le locataire est dans ma liste, on auto-sélectionne
    if (searchResult?.locataire) {
      setForm((prev) => ({ ...prev, locataireId: searchResult.locataire!.id }));
      setLocataireMode("MES_LOCATAIRES");
      toast.success("Locataire sélectionné depuis votre liste");
    }
  };

  const bienLabel = bien.titre || bien.adresse || "Bien";
  const isInvitationMode = locataireMode === "RECHERCHE" && !!foundExternal;
  const isPending = creerBail.isPending || creerInvitation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isInvitationMode ? "Inviter un locataire" : "Associer un locataire"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {bienLabel}{bien.ville ? ` · ${bien.ville}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* ── Onglets mode locataire ── */}
          <div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setLocataireMode("MES_LOCATAIRES"); setSearchQuery(""); setSearchPhone(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-colors ${
                  locataireMode === "MES_LOCATAIRES"
                    ? "bg-[#0C1A35] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Mes locataires
              </button>
              <button
                type="button"
                onClick={() => setLocataireMode("RECHERCHE")}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-colors ${
                  locataireMode === "RECHERCHE"
                    ? "bg-[#0C1A35] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Rechercher
              </button>
            </div>

            {/* ── Mode "Mes locataires" ── */}
            {locataireMode === "MES_LOCATAIRES" && (
              <>
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
                    {(() => {
                      const libres = locataires.filter((l) => !l.bails?.some((b) => b.statut === "ACTIF"));
                      const associes = locataires.filter((l) => l.bails?.some((b) => b.statut === "ACTIF"));
                      return (
                        <>
                          {libres.length > 0 && (
                            <optgroup label={`Disponibles (${libres.length})`}>
                              {libres.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.prenom} {loc.nom} — {loc.telephone}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {associes.length > 0 && (
                            <optgroup label={`Déjà associés (${associes.length})`}>
                              {associes.map((loc) => {
                                const bail = loc.bails?.find((b) => b.statut === "ACTIF");
                                return (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.prenom} {loc.nom} — {bail?.bien?.titre || bail?.bien?.ville || "Bien loué"}
                                  </option>
                                );
                              })}
                            </optgroup>
                          )}
                        </>
                      );
                    })()}
                  </select>
                )}
                {errors.locataireId && (
                  <p className="text-xs text-red-500 mt-1">{errors.locataireId}</p>
                )}
              </>
            )}

            {/* ── Mode "Rechercher" ── */}
            {locataireMode === "RECHERCHE" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                    placeholder="+221 77 000 00 00"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!searchPhone.trim() || searching}
                    className="px-3 py-2 bg-[#0C1A35] text-white rounded-lg text-sm font-medium hover:bg-[#1a2d4f] disabled:opacity-50 transition-colors"
                  >
                    {searching ? "..." : <Search className="w-4 h-4" />}
                  </button>
                </div>

                {/* Résultat de recherche */}
                {searchQuery && searchResult && !searching && (
                  <>
                    {!searchResult.found ? (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center text-sm text-slate-500">
                        <p>Aucun compte locataire trouvé pour ce numéro.</p>
                        <a
                          href="/owner/locataires/ajouter"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-[#D4A843] font-medium hover:underline text-xs"
                        >
                          <Plus className="w-3 h-3" />
                          Créer un nouveau locataire
                        </a>
                      </div>
                    ) : searchResult.locataire?.estDansMaListe ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <UserCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-800">
                              {searchResult.locataire.prenom} {searchResult.locataire.nom}
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">
                              Ce locataire est déjà dans votre liste.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSelectFoundInList}
                            className="text-xs text-green-700 font-medium underline underline-offset-2"
                          >
                            Sélectionner
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">
                              {searchResult.locataire!.prenom} {searchResult.locataire!.nom}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              Ce locataire a déjà un compte SEEK chez un autre propriétaire.
                              Remplissez les conditions du bail ci-dessous et envoyez-lui une invitation.
                              Il devra l'accepter depuis son espace locataire.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Formulaire bail (commun aux deux modes) ── */}
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

          {/* Conditions financières */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Conditions financières
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Loyer</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bien.prix ? `${bien.prix.toLocaleString("fr-FR")} FCFA` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Caution</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bien.caution ? `${bien.caution.toLocaleString("fr-FR")} FCFA` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Fréquence</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {bien.frequencePaiement ?? ""}
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
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {val === "oui" ? "Oui" : "Non"}
                    </span>
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
                Date butoir de paiement <span className="text-red-500">*</span>
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
              disabled={isPending || (locataireMode === "RECHERCHE" && !foundExternal && !form.locataireId)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors ${
                isInvitationMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isInvitationMode ? (
                <>
                  <Send className="w-4 h-4" />
                  {isPending ? "Envoi..." : "Envoyer l'invitation"}
                </>
              ) : (
                isPending ? "Création..." : "Créer le bail"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
