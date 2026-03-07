import { useEffect } from "react";
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

// Fits map bounds to markers when items change
function BoundsFitter({ items }: { items: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (items.length === 0) return;
    if (items.length === 1) {
      map.setView([items[0].lat, items[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(items.map((i) => [i.lat, i.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [items, map]);
  return null;
}

interface Props {
  items: Bien[];
}

export default function CarteAnnonces({ items }: Props) {
  const withCoords = items.filter(
    (b): b is Bien & { latitude: number; longitude: number } =>
      b.latitude !== null && b.longitude !== null
  );

  const boundItems = withCoords.map((b) => ({ lat: b.latitude, lng: b.longitude }));

  // Default center: Dakar, Senegal
  const defaultCenter: [number, number] = [14.6928, -17.4467];

  return (
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
        {withCoords.map((bien) => (
          <Marker
            key={bien.id}
            position={[bien.latitude, bien.longitude]}
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
                    {[bien.quartier, bien.ville].filter(Boolean).join(", ")}
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
        ))}
      </MapContainer>
      {withCoords.length < items.length && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
          {items.length - withCoords.length} annonce(s) sans coordonnées GPS ne sont pas affichées sur la carte.
        </div>
      )}
    </div>
  );
}

