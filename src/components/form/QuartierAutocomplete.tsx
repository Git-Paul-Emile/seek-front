import { useState, useRef, useId } from "react";
import { MapPin, Loader2, AlertCircle, X } from "lucide-react";
import {
  useNominatimQuartier,
  type QuartierSuggestion,
} from "@/hooks/useNominatimQuartier";

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuartierAutocompleteProps {
  /** Valeur courante de l'input (contrôlé) */
  value: string;
  /** Callback quand l'utilisateur modifie le texte librement */
  onChange: (value: string) => void;
  /** Callback quand l'utilisateur sélectionne une suggestion */
  onSelect: (suggestion: QuartierSuggestion) => void;
  /** Code ISO pays pour restreindre Nominatim (ex : "sn") */
  countryCode: string;
  placeholder?: string;
  disabled?: boolean;
  /** Classes Tailwind additionnelles sur le conteneur */
  className?: string;
}

// ─── Styles partagés (alignés avec AddBien.tsx) ───────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm " +
  "text-slate-700 placeholder:text-slate-300 outline-none " +
  "focus:border-[#D4A843]/60 focus:bg-white transition-all";

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * Champ autocomplete pour saisir un quartier via OpenStreetMap Nominatim.
 *
 * Affiche uniquement le nom court (suburb / neighbourhood),
 * filtre les résultats au pays sélectionné,
 * et expose les données complètes via `onSelect`.
 *
 * Logique (debounce, appel API, mapping) → `useNominatimQuartier`.
 * Ce composant ne gère que la présentation.
 */
export function QuartierAutocomplete({
  value,
  onChange,
  onSelect,
  countryCode,
  placeholder = "Tapez un quartier (min. 2 caractères)…",
  disabled = false,
  className = "",
}: QuartierAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Identifiant unique pour l'accessibilité (listbox)
  const listboxId = useId();

  const { suggestions, loading, error, clear } = useNominatimQuartier(
    value,
    countryCode
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (suggestion: QuartierSuggestion) => {
    onSelect(suggestion);
    clear();
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    clear();
    setOpen(false);
    inputRef.current?.focus();
  };

  // onBlur avec délai pour laisser le clic sur une suggestion s'enregistrer
  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150);
  };

  // ── État du dropdown ──────────────────────────────────────────────────────

  const showDropdown = open && (suggestions.length > 0 || error !== null);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className={`relative ${className}`}>
      {/* ── Input ── */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          value={value}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputCls} pr-9 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />

        {/* Spinner pendant le chargement */}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin pointer-events-none" />
        )}

        {/* Bouton effacer - affiché quand il y a une valeur et pas de chargement */}
        {!loading && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Effacer le quartier"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown des suggestions ── */}
      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggestions de quartiers"
          className="absolute top-full left-0 right-0 z-[200] mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Message d'erreur */}
          {error && (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </li>
          )}

          {/* Liste des suggestions */}
          {!error &&
            suggestions.map((s) => (
              <li key={s.placeId} role="option" aria-selected={false}>
                <button
                  type="button"
                  // onMouseDown plutôt que onClick : évite que onBlur ferme
                  // le dropdown avant que le clic soit enregistré
                  onMouseDown={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-[#D4A843]/8 hover:text-[#0C1A35] border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                    {/* Nom court - suburb ou neighbourhood uniquement */}
                    <span className="font-medium">{s.nom}</span>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
