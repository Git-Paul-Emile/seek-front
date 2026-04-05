import { useEffect, useMemo, useRef, useState } from "react";
import L, { type LayerGroup, type Map as LeafletMap } from "leaflet";
import type { Etablissement } from "@/api/bien";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BIEN_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// CAT_COLORS est défini plus bas — on duplique juste les couleurs text ici pour les marqueurs
const ETAB_MARKER_COLORS: Record<string, string> = {
  hopital: "#059669", pharmacie: "#059669",
  ecole_maternelle: "#2563eb", ecole_primaire: "#2563eb", college: "#2563eb", lycee: "#2563eb", universite: "#2563eb",
  supermarche: "#d97706", marche: "#d97706", boulangerie: "#d97706",
  mosquee: "#7c3aed", eglise: "#7c3aed",
  arret_bus: "#0284c7", station_brt: "#0284c7", route_principale: "#0284c7",
  gendarmerie: "#475569", pompiers: "#475569", mairie: "#475569",
};

function makeEtablissementIcon(type: string) {
  const color = ETAB_MARKER_COLORS[type] ?? "#475569";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

const ETABLISSEMENT_LABELS: Record<string, string> = {
  hopital: "Hôpital",
  pharmacie: "Pharmacie",
  ecole_maternelle: "École maternelle",
  ecole_primaire: "École primaire",
  college: "Collège",
  lycee: "Lycée",
  universite: "Université",
  supermarche: "Supermarché",
  marche: "Marché",
  boulangerie: "Boulangerie",
  mosquee: "Mosquée",
  eglise: "Église",
  gendarmerie: "Gendarmerie",
  pompiers: "Caserne des pompiers",
  mairie: "Mairie",
  arret_bus: "Arrêt de bus",
  station_brt: "Station BRT",
  route_principale: "Route principale",
};

// ─── Overpass API helpers ─────────────────────────────────────────────────────

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function overpassToType(tags: Record<string, string>): string | null {
  const a = tags.amenity ?? "";
  const s = tags.shop ?? "";
  if (a === "hospital" || a === "clinic") return "hopital";
  if (a === "pharmacy") return "pharmacie";
  if (a === "school") return "ecole_primaire";
  if (a === "college") return "college";
  if (a === "university") return "universite";
  if (a === "marketplace") return "marche";
  if (a === "place_of_worship") return tags.religion === "christian" ? "eglise" : "mosquee";
  if (a === "bus_station") return "arret_bus";
  if (a === "police") return "gendarmerie";
  if (a === "fire_station") return "pompiers";
  if (a === "townhall" || a === "public_building") return "mairie";
  if (s === "supermarket") return "supermarche";
  if (s === "bakery") return "boulangerie";
  return null;
}

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const d = (deg: number) => (deg * Math.PI) / 180;
  const a =
    Math.sin(d(lat2 - lat1) / 2) ** 2 +
    Math.cos(d(lat1)) * Math.cos(d(lat2)) * Math.sin(d(lon2 - lon1) / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const OVERPASS_MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function fetchOverpassEtabs(lat: number, lng: number): Promise<Etablissement[]> {
  const amenity = "hospital|clinic|pharmacy|school|college|university|marketplace|place_of_worship|bus_station|police|fire_station|townhall";
  const query =
    `[out:json][timeout:20];` +
    `(nwr["amenity"~"^(${amenity})$"](around:1500,${lat},${lng});` +
    `nwr["shop"~"^(supermarket|bakery)$"](around:1000,${lat},${lng});` +
    `);out center;`;
  const url = `?data=${encodeURIComponent(query)}`;

  let lastError: unknown;
  for (const mirror of OVERPASS_MIRRORS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18_000);
    try {
      const res = await fetch(mirror + url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Parse elements — nodes have lat/lon directly, ways/relations use center
      const all = (data.elements as OverpassElement[])
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          const type = overpassToType(el.tags ?? {});
          if (!type || !Number.isFinite(elLat) || !Number.isFinite(elLon)) return null;
          const tags = el.tags ?? {};
          const adresse = tags["addr:full"]
            ?? (tags["addr:housenumber"] && tags["addr:street"]
                ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
                : tags["addr:street"] ?? null);
          return {
            id: `overpass-${el.id}`,
            type,
            nom: tags.name ?? null,
            latitude: elLat as number,
            longitude: elLon as number,
            distance: Math.round(haversineDist(lat, lng, elLat as number, elLon as number)),
            adresse: adresse ?? null,
          } as Etablissement;
        })
        .filter((e): e is Etablissement => e !== null);

      // Dédupliquer par type : garder le plus proche de chaque type
      const byType = new Map<string, Etablissement>();
      for (const e of all) {
        const existing = byType.get(e.type);
        if (!existing || (e.distance ?? Infinity) < (existing.distance ?? Infinity)) {
          byType.set(e.type, e);
        }
      }
      return Array.from(byType.values());
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }
  throw lastError;
}

// ─── Popup helpers ────────────────────────────────────────────────────────────

type EtabCat = "sante" | "education" | "commerce" | "culte" | "transport" | "services";

function getEtabCat(type: string): EtabCat {
  if (["hopital", "pharmacie"].includes(type)) return "sante";
  if (["ecole_maternelle", "ecole_primaire", "college", "lycee", "universite"].includes(type)) return "education";
  if (["supermarche", "marche", "boulangerie"].includes(type)) return "commerce";
  if (["mosquee", "eglise"].includes(type)) return "culte";
  if (["arret_bus", "station_brt", "route_principale"].includes(type)) return "transport";
  return "services";
}

const CAT_COLORS: Record<EtabCat, { bg: string; text: string; badgeBg: string }> = {
  sante:     { bg: "#d1fae5", text: "#059669", badgeBg: "#a7f3d0" },
  education: { bg: "#dbeafe", text: "#2563eb", badgeBg: "#bfdbfe" },
  commerce:  { bg: "#fef3c7", text: "#d97706", badgeBg: "#fde68a" },
  culte:     { bg: "#ede9fe", text: "#7c3aed", badgeBg: "#ddd6fe" },
  transport: { bg: "#e0f2fe", text: "#0284c7", badgeBg: "#bae6fd" },
  services:  { bg: "#f1f5f9", text: "#475569", badgeBg: "#e2e8f0" },
};

// SVG paths (Lucide-style, viewBox 0 0 24 24, stroke-based)
const CAT_SVG_PATH: Record<EtabCat, string> = {
  sante:     `<path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`,
  education: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  commerce:  `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  culte:     `<rect x="3" y="11" width="18" height="10" rx="1"/><polygon points="12 2 20 7 4 7"/>`,
  transport: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M6 13h4"/><path d="M14 13h4"/>`,
  services:  `<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/>`,
};

// Walking ~5 km/h (83 m/min), car ~40 km/h (667 m/min)
function estimateTime(distanceM: number): { walk: number; car: number } {
  return {
    walk: Math.ceil(distanceM / 83),
    car: Math.ceil(distanceM / 667),
  };
}

function makeSvgIcon(cat: EtabCat, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CAT_SVG_PATH[cat]}</svg>`;
}

function createPopupNode(title: string, subtitle?: string, distance?: number | null, etabType?: string, adresse?: string | null) {
  const root = document.createElement("div");
  Object.assign(root.style, {
    fontFamily: "system-ui, sans-serif",
    minWidth: "170px",
    maxWidth: "240px",
    padding: "2px 0",
  });

  if (etabType) {
    // Établissement popup
    const cat = getEtabCat(etabType);
    const colors = CAT_COLORS[cat];
    const hasDistance = typeof distance === "number" && Number.isFinite(distance) && distance > 0;
    const distText = hasDistance
      ? (distance! < 1000 ? `${distance} m` : `${(distance! / 1000).toFixed(1)} km`)
      : null;
    const timeEst = hasDistance ? estimateTime(distance!) : null;

    // Icon + title row
    const header = document.createElement("div");
    Object.assign(header.style, { display: "flex", alignItems: "flex-start", gap: "8px" });

    const iconBox = document.createElement("div");
    Object.assign(iconBox.style, {
      width: "34px", height: "34px", borderRadius: "10px",
      background: colors.bg, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: "0",
    });
    iconBox.innerHTML = makeSvgIcon(cat, colors.text);
    header.appendChild(iconBox);

    const textBlock = document.createElement("div");
    Object.assign(textBlock.style, { flex: "1", minWidth: "0" });

    const pTitle = document.createElement("p");
    Object.assign(pTitle.style, {
      margin: "0", fontSize: "13px", fontWeight: "600",
      color: "#0C1A35", lineHeight: "1.3",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    });
    pTitle.textContent = title;
    textBlock.appendChild(pTitle);

    if (subtitle && subtitle !== title) {
      const badge = document.createElement("span");
      Object.assign(badge.style, {
        display: "inline-block", marginTop: "4px",
        fontSize: "10px", fontWeight: "600",
        padding: "1px 7px", borderRadius: "999px",
        background: colors.badgeBg, color: colors.text,
      });
      badge.textContent = subtitle;
      textBlock.appendChild(badge);
    }

    // Address
    if (adresse) {
      const addrRow = document.createElement("div");
      Object.assign(addrRow.style, {
        display: "flex", alignItems: "flex-start", gap: "4px", marginTop: "5px",
      });
      addrRow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      const addrSpan = document.createElement("span");
      Object.assign(addrSpan.style, {
        fontSize: "11px", color: "#64748b", lineHeight: "1.3",
      });
      addrSpan.textContent = adresse;
      addrRow.appendChild(addrSpan);
      textBlock.appendChild(addrRow);
    }

    // Distance + time
    if (distText && timeEst) {
      const separator = document.createElement("div");
      Object.assign(separator.style, {
        height: "1px", background: "#f1f5f9", margin: "6px 0 5px",
      });
      textBlock.appendChild(separator);

      const metricsRow = document.createElement("div");
      Object.assign(metricsRow.style, {
        display: "flex", alignItems: "center", gap: "8px",
      });

      // Distance badge
      const distBadge = document.createElement("span");
      Object.assign(distBadge.style, {
        fontSize: "11px", fontWeight: "700", color: colors.text,
        background: colors.bg, padding: "1px 6px", borderRadius: "999px",
      });
      distBadge.textContent = `↗ ${distText}`;
      metricsRow.appendChild(distBadge);

      // Walk time
      const walkSpan = document.createElement("span");
      Object.assign(walkSpan.style, {
        fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px",
      });
      walkSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="m12 10-2 5"/></svg>${timeEst.walk} min`;
      metricsRow.appendChild(walkSpan);

      // Car time
      const carSpan = document.createElement("span");
      Object.assign(carSpan.style, {
        fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px",
      });
      carSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>${timeEst.car} min`;
      metricsRow.appendChild(carSpan);

      textBlock.appendChild(metricsRow);
    }

    header.appendChild(textBlock);
    root.appendChild(header);
  } else {
    // Bien (home) popup
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", alignItems: "center", gap: "8px" });

    const pinBox = document.createElement("div");
    Object.assign(pinBox.style, {
      width: "34px", height: "34px", borderRadius: "10px",
      background: "#FEF3C7", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: "0",
    });
    pinBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A843" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
    row.appendChild(pinBox);

    const col = document.createElement("div");
    const pTitle = document.createElement("p");
    Object.assign(pTitle.style, {
      margin: "0", fontSize: "13px", fontWeight: "700", color: "#0C1A35",
    });
    pTitle.textContent = title;
    col.appendChild(pTitle);

    const pSub = document.createElement("p");
    Object.assign(pSub.style, { margin: "2px 0 0", fontSize: "11px", color: "#D4A843", fontWeight: "600" });
    pSub.textContent = "Vous êtes ici";
    col.appendChild(pSub);

    row.appendChild(col);
    root.appendChild(row);
  }

  return root;
}

function attachPopupInteractions(marker: L.Marker) {
  marker.on("mouseover", () => marker.openPopup());
  marker.on("mouseout", () => marker.closePopup());
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  latitude: number;
  longitude: number;
  titreBien?: string | null;
  etablissements?: Etablissement[];
  onOverpassLoaded?: (etabs: Etablissement[]) => void;
}

export default function CarteBienDetail({
  latitude,
  longitude,
  titreBien,
  etablissements = [],
  onOverpassLoaded,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const layerRef     = useRef<LayerGroup | null>(null);

  const [overpassEtabs,   setOverpassEtabs]   = useState<Etablissement[]>([]);
  const [overpassLoading, setOverpassLoading] = useState(false);

  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

  // DB établissements take priority; Overpass fills in when none exist in DB
  const allEtabs = useMemo(
    () => (etablissements.length > 0 ? etablissements : overpassEtabs),
    [etablissements, overpassEtabs]
  );
  const validEtabs = useMemo(
    () => allEtabs.filter((e) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude)),
    [allEtabs]
  );

  // Auto-fetch from Overpass when no DB établissements
  useEffect(() => {
    if (!hasCoords || etablissements.length > 0) return;
    let cancelled = false;
    setOverpassLoading(true);
    fetchOverpassEtabs(latitude, longitude)
      .then((etabs) => {
        if (!cancelled) {
          setOverpassEtabs(etabs);
          onOverpassLoaded?.(etabs);
        }
      })
      .catch(() => { /* silent - Overpass is best-effort */ })
      .finally(() => { if (!cancelled) setOverpassLoading(false); });
    return () => { cancelled = true; };
  }, [hasCoords, latitude, longitude, etablissements.length]);

  // Init Leaflet map (runs once)
  useEffect(() => {
    if (!hasCoords || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 12,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layerRef.current  = L.layerGroup().addTo(map);
    mapRef.current    = map;
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [hasCoords, latitude, longitude]);

  // Refresh markers whenever data changes
  useEffect(() => {
    if (!hasCoords || !mapRef.current || !layerRef.current) return;

    mapRef.current.setView([latitude, longitude], 15);
    layerRef.current.clearLayers();

    // Bien (red)
    const bienMarker = L.marker([latitude, longitude], { icon: BIEN_ICON }).addTo(layerRef.current);
    bienMarker.bindPopup(createPopupNode(titreBien ?? "Ce bien"));
    attachPopupInteractions(bienMarker);

    // Établissements
    validEtabs.forEach((e) => {
      const m = L.marker([e.latitude, e.longitude], {
        icon: makeEtablissementIcon(e.type),
      }).addTo(layerRef.current!);
      const subtitle = ETABLISSEMENT_LABELS[e.type] ?? e.type.replace(/_/g, " ");
      const title    = e.nom || ETABLISSEMENT_LABELS[e.type] || e.type;
      m.bindPopup(createPopupNode(title, subtitle, e.distance, e.type, e.adresse));
      attachPopupInteractions(m);
    });
  }, [hasCoords, latitude, longitude, titreBien, validEtabs]);

  if (!hasCoords) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[380px] grid place-items-center bg-slate-50 text-slate-500 text-sm px-4 text-center">
        Coordonnées GPS invalides pour afficher la carte.
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm isolate"
      style={{ height: 380 }}
    >
      <div ref={containerRef} className="h-full w-full" />

      {/* Overpass loading spinner */}
      {overpassLoading && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-slate-600 px-3 py-1.5 rounded-full shadow flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
          Recherche des établissements…
        </div>
      )}

      {/* Badge: Overpass result count (only when no DB data) */}
      {!overpassLoading && overpassEtabs.length > 0 && etablissements.length === 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-slate-500 px-3 py-1.5 rounded-full shadow">
          {overpassEtabs.length} établissement{overpassEtabs.length > 1 ? "s" : ""} à proximité
        </div>
      )}
    </div>
  );
}
