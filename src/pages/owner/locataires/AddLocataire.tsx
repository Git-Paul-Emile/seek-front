import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useCreateLocataire } from "@/hooks/useLocataire";
import { toast } from "sonner";

// ─── Helpers UI ────────────────────────────────────────────────────────────────

const inputCls = (hasError = false) =>
  `w-full h-10 border rounded-xl px-3 text-sm text-slate-700 placeholder:text-slate-300
   outline-none transition-all bg-white
   focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/10
   ${hasError ? "border-red-400" : "border-slate-200"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddLocataire() {
  const navigate = useNavigate();
  const createLocataire = useCreateLocataire();

  const [form, setForm] = useState({
    // Locataire
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    nbOccupants: 1,
    presenceEnfants: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nom.trim()) errs.nom = "Le nom est requis";
    if (!form.prenom.trim()) errs.prenom = "Le prénom est requis";
    if (!form.telephone.trim()) errs.telephone = "Le téléphone est requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email invalide";
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
      // Créer le locataire
      await createLocataire.mutateAsync({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || null,
        nbOccupants: form.nbOccupants,
        presenceEnfants: form.presenceEnfants,
      });

      toast.success("Locataire créé avec succès !");
      navigate("/owner/locataires");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la création";
      toast.error(msg);
    }
  };

  const isPending = createLocataire.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Locataires", to: "/owner/locataires" }, { label: "Ajouter un locataire" }]} />
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
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
          >
            {isPending ? "Création en cours..." : "Créer le locataire"}
          </button>
        </div>
      </form>
    </div>
  );
}
