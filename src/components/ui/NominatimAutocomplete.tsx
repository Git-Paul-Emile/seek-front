/**
 * GeoAutocomplete — utilise l'API Photon (Komoot/OSM) pour la suggestion d'adresses.
 * Exporté sous l'ancien nom pour compatibilité des imports existants.
 */
import { useState, useRef, useEffect } from "react";
import { Navigation, X, Loader2 } from "lucide-react";

// ─── Types Photon (GeoJSON FeatureCollection) ─────────────────────────────────

interface PhotonFeature {
  geometry: { coordinates: [number, number] }; // [lon, lat]
  properties: {
    osm_id?: number;
    name?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

// ─── Types publics ────────────────────────────────────────────────────────────

export interface NominatimPoint {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  onSelect: (point: NominatimPoint | null) => void;
  placeholder?: string;
  dark?: boolean;
}

// Bounding-box Sénégal : lon_min, lat_min, lon_max, lat_max
const SENEGAL_BBOX = "-17.5,12.3,-11.4,16.7";

function buildLabel(p: PhotonFeature["properties"]): string {
  const parts = [p.name, p.district, p.city, p.state, p.country].filter(Boolean);
  return parts.join(", ");
}

let debounceTimer: ReturnType<typeof setTimeout>;

// ─── Composant ────────────────────────────────────────────────────────────────

const NominatimAutocomplete = ({ onSelect, placeholder = "Ex: Avenue Bourguiba, Dakar", dark }: Props) => {
  const [inputValue,   setInputValue]   = useState("");
  const [suggestions,  setSuggestions]  = useState<PhotonFeature[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [selected,     setSelected]     = useState<NominatimPoint | null>(null);
  const [isOpen,       setIsOpen]       = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (value: string) => {
    setInputValue(value);
    if (selected) { setSelected(null); onSelect(null); }
    clearTimeout(debounceTimer);

    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=6&lang=fr&bbox=${SENEGAL_BBOX}`;
        const res  = await fetch(url);
        const data: PhotonResponse = await res.json();
        const features = data.features ?? [];
        setSuggestions(features);
        setIsOpen(features.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const label      = buildLabel(feature.properties);
    const point: NominatimPoint = { lat, lng: lon, label };
    setInputValue(feature.properties.name ?? label.split(",")[0]);
    setSelected(point);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(point);
  };

  const handleClear = () => {
    setInputValue("");
    setSelected(null);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(null);
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const inputClass = dark
    ? "h-11 w-full bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none text-sm rounded-lg px-3 pl-9 pr-8 transition-all"
    : "h-11 w-full border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none text-sm rounded-lg px-3 pl-9 pr-8";

  const dropdownClass = dark
    ? "absolute z-50 left-0 right-0 mt-1 bg-[#0C1A35] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
    : "absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden";

  const itemClass = dark
    ? "px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
    : "px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0";

  return (
    <div ref={containerRef} className="relative">
      <Navigation className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${selected ? (dark ? "text-green-400/80" : "text-green-500") : (dark ? "text-white/35" : "text-slate-400")}`} />

      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => !selected && suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />

      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className={`w-3.5 h-3.5 animate-spin ${dark ? "text-white/40" : "text-slate-400"}`} />
        ) : inputValue ? (
          <button
            type="button"
            onClick={handleClear}
            className={`transition-colors ${dark ? "text-white/40 hover:text-white/80" : "text-slate-400 hover:text-slate-600"}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </span>

      {isOpen && suggestions.length > 0 && (
        <div className={dropdownClass}>
          {suggestions.map((feature, i) => {
            const p    = feature.properties;
            const main = p.name ?? "—";
            const sub  = [p.district, p.city, p.state, p.country].filter(Boolean).join(", ");
            return (
              <div key={`${p.osm_id ?? i}`} className={itemClass} onMouseDown={() => handleSelect(feature)}>
                <p className={`text-xs font-semibold line-clamp-1 ${dark ? "text-white/90" : "text-slate-700"}`}>{main}</p>
                {sub && <p className={`text-xs line-clamp-1 mt-0.5 ${dark ? "text-white/40" : "text-slate-400"}`}>{sub}</p>}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <p className={`mt-1 text-xs ${dark ? "text-green-400/70" : "text-green-600"}`}>
          Point sélectionné — recherche par proximité activée
        </p>
      )}
    </div>
  );
};

export default NominatimAutocomplete;
