import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Building2, Home } from "lucide-react";
import { useCreateLocataire, useDeleteLocataire } from "@/hooks/useLocataire";
import { useCreerBail, useAnnulerBail } from "@/hooks/useBail";
import { useBiens } from "@/hooks/useBien";
import { toast } from "sonner";
import type { Bien } from "@/api/bien";
import type { Bail } from "@/api/bail";
import ContratModal from "../biens/ContratModal";

// ─── Helpers UI ────────────────────────────────────────────────────────────────

const inputCls = (hasError = false) =>
  `w-full h-10 border rounded-xl px-3 text-sm text-slate-700 placeholder:text-slate-300
   outline-none transition-all bg-white
   focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/10
   ${hasError ? "border-red-400" : "border-slate-200"}`;

const selectCls = (hasError = false) =>
  `w-full h-10 border rounded-xl px-3 text-sm text-slate-700 outline-none transition-all bg-white
   focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/10
   ${hasError ? "border-red-400" : "border-slate-200"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddLocataire() {
  const navigate = useNavigate();
  const createLocataire = useCreateLocataire();
  const deleteLocataire = useDeleteLocataire();
  const creerBail = useCreerBail();
  const annulerBail = useAnnulerBail();
  const creationCancelledRef = useRef(false);

  // Biens disponibles : publiés et sans bail actif
  // On affiche tous les biens publiés qui n'ont pas de bail actif
  const { data: tousLesBiens = [] } = useBiens();
  const biensPubliés = tousLesBiens.filter(
    (b) => b.statutAnnonce === "PUBLIE" && !b.hasBailActif
  );

  // Debug: voir tous les biens et leurs propriétés
  console.log("Tous les biens:", tousLesBiens);
  console.log("Bi Published:", biensPubliés);
  console.log("Bi typeTransaction:", tousLesBiens.map(b => ({ id: b.id, titre: b.titre, typeTransaction: b.typeTransaction, statutBien: b.statutBien, hasBailActif: b.hasBailActif })));

  const biensLocation: Bien[] = biensPubliés;

  const [form, setForm] = useState({
    // Locataire
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    nbOccupants: 1,
    presenceEnfants: false,
    // Bail
    bienId: "",
    dateDebutBail: "",
    dateFinBail: "",
    typeBail: "Habitation",
    cautionVersee: false,
    jourLimitePaiement: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showContratModal, setShowContratModal] = useState(false);
  const [createdBail, setCreatedBail] = useState<Bail | null>(null);

  /** Appelé par ContratModal si l'utilisateur ferme sans valider */
  const handleCancelCreation = async () => {
    if (!createdBail) return;
    creationCancelledRef.current = true;
    try {
      await annulerBail.mutateAsync({ bienId: createdBail.bienId, bailId: createdBail.id });
      await deleteLocataire.mutateAsync(createdBail.locataireId);
    } catch {
      // best-effort : on navigue quand même
    }
  };

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const bienSelectionne = biensLocation.find((b) => b.id === form.bienId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nom.trim()) errs.nom = "Le nom est requis";
    if (!form.prenom.trim()) errs.prenom = "Le prénom est requis";
    if (!form.telephone.trim()) errs.telephone = "Le téléphone est requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email invalide";
    if (!form.bienId) errs.bienId = "Veuillez sélectionner un bien";
    if (!form.dateDebutBail) errs.dateDebutBail = "La date de début est requise";
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
      // 1. Créer le locataire
      const locataire = await createLocataire.mutateAsync({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || null,
        nbOccupants: form.nbOccupants,
        presenceEnfants: form.presenceEnfants,
      });

      // 2. Créer le bail (loyer/caution depuis l'annonce, non modifiables)
      const bail = await creerBail.mutateAsync({
        bienId: form.bienId,
        payload: {
          locataireId: locataire.id,
          dateDebutBail: form.dateDebutBail,
          dateFinBail: form.dateFinBail || null,
          montantLoyer: bienSelectionne?.prix ?? 0,
          montantCaution: bienSelectionne?.caution ?? null,
          frequencePaiement: bienSelectionne?.frequencePaiement ?? null,
          typeBail: form.typeBail || null,
          cautionVersee: form.cautionVersee,
          jourLimitePaiement: form.jourLimitePaiement ? parseInt(form.jourLimitePaiement) : null,
        },
      });

      toast.success("Locataire créé — génération du contrat en cours…");
      setCreatedBail(bail);
      setShowContratModal(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la création";
      toast.error(msg);
    }
  };

  const isPending = createLocataire.isPending || creerBail.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/owner/locataires")}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843]">
            <UserPlus className="w-3.5 h-3.5" />
            Nouveau locataire
          </div>
          <h1 className="text-xl font-display font-bold text-[#0C1A35] mt-0.5">
            Ajouter un locataire
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── Section 1 : Informations du locataire ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5" />
            Informations du locataire
          </h2>

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => set("prenom", e.target.value)}
                placeholder="Ex: Mamadou"
                className={inputCls(!!errors.prenom)}
              />
              {errors.prenom && (
                <p className="text-xs text-red-400 mt-1">{errors.prenom}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                placeholder="Ex: Diallo"
                className={inputCls(!!errors.nom)}
              />
              {errors.nom && (
                <p className="text-xs text-red-400 mt-1">{errors.nom}</p>
              )}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Téléphone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => set("telephone", e.target.value)}
              placeholder="+221 77 000 00 00"
              className={inputCls(!!errors.telephone)}
            />
            {errors.telephone && (
              <p className="text-xs text-red-400 mt-1">{errors.telephone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Email{" "}
              <span className="text-slate-300 font-normal">(optionnel)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="locataire@exemple.com"
              className={inputCls(!!errors.email)}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Occupants + Enfants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nombre d'occupants
              </label>
              <input
                type="number"
                value={form.nbOccupants}
                onChange={(e) =>
                  set("nbOccupants", parseInt(e.target.value) || 1)
                }
                className={inputCls(false)}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    form.presenceEnfants
                      ? "bg-[#D4A843] border-[#D4A843]"
                      : "border-slate-300 group-hover:border-[#D4A843]"
                  }`}
                  onClick={() => set("presenceEnfants", !form.presenceEnfants)}
                >
                  {form.presenceEnfants && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.presenceEnfants}
                  onChange={(e) => set("presenceEnfants", e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-600">
                  Présence d'enfants
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 2 : Association au bien + Bail ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Bien & Bail
          </h2>

          {/* Sélection du bien */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Bien à louer <span className="text-red-400">*</span>
            </label>
            {biensLocation.length === 0 ? (
              <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                <Home className="w-4 h-4 text-slate-300" />
                Aucun bien publié disponible
              </div>
            ) : (
              <select
                value={form.bienId}
                onChange={(e) => set("bienId", e.target.value)}
                className={selectCls(!!errors.bienId)}
              >
                <option value="">-- Sélectionner un bien --</option>
                {biensLocation.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.titre || b.ville || "Bien sans titre"}
                    {b.ville && b.titre ? ` — ${b.ville}` : ""}
                    {b.prix ? ` (${b.prix.toLocaleString("fr-FR")} FCFA/mois)` : ""}
                  </option>
                ))}
              </select>
            )}
            {errors.bienId && (
              <p className="text-xs text-red-400 mt-1">{errors.bienId}</p>
            )}
            {/* Aperçu du bien sélectionné */}
            {bienSelectionne && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                <Building2 className="w-3.5 h-3.5 text-[#D4A843]" />
                <span className="font-medium text-[#0C1A35]">
                  {bienSelectionne.titre || bienSelectionne.ville}
                </span>
                {bienSelectionne.ville && bienSelectionne.titre && (
                  <span>· {bienSelectionne.ville}</span>
                )}
                {bienSelectionne.typeLogement && (
                  <span>· {bienSelectionne.typeLogement.nom}</span>
                )}
              </div>
            )}
          </div>

          {/* Date de début + Date de fin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date de début <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.dateDebutBail}
                onChange={(e) => set("dateDebutBail", e.target.value)}
                className={inputCls(!!errors.dateDebutBail)}
              />
              {errors.dateDebutBail && (
                <p className="text-xs text-red-400 mt-1">{errors.dateDebutBail}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date de fin{" "}
                <span className="text-slate-300 font-normal">(optionnel)</span>
              </label>
              <input
                type="date"
                value={form.dateFinBail}
                onChange={(e) => set("dateFinBail", e.target.value)}
                className={inputCls(false)}
              />
            </div>
          </div>

          {/* Type de bail */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Type de bail
            </label>
            <select
              value={form.typeBail}
              onChange={(e) => set("typeBail", e.target.value)}
              className={selectCls(false)}
            >
              <option value="Habitation">Habitation</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixte">Mixte</option>
            </select>
          </div>

          {/* Caution versée + Jour limite paiement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Caution versée <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3 h-10 items-center">
                {[{ label: "Oui", value: true }, { label: "Non", value: false }].map(({ label, value }) => (
                  <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="cautionVersee"
                      checked={form.cautionVersee === value}
                      onChange={() => set("cautionVersee", value)}
                      className="accent-[#D4A843]"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date butoir de paiement{" "}
                <span className="text-slate-300 font-normal">(1–28, optionnel)</span>
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={form.jourLimitePaiement}
                onChange={(e) => set("jourLimitePaiement", e.target.value)}
                placeholder="Ex : 5"
                className={inputCls(false)}
              />
            </div>
          </div>

          {/* Conditions financières — lecture seule depuis l'annonce */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
              Conditions financières (depuis l'annonce)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Loyer</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bienSelectionne?.prix
                    ? `${bienSelectionne.prix.toLocaleString("fr-FR")} FCFA`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Caution</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bienSelectionne?.caution
                    ? `${bienSelectionne.caution.toLocaleString("fr-FR")} FCFA`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Fréquence</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bienSelectionne?.frequencePaiement ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/owner/locataires")}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || biensLocation.length === 0}
            className="flex-1 px-4 py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
          >
            {isPending ? "Création en cours..." : "Créer et associer au bien"}
          </button>
        </div>
      </form>

      {/* ContratModal — ouvert automatiquement après création du bail */}
      {showContratModal && createdBail && (
        <ContratModal
          bail={createdBail}
          isCreationFlow={true}
          onCancelCreation={handleCancelCreation}
          onClose={() => {
            setShowContratModal(false);
            if (creationCancelledRef.current) {
              navigate("/owner/locataires");
            } else {
              navigate(`/owner/locataires/${createdBail.locataireId}`);
            }
          }}
        />
      )}
    </div>
  );
}
