import { useEffect, useRef, useState } from "react";
import { Settings, Loader2, CheckCircle, Clock, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  useConfigSite,
  useUpdateConfigSite,
  useUploadLogoFiligrane,
  useDeleteLogoFiligrane,
  ServiceHoursDay,
} from "@/hooks/useConfigSite";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 outline-none focus:border-[#D4A843]/60 focus:bg-white transition-all";

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

// ─── Jours de la semaine ──────────────────────────────────────────────────────

const DAYS_OF_WEEK = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

// ─── Générer les options d'heures ────────────────────────────────────────────

const generateHourOptions = () => {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    const hour = h.toString().padStart(2, "0");
    hours.push(`${hour}:00`);
    hours.push(`${hour}:30`);
  }
  return hours;
};

const HOUR_OPTIONS = generateHourOptions();

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfigSitePage() {
  const { data: config, isLoading } = useConfigSite();
  const updateConfig = useUpdateConfigSite();
  const uploadLogo = useUploadLogoFiligrane();
  const deleteLogo = useDeleteLogoFiligrane();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    serviceClientHours: [] as ServiceHoursDay[],
  });

  // Initialiser les horaires par défaut
  useEffect(() => {
    if (!config) return;

    // Si les horaires sont déjà un tableau, les utiliser
    if (Array.isArray(config.serviceClientHours) && config.serviceClientHours.length > 0) {
      // S'assurer que tous les jours sont présents
      const existingDays = config.serviceClientHours.map((h) => h.day);
      const missingDays = DAYS_OF_WEEK.filter((d) => !existingDays.includes(d.key));

      if (missingDays.length > 0) {
        // Ajouter les jours manquants avec des valeurs par défaut
        const defaultHours: ServiceHoursDay[] = [
          { day: "lundi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "mardi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "mercredi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "jeudi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "vendredi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "samedi", isOpen: true, open: "09:00", close: "18:00" },
          { day: "dimanche", isOpen: false, open: "09:00", close: "13:00" },
        ];

        const mergedHours = [...config.serviceClientHours];
        missingDays.forEach((missingDay) => {
          const defaultDay = defaultHours.find((d) => d.day === missingDay.key);
          if (defaultDay) {
            mergedHours.push(defaultDay);
          }
        });

        setForm({
          contactEmail: config.contactEmail,
          contactPhone: config.contactPhone,
          contactAddress: config.contactAddress,
          serviceClientHours: mergedHours,
        });
      } else {
        setForm({
          contactEmail: config.contactEmail,
          contactPhone: config.contactPhone,
          contactAddress: config.contactAddress,
          serviceClientHours: config.serviceClientHours,
        });
      }
    } else {
      // Valeurs par défaut
      setForm({
        contactEmail: config.contactEmail,
        contactPhone: config.contactPhone,
        contactAddress: config.contactAddress,
        serviceClientHours: [
          { day: "lundi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "mardi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "mercredi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "jeudi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "vendredi", isOpen: true, open: "08:00", close: "18:00" },
          { day: "samedi", isOpen: true, open: "09:00", close: "18:00" },
          { day: "dimanche", isOpen: false, open: "09:00", close: "13:00" },
        ],
      });
    }
  }, [config]);

  // Mettre à jour un jour spécifique
  const updateDay = (dayKey: string, updates: Partial<ServiceHoursDay>) => {
    setForm((prev) => ({
      ...prev,
      serviceClientHours: prev.serviceClientHours.map((day) =>
        day.day === dayKey ? { ...day, ...updates } : day
      ),
    }));
  };

  // Obtenir les horaires pour un jour
  const getDayHours = (dayKey: string): ServiceHoursDay | undefined => {
    return form.serviceClientHours.find((h) => h.day === dayKey);
  };

  const handleSave = async () => {
    updateConfig.mutate(form, {
      onSuccess: () => toast.success("Paramètres sauvegardés avec succès"),
      onError: () => toast.error("Erreur lors de la sauvegarde"),
    });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      toast.error("Le logo doit être un fichier PNG (fond transparent)");
      return;
    }
    setPendingLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = () => {
    if (!pendingLogoFile) return;
    uploadLogo.mutate(pendingLogoFile, {
      onSuccess: () => {
        toast.success("Logo filigrane mis à jour");
        setPendingLogoFile(null);
        setLogoPreview(null);
      },
      onError: () => toast.error("Erreur lors de l'upload du logo"),
    });
  };

  const handleLogoDelete = () => {
    deleteLogo.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logo filigrane supprimé");
        setPendingLogoFile(null);
        setLogoPreview(null);
      },
      onError: () => toast.error("Erreur lors de la suppression du logo"),
    });
  };

  const currentLogo = logoPreview ?? config?.logoFiligrane ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Paramètres", to: "/admin/parametres/config-site" },
          { label: "Configuration du site" },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#D4A843]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0C1A35]">Paramètres du site</h1>
          <p className="text-sm text-slate-400">Gérez les informations de contact affichées sur le site</p>
        </div>
      </div>

      {/* ─── Logo Filigrane ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ImagePlus className="w-5 h-5 text-[#D4A843]" />
          <h2 className="text-sm font-semibold text-slate-700">Logo Filigrane</h2>
        </div>
        <p className="text-xs text-slate-400">
          Le logo sera appliqué discrètement sur chaque photo d'annonce (PNG sans fond
           recommandé).
        </p>

        <div className="flex flex-wrap items-center gap-5">
          {/* Aperçu */}
          <div
            className="w-36 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50
              flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            {currentLogo ? (
              <img src={currentLogo} alt="Logo filigrane" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-slate-400 text-center px-2">Cliquer pour choisir un logo PNG</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleLogoSelect}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border
                border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              {config?.logoFiligrane ? "Changer le logo" : "Choisir un logo PNG"}
            </button>

            {pendingLogoFile && (
              <button
                onClick={handleLogoUpload}
                disabled={uploadLogo.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl
                  bg-[#D4A843] hover:bg-[#c49a36] text-white transition-colors disabled:opacity-50"
              >
                {uploadLogo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Appliquer ce logo
              </button>
            )}

            {config?.logoFiligrane && !pendingLogoFile && (
              <button
                onClick={handleLogoDelete}
                disabled={deleteLogo.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border
                  border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deleteLogo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer le logo
              </button>
            )}
          </div>
        </div>

        {config?.logoFiligrane && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Logo actif — appliqué sur les nouvelles photos d'annonces
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Informations de contact</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Adresse Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="contact@seek.sn"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              placeholder="+221 77 000 00 00"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Adresse physique</label>
          <input
            type="text"
            value={form.contactAddress}
            onChange={(e) => setForm((f) => ({ ...f, contactAddress: e.target.value }))}
            placeholder="Dakar, Sénégal"
            className={inputCls}
          />
        </div>
      </div>

      {/* Horaires du Service Client */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#D4A843]" />
          <h2 className="text-sm font-semibold text-slate-700">Horaires du Service Client</h2>
        </div>

        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = getDayHours(day.key);
            const isOpen = dayHours?.isOpen ?? false;
            const openTime = dayHours?.open ?? "08:00";
            const closeTime = dayHours?.close ?? "18:00";

            return (
              <div
                key={day.key}
                className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border transition-all ${
                  isOpen
                    ? "border-[#D4A843]/30 bg-[#D4A843]/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {/* Case à cocher pour le jour */}
                <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => updateDay(day.key, { isOpen: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]/30"
                  />
                  <span className={`text-sm font-medium ${isOpen ? "text-slate-700" : "text-slate-400"}`}>
                    {day.label}
                  </span>
                </label>

                {/* Heures d'ouverture et fermeture */}
                {isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-slate-500">Ouverture</label>
                      <select
                        value={openTime}
                        onChange={(e) => updateDay(day.key, { open: e.target.value })}
                        className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#D4A843]/60 focus:outline-none"
                      >
                        {HOUR_OPTIONS.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-400">→</span>

                    <div className="flex items-center gap-1">
                      <label className="text-xs text-slate-500">Fermeture</label>
                      <select
                        value={closeTime}
                        onChange={(e) => updateDay(day.key, { close: e.target.value })}
                        className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#D4A843]/60 focus:outline-none"
                      >
                        {HOUR_OPTIONS.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Message quand fermé */}
                {!isOpen && (
                  <span className="text-sm text-slate-400 italic">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] hover:bg-[#c49a36] text-white
            text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {updateConfig.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
