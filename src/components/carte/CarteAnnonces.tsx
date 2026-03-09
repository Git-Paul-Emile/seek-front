import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import type { Bien } from "@/api/bien";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PROMOTED_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DEFAULT_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF" }).format(price);

// ─── Clustering ───────────────────────────────────────────────────────────────

type BienWithCoords = Bien & { latitude: number; longitude: number };

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  biens: BienWithCoords[];
}

/**
 * Grid-based clustering.
 * - zoom < 11  → 0.1° cells  (~11 km)
 * - zoom 11-12 → 0.02° cells (~2 km)
 * - zoom >= 13 → individual markers
 */
function buildClusters(items: BienWithCoords[], zoom: number): Cluster[] {
  const step = zoom < 11 ? 0.1 : zoom < 13 ? 0.02 : 0;

  if (step === 0) {
    return items.map((b) => ({ lat: b.latitude, lng: b.longitude, count: 1, biens: [b] }));
  }

  const grid: Record<string, Cluster> = {};
  for (const b of items) {
    const key = `${Math.floor(b.latitude / step)}_${Math.floor(b.longitude / step)}`;
    if (!grid[key]) grid[key] = { lat: 0, lng: 0, count: 0, biens: [] };
    grid[key].biens.push(b);
    grid[key].count++;
  }

  return Object.values(grid).map((c) => ({
    ...c,
    lat: c.biens.reduce((s, b) => s + b.latitude, 0) / c.count,
    lng: c.biens.reduce((s, b) => s + b.longitude, 0) / c.count,
  }));
}

function makeClusterIcon(count: number) {
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;
  const bg   = count < 10 ? "#0C1A35" : count < 50 ? "#D4A843" : "#e53e3e";
  const fs   = count < 100 ? 13 : 11;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${fs}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      cursor:pointer;
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── BoundsFitter ─────────────────────────────────────────────────────────────

function BoundsFitter({ items }: { items: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (items.length === 0) return;
    if (items.length === 1) { map.setView([items[0].lat, items[0].lng], 14); return; }
    map.fitBounds(L.latLngBounds(items.map((i) => [i.lat, i.lng])), { padding: [40, 40] });
  }, [items, map]);
  return null;
}

// ─── ClusteredMarkers ─────────────────────────────────────────────────────────

function ClusteredMarkers({ items }: { items: BienWithCoords[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => { map.off("zoomend", onZoom); };
  }, [map]);

  const clusters = useMemo(() => buildClusters(items, zoom), [items, zoom]);

  return (
    <>
      {clusters.map((cluster, i) => {
        // Individual marker
        if (cluster.count === 1) {
          const bien = cluster.biens[0];
          return (
            <Marker
              key={bien.id}
              position={[cluster.lat, cluster.lng]}
              icon={bien.estMisEnAvant ? PROMOTED_ICON : DEFAULT_ICON}
            >
              <Popup minWidth={220} maxWidth={260}>
                <div className="text-sm">
                  {bien.photos?.[0] && (
                    <img
                      src={bien.photos[0]}
                      alt={bien.titre ?? ""}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="font-semibold text-[#0C1A35] line-clamp-2 leading-tight mb-1">
                    {bien.titre ?? "Annonce"}
                  </p>
                  {bien.prix !== null && (
                    <p className="text-[#D4A843] font-bold text-base mb-1">
                      {formatPrice(bien.prix)}
                    </p>
                  )}
                  {(bien.quartier || bien.ville) && (
                    <p className="text-xs text-slate-400 mb-2">
                      {bien.quartier && <span>{bien.quartier}</span>}
                      {bien.quartier && bien.ville && <span>, </span>}
                      {[bien.ville, bien.region, bien.pays].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <Link
                    to={`/annonce/${bien.id}`}
                    className="block text-center text-xs font-medium bg-[#0C1A35] text-white rounded-lg py-1.5 hover:bg-[#1A2942] transition-colors"
                  >
                    Voir l'annonce
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        }

        // Cluster bubble — click zooms in
        return (
          <Marker
            key={`cluster-${i}-z${zoom}`}
            position={[cluster.lat, cluster.lng]}
            icon={makeClusterIcon(cluster.count)}
            eventHandlers={{
              click: () => map.setView([cluster.lat, cluster.lng], map.getZoom() + 2),
            }}
          />
        );
      })}
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface Props {
  items: Bien[];
}

export default function CarteAnnonces({ items }: Props) {
  const withCoords = items.filter(
    (b): b is BienWithCoords => b.latitude !== null && b.longitude !== null
  );

  const boundItems = withCoords.map((b) => ({ lat: b.latitude, lng: b.longitude }));
  const defaultCenter: [number, number] = [14.6928, -17.4467]; // Dakar

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 520 }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsFitter items={boundItems} />
          <ClusteredMarkers items={withCoords} />
        </MapContainer>
      </div>
      {withCoords.length < items.length && (
        <div className="px-4 py-2 mt-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          {items.length - withCoords.length} annonce(s) sans coordonnées GPS ne sont pas affichées sur la carte.
        </div>
      )}
    </div>
  );
}
