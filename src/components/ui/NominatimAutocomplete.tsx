/**
 * GeoAutocomplete — utilise l'API Photon (OpenStreetMap) pour la suggestion d'adresses.
 * Meilleure couverture POI Sénégal que Mapbox Geocoding.
 * Conserve l'interface NominatimPoint pour compatibilité.
 */
import { useState, useRef, useEffect } from "react";
import { Navigation, X, Loader2, MapPin, Building2, Map, Search, Store } from "lucide-react";

// ─── Types Photon ─────────────────────────────────────────────────────────────

interface PhotonFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
  properties: {
    osm_id: number;
    osm_key: string;
    osm_value: string;
    type: string;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    countrycode?: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFeatureLabel(f: PhotonFeature): string {
  const p = f.properties;
  if (p.name) return p.name;
  if (p.housenumber && p.street) return `${p.housenumber} ${p.street}`;
  if (p.street) return p.street;
  if (p.city) return p.city;
  return p.type ?? "Lieu";
}

function getFeatureSubtitle(f: PhotonFeature): string {
  const p = f.properties;
  const parts: string[] = [];
  if (p.district && p.district !== p.name) parts.push(p.district);
  if (p.city && p.city !== p.name)         parts.push(p.city);
  if (p.state && p.state !== p.city)        parts.push(p.state);
  return parts.join(", ");
}

function getFeatureIcon(f: PhotonFeature) {
  const { osm_key, osm_value, type } = f.properties;
  if (osm_key === "amenity" || osm_key === "leisure" || osm_key === "tourism") return MapPin;
  if (osm_key === "shop")      return Store;
  if (osm_key === "building")  return Building2;
  if (type === "city" || type === "town" || type === "village") return Map;
  if (type === "locality" || type === "district" || type === "borough") return Map;
  if (osm_key === "highway" || type === "street") return Building2;
  if (osm_value === "school" || osm_value === "university" || osm_value === "college") return Building2;
  return Search;
}

let debounceTimer: ReturnType<typeof setTimeout>;

// ─── Composant ────────────────────────────────────────────────────────────────

const NominatimAutocomplete = ({ onSelect, placeholder = "Ex: Sacré-Cœur 3, Dakar", dark }: Props) => {
  const [inputValue,  setInputValue]  = useState("");
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [selected,    setSelected]    = useState<NominatimPoint | null>(null);
  const [isOpen,      setIsOpen]      = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
        const url = new URL("https://photon.komoot.io/api/");
        url.searchParams.set("q", value);
        url.searchParams.set("limit", "8");
        url.searchParams.set("lang", "fr");
        // Biais de proximité centré sur Dakar
        url.searchParams.set("lat", "14.6928");
        url.searchParams.set("lon", "-17.4467");

        const res  = await fetch(url.toString());
        const data: PhotonResponse = await res.json();

        // Filtrer sur le Sénégal uniquement
        const features = (data.features ?? []).filter(
          (f) => f.properties.countrycode?.toUpperCase() === "SN"
        );

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
    const [lng, lat] = feature.geometry.coordinates;
    const label = getFeatureLabel(feature);
    const sub   = getFeatureSubtitle(feature);
    const point: NominatimPoint = {
      lat, lng,
      label: sub ? `${label}, ${sub}` : label,
    };
    setInputValue(label);
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
    : "absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden";

  return (
    <div ref={containerRef} className="relative">
      <Navigation className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dark ? "text-white/35" : "text-slate-400"}`} />

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
          <button type="button" onClick={handleClear} className={`transition-colors ${dark ? "text-white/40 hover:text-white/80" : "text-slate-400 hover:text-slate-600"}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </span>

      {isOpen && suggestions.length > 0 && (
        <div className={dropdownClass}>
          {suggestions.map((feature, i) => {
            const label    = getFeatureLabel(feature);
            const subtitle = getFeatureSubtitle(feature);
            const Icon     = getFeatureIcon(feature);
            const key      = `${feature.properties.osm_id}-${i}`;
            return (
              <div
                key={key}
                className={`px-3 py-2.5 cursor-pointer transition-colors flex items-center gap-3 border-b last:border-0 ${
                  dark ? "hover:bg-white/10 border-white/5" : "hover:bg-slate-50 border-slate-100"
                }`}
                onMouseDown={() => handleSelect(feature)}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-slate-100"}`}>
                  <Icon className={`w-4 h-4 ${dark ? "text-white/50" : "text-slate-400"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold line-clamp-1 ${dark ? "text-white/90" : "text-slate-800"}`}>
                    {label}
                  </p>
                  {subtitle && (
                    <p className={`text-xs line-clamp-1 mt-0.5 ${dark ? "text-white/40" : "text-slate-400"}`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NominatimAutocomplete;
