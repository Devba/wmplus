import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddressMap.css';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER = [32.7767, -79.9309];
const NOMINATIM =
  'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=';

function FitBounds({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [position, map]);
  return null;
}

async function geocode(address) {
  const clean = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' + ');

  if (!clean) return null;

  const url = NOMINATIM + encodeURIComponent(clean);
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.length) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

function AddressMap({ address, city, state, zip, width = '100%' }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const full = [address, city, state, zip]
      .filter(Boolean)
      .join(', ');

    if (!full) {
      setPosition(null);
      setError(true);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await geocode(full);
      if (active) {
        setLoading(false);
        if (result) {
          setPosition(result);
          setError(false);
        } else {
          setPosition(null);
          setError(true);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [address, city, state, zip]);

  return (
    <div className="address-map" style={{ width }}>
      <div className="address-map-header">
        <span>📍 Ubicación</span>
        {loading && <span className="address-map-status">Buscando dirección...</span>}
        {error && !loading && (
          <span className="address-map-status address-map-error">
            No se pudo geolocalizar la dirección
          </span>
        )}
      </div>
      <div className="address-map-body">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds position={position} />
          {position && (
            <Marker position={position}>
              <Popup>
                {[address, city, state, zip]
                  .filter(Boolean)
                  .join(', ')}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default AddressMap;
