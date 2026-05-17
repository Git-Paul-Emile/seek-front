import type { TypeChamp } from "@/api/champ";

interface Props {
  champId: string;
  nom: string;
  type: TypeChamp;
  unite?: string | null;
  options?: string[];
  obligatoire: boolean;
  value: string;
  onChange: (champId: string, value: string) => void;
  error?: string;
}

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

const inputErrCls =
  "w-full h-10 px-3.5 rounded-xl border border-red-300 bg-red-50 text-sm " +
  "text-slate-700 outline-none focus:border-red-400 transition-all";

export default function DynamicField({ champId, nom, type, unite, options = [], obligatoire, value, onChange, error }: Props) {
  const cls = error ? inputErrCls : inputCls;
  const label = (
    <label className="block text-xs font-medium text-slate-500 mb-1.5">
      {nom}{unite ? ` (${unite})` : ""}{obligatoire && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );

  const renderInput = () => {
    switch (type) {
      case "TEXTE":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(champId, e.target.value)}
            placeholder={`Entrez ${nom.toLowerCase()}`}
            className={cls}
          />
        );

      case "NOMBRE":
      case "SURFACE":
      case "PRIX":
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(champId, e.target.value)}
              placeholder="0"
              className={`${cls} ${unite ? "pr-12" : ""}`}
            />
            {unite && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                {unite}
              </span>
            )}
          </div>
        );

      case "BOOLEEN":
        return (
          <div className="flex items-center gap-3 h-10">
            {(["Oui", "Non"] as const).map((opt) => {
              const v = opt === "Oui" ? "true" : "false";
              const active = value === v;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(champId, v)}
                  className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? "bg-[#D4A843] border-[#D4A843] text-white"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case "SELECT":
        return (
          <select
            value={value}
            onChange={(e) => onChange(champId, e.target.value)}
            className={cls}
          >
            <option value="">— Choisir —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(champId, e.target.value)}
            className={cls}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {label}
      {renderInput()}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
