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

function getEtablissementColor(type: string): string {
  if (["hopital", "pharmacie"].includes(type)) return "green";
  if (["ecole_maternelle", "ecole_primaire", "college", "lycee", "universite"].includes(type)) return "orange";
  if (["supermarche", "marche", "boulangerie"].includes(type)) return "violet";
  if (["mosquee", "eglise"].includes(type)) return "grey";
  if (["arret_bus", "station_brt", "route_principale"].includes(type)) return "yellow";
  return "blue";
}

function makeEtablissementIcon(type: string) {
  const color = getEtablissementColor(type);
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
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
  lat: number;
  lon: number;
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

async function fetchOverpassEtabs(lat: number, lng: number): Promise<Etablissement[]> {
  const query =
    `[out:json][timeout:25];` +
    `(node["amenity"~"^(hospital|clinic|pharmacy|school|college|university|marketplace|place_of_worship|bus_station|police|fire_station|townhall)$"](around:1500,${lat},${lng});` +
    `node["shop"~"^(supermarket|bakery)$"](around:1000,${lat},${lng});` +
    `);out body;`;
  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Overpass error");
  const data = await res.json();
  return (data.elements as OverpassElement[])
    .map((el) => {
      const type = overpassToType(el.tags ?? {});
      if (!type || !Number.isFinite(el.lat) || !Number.isFinite(el.lon)) return null;
      return {
        id: `overpass-${el.id}`,
        type,
        nom: el.tags?.name ?? null,
        latitude: el.lat,
        longitude: el.lon,
        distance: Math.round(haversineDist(lat, lng, el.lat, el.lon)),
      } as Etablissement;
    })
    .filter((e): e is Etablissement => e !== null);
}

// ─── Popup helpers ────────────────────────────────────────────────────────────

function createPopupNode(title: string, subtitle?: string, distance?: number | null) {
  const root = document.createElement("div");
  root.className = "text-sm";

  const pTitle = document.createElement("p");
  pTitle.className = "font-medium text-[#0C1A35]";
  pTitle.textContent = title;
  root.appendChild(pTitle);

  if (subtitle) {
    const pSub = document.createElement("p");
    pSub.className = "text-xs text-[#D4A843] mt-0.5";
    pSub.textContent = subtitle;
    root.appendChild(pSub);
  }

  if (typeof distance === "number" && Number.isFinite(distance) && distance > 0) {
    const pDist = document.createElement("p");
    pDist.className = "text-xs text-slate-400 mt-0.5";
    pDist.textContent = distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`;
    root.appendChild(pDist);
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
}

export default function CarteBienDetail({
  latitude,
  longitude,
  titreBien,
  etablissements = [],
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
      .then((etabs) => { if (!cancelled) setOverpassEtabs(etabs); })
      .catch(() => { /* silent — Overpass is best-effort */ })
      .finally(() => { if (!cancelled) setOverpassLoading(false); });
    return () => { cancelled = true; };
  }, [hasCoords, latitude, longitude, etablissements.length]);

  // Init Leaflet map (runs once)
  useEffect(() => {
    if (!hasCoords || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
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
      m.bindPopup(createPopupNode(title, subtitle, e.distance));
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
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
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
