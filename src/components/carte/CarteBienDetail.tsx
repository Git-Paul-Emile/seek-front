import { useEffect, useRef } from "react";
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
  marche: "Marche",
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

interface Props {
  latitude: number;
  longitude: number;
  titreBien?: string | null;
  etablissements?: Etablissement[];
}

function createPopupNode(title: string, subtitle?: string, distance?: number | null) {
  const root = document.createElement("div");
  root.className = "text-sm";

  const pTitle = document.createElement("p");
  pTitle.className = "font-medium text-[#0C1A35]";
  pTitle.textContent = title;
  root.appendChild(pTitle);

  if (subtitle) {
    const pSubtitle = document.createElement("p");
    pSubtitle.className = "text-xs text-[#D4A843] mt-0.5";
    pSubtitle.textContent = subtitle;
    root.appendChild(pSubtitle);
  }

  if (typeof distance === "number" && Number.isFinite(distance) && distance > 0) {
    const pDistance = document.createElement("p");
    pDistance.className = "text-xs text-slate-400 mt-0.5";
    pDistance.textContent = distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`;
    root.appendChild(pDistance);
  }

  return root;
}

function attachPopupInteractions(marker: L.Marker) {
  marker.on("mouseover", () => marker.openPopup());
  marker.on("mouseout", () => marker.closePopup());
}

export default function CarteBienDetail({ latitude, longitude, titreBien, etablissements = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  const hasValidCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const validEtablissements = etablissements.filter(
    (e) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude),
  );

  useEffect(() => {
    if (!hasValidCoordinates || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Keep this map responsive when rendered inside tab panels.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [hasValidCoordinates, latitude, longitude]);

  useEffect(() => {
    if (!hasValidCoordinates || !mapRef.current || !markersLayerRef.current) return;

    mapRef.current.setView([latitude, longitude], 15);
    markersLayerRef.current.clearLayers();

    const bienMarker = L.marker([latitude, longitude], { icon: BIEN_ICON }).addTo(markersLayerRef.current);
    bienMarker.bindPopup(createPopupNode(titreBien ?? "Ce bien"));
    attachPopupInteractions(bienMarker);

    validEtablissements.forEach((e) => {
      const marker = L.marker([e.latitude, e.longitude], {
        icon: makeEtablissementIcon(e.type),
      }).addTo(markersLayerRef.current!);

      const subtitle = ETABLISSEMENT_LABELS[e.type] ?? e.type.replace(/_/g, " ");
      const title = e.nom || ETABLISSEMENT_LABELS[e.type] || e.type;
      marker.bindPopup(createPopupNode(title, subtitle, e.distance));
      attachPopupInteractions(marker);
    });
  }, [hasValidCoordinates, latitude, longitude, titreBien, validEtablissements]);

  if (!hasValidCoordinates) {
    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[380px] grid place-items-center bg-slate-50 text-slate-500 text-sm px-4 text-center">
        Coordonnées GPS invalides pour afficher la carte.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 380 }}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
