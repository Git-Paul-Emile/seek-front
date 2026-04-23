import { useEffect, useState } from "react";
import { Settings, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useConfigMonetisation, useUpdateConfigMonetisation } from "@/hooks/useMonetisation";

// ─── Styles ───────────────────────────────────────────────────────────────────


// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ${
          checked ? "bg-[#D4A843] border-[#D4A843]" : "bg-slate-200 border-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfigMonetisationPage() {
  const { data: config, isLoading } = useConfigMonetisation();
  const updateConfig = useUpdateConfigMonetisation();

  const [form, setForm] = useState({
    miseEnAvantActive: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        miseEnAvantActive: config.miseEnAvantActive,
      });
    }
  }, [config]);

  const handleSave = async () => {
    updateConfig.mutate(form, {
      onSuccess: () => toast.success("Configuration sauvegardée"),
      onError: () => toast.error("Erreur lors de la sauvegarde"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Monétisation", to: "/admin/monetisation/config" },
          { label: "Configuration" },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#D4A843]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0C1A35]">Configuration Monétisation</h1>
          <p className="text-sm text-slate-400">Activez et configurez les modules de revenus</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Modules actifs</h2>
        <Toggle
          checked={form.miseEnAvantActive}
          onChange={(v) => setForm((f) => ({ ...f, miseEnAvantActive: v }))}
          label="Mises en avant payantes"
          description="Permet aux propriétaires de booster leurs annonces via une formule premium."
        />
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
