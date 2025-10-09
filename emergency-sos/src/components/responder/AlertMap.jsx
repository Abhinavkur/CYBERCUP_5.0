import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const defaultCenter = [20.5937, 78.9629]; // India centroid as a neutral default
const defaultZoom = 5;

// Colored dot icons using DivIcon
function createDotIcon(color) {
  return L.divIcon({
    className: 'custom-dot-icon',
    html: `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const iconOpen = createDotIcon('#1976d2'); // blue
const iconClaimed = createDotIcon('#ed6c02'); // orange
const iconCluster = createDotIcon('#6d4c41'); // brown

function ZoomListener({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => onZoomChange?.(e.target.getZoom()),
  });
  return null;
}

export default function AlertMap({ openAlerts = [], claimedAlerts = [], height = 360 }) {
  const hasAny = (openAlerts?.length || 0) + (claimedAlerts?.length || 0) > 0;
  const first = hasAny ? (openAlerts[0] || claimedAlerts[0]) : null;
  const center = first?.location ? [first.location.lat, first.location.lng] : defaultCenter;
  const all = [...(openAlerts || []), ...(claimedAlerts || [])];

  // Simple cluster when zoomed-out
  let zoomLevelInitial = hasAny ? 12 : defaultZoom;
  const clusters = (items, zoom) => {
    if (zoom >= 10) return null; // no clustering
    const bucketSize = zoom >= 8 ? 0.25 : zoom >= 6 ? 0.5 : 1; // degrees
    const map = new Map();
    items.forEach((a) => {
      const lat = a.location?.lat;
      const lng = a.location?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      const key = `${Math.round(lat / bucketSize) * bucketSize}_${Math.round(lng / bucketSize) * bucketSize}`;
      const entry = map.get(key) || { lat, lng, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    });
    return Array.from(map.values());
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!hasAny && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No alerts to show on map.
        </Typography>
      )}
      <MapContainer center={center} zoom={zoomLevelInitial} style={{ height, width: '100%' }} scrollWheelZoom>
        <ZoomListener onZoomChange={() => { /* Map will re-render markers each render naturally */ }} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Simple clustering: when zoomed out (<10), render cluster markers */}
        {({}).constructor && (
          // trick to cause re-evaluation each render
          null
        )}
        {/* Individual markers */}
        {(openAlerts || []).map((a) => (
          <Marker key={`open_${a.id}`} position={[a.location?.lat, a.location?.lng]} icon={iconOpen}>
            <Popup>
              <strong>{(a.type || 'general').toUpperCase()}</strong><br />
              Status: {a.status}<br />
              {a.location?.lat?.toFixed?.(4)}, {a.location?.lng?.toFixed?.(4)}<br />
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${a.location?.lat},${a.location?.lng}`} target="_blank" rel="noreferrer">Directions</a>
            </Popup>
          </Marker>
        ))}
        {(claimedAlerts || []).map((a) => (
          <Marker key={`claimed_${a.id}`} position={[a.location?.lat, a.location?.lng]} icon={iconClaimed}>
            <Popup>
              <strong>{(a.type || 'general').toUpperCase()}</strong><br />
              Status: {a.status} (claimed)<br />
              {a.location?.lat?.toFixed?.(4)}, {a.location?.lng?.toFixed?.(4)}<br />
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${a.location?.lat},${a.location?.lng}`} target="_blank" rel="noreferrer">Directions</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}

