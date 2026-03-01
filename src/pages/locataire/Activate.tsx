import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Building2, KeyRound, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { activerLocataireApi, meLocataireApi } from "@/api/locataireAuth";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { toast } from "sonner";
import type { TypePieceIdentite } from "@/api/locataire";

const TYPES_PIECE: { value: TypePieceIdentite; label: string }[] = [
  { value: "CNI", label: "Carte Nationale d'Identité" },
  { value: "PASSEPORT", label: "Passeport" },
  { value: "CARTE_CONSULAIRE", label: "Carte consulaire" },
  { value: "AUTRE", label: "Autre" },
];

// ─── Helpers UI ────────────────────────────────────────────────────────────────

const inputCls = (hasError = false) =>
  `w-full h-10 border rounded-xl px-3 text-sm text-slate-700 placeholder:text-slate-300
   outline-none transition-all bg-white
   focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/10
   ${hasError ? "border-red-400" : "border-slate-200"}`;

const selectCls =
  "w-full h-10 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 outline-none transition-all bg-white focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/10";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireActivate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { setLocataire } = useLocataireAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "",
    sexe: "",
    numPieceIdentite: "",
    typePiece: "" as TypePieceIdentite | "",
    dateDelivrance: "",
    dateExpiration: "",
    autoriteDelivrance: "",
    situationProfessionnelle: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Token invalide ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0C1A35] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">
            Lien invalide
          </h2>
          <p className="text-white/50 text-sm">
            Vérifiez le lien reçu ou contactez votre propriétaire.
          </p>
        </div>
      </div>
    );
  }

  // ── Succès ──────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0C1A35] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#D4A843]/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[#D4A843]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            Compte activé !
          </h2>
          <p className="text-white/50 text-sm">
            Votre espace locataire est maintenant actif.
          </p>
          <button
            onClick={() => navigate("/locataire/dashboard")}
            className="mt-2 px-6 py-2.5 bg-[#D4A843] text-[#0C1A35] rounded-xl font-bold text-sm hover:bg-[#c49a3a] transition-colors"
          >
            Accéder à mon espace
          </button>
        </div>
      </div>
    );
  }

  // ── Validation step 1 ───────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.password || form.password.length < 6)
      errs.password = "Minimum 6 caractères";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas";
    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      await activerLocataireApi({
        token,
        password: form.password,
        dateNaissance: form.dateNaissance || null,
        lieuNaissance: form.lieuNaissance || null,
        nationalite: form.nationalite || null,
        sexe: form.sexe || null,
        numPieceIdentite: form.numPieceIdentite || null,
        typePiece: (form.typePiece as TypePieceIdentite) || null,
        dateDelivrance: form.dateDelivrance || null,
        dateExpiration: form.dateExpiration || null,
        autoriteDelivrance: form.autoriteDelivrance || null,
        situationProfessionnelle: form.situationProfessionnelle || null,
      });
      const locataire = await meLocataireApi();
      setLocataire(locataire);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de l'activation";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1A35] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest text-[#D4A843]"
        >
          SEEK
        </Link>
        <Link
          to="/locataire/login"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Connexion
        </Link>
      </header>

      {/* Contenu */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Badge + Titre */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#D4A843] border border-[#D4A843]/30 bg-[#D4A843]/10 rounded-full px-4 py-1.5 mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Espace Locataire
            </div>
            <h1 className="font-display text-3xl font-bold text-white">
              Activez votre espace
            </h1>
            <p className="text-white/40 text-sm mt-1.5">
              {step === 1
                ? "Créez votre mot de passe pour accéder à votre espace"
                : "Complétez votre profil d'identité (optionnel)"}
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? "bg-[#D4A843]" : "bg-white/10"}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? "bg-[#D4A843]" : "bg-white/10"}`} />
          </div>

          {/* Carte */}
          <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Mot de passe <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className={inputCls(!!errors.password) + " pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Confirmer le mot de passe <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        placeholder="Répéter le mot de passe"
                        className={inputCls(!!errors.confirmPassword) + " pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 mt-2 bg-[#D4A843] text-[#0C1A35] rounded-xl font-bold text-sm hover:bg-[#c49a3a] transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-white/40 bg-white/5 rounded-xl p-3 border border-white/10">
                    Ces informations sont optionnelles. Vous pouvez les compléter plus tard depuis votre espace.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Date de naissance</label>
                      <input type="date" value={form.dateNaissance}
                        onChange={(e) => set("dateNaissance", e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Lieu de naissance</label>
                      <input type="text" value={form.lieuNaissance}
                        onChange={(e) => set("lieuNaissance", e.target.value)}
                        placeholder="Ex: Dakar" className={inputCls()} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Nationalité</label>
                      <input type="text" value={form.nationalite}
                        onChange={(e) => set("nationalite", e.target.value)}
                        placeholder="Ex: Sénégalaise" className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Sexe</label>
                      <select value={form.sexe} onChange={(e) => set("sexe", e.target.value)}
                        className={selectCls}>
                        <option value="">--</option>
                        <option value="Masculin">Masculin</option>
                        <option value="Féminin">Féminin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Type de pièce d'identité</label>
                    <select value={form.typePiece} onChange={(e) => set("typePiece", e.target.value)}
                      className={selectCls}>
                      <option value="">-- Sélectionner --</option>
                      {TYPES_PIECE.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Numéro de pièce d'identité</label>
                    <input type="text" value={form.numPieceIdentite}
                      onChange={(e) => set("numPieceIdentite", e.target.value)}
                      className={inputCls()} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Date de délivrance</label>
                      <input type="date" value={form.dateDelivrance}
                        onChange={(e) => set("dateDelivrance", e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Date d'expiration</label>
                      <input type="date" value={form.dateExpiration}
                        onChange={(e) => set("dateExpiration", e.target.value)}
                        className={inputCls()} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Autorité de délivrance</label>
                    <input type="text" value={form.autoriteDelivrance}
                      onChange={(e) => set("autoriteDelivrance", e.target.value)}
                      placeholder="Ex: Préfecture de Dakar" className={inputCls()} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Situation professionnelle</label>
                    <select value={form.situationProfessionnelle}
                      onChange={(e) => set("situationProfessionnelle", e.target.value)}
                      className={selectCls}>
                      <option value="">-- Sélectionner --</option>
                      <option value="Employé">Employé</option>
                      <option value="Indépendant">Indépendant / Freelance</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Étudiant">Étudiant</option>
                      <option value="Sans emploi">Sans emploi</option>
                      <option value="Retraité">Retraité</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-10 border border-white/15 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-10 bg-[#D4A843] text-[#0C1A35] rounded-xl text-sm font-bold hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
                    >
                      {isSubmitting ? "Activation..." : "Activer mon compte"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
