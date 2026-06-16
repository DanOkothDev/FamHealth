import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import AivanaChat from "../components/AivanaChat";
import Spinner from "../components/Spinner";
import API from "../api";

/* ─── map re-center helper ─────────────────────────────────────────── */
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

/* ─── custom map icons ──────────────────────────────────────────────── */
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

/* ─── haversine distance ────────────────────────────────────────────── */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

/* ─── styles ────────────────────────────────────────────────────────── */
const styles = `
  .ep-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #f5f5f3;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  /* ── topbar ── */
  .ep-topbar {
    position: sticky;
    top: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 1.5rem;
    height: 56px;
    background: #ffffff;
    border-bottom: 1px solid #e8e8e6;
  }
  .ep-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ep-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 3px 9px;
    border-radius: 100px;
  }
  .ep-title {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
  }
  .ep-divider-v {
    width: 1px;
    height: 18px;
    background: #e8e8e6;
  }

  /* ── SOS button ── */
  .ep-sos-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 18px;
    height: 36px;
    background: #fff;
    color: #b91c1c;
    border: 1.5px solid #fca5a5;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .ep-sos-btn:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #f87171;
  }
  .ep-sos-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .ep-sos-pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b91c1c;
    animation: ep-pulse 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes ep-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.75); }
  }

  /* ── feedback banners ── */
  .ep-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    margin: 12px 1.5rem 0;
  }
  .ep-banner-icon {
    font-size: 15px;
    flex-shrink: 0;
  }
  .ep-banner.success {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }
  .ep-banner.error {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  /* ── spinner wrapper ── */
  .ep-spinner-wrap {
    padding: 12px 1.5rem 0;
  }

  /* ── main content grid ── */
  .ep-content {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1rem;
    padding: 1rem 1.5rem 1.5rem;
    flex: 1;
    align-items: start;
  }

  /* ── map panel ── */
  .ep-map-panel {
    background: #fff;
    border: 1px solid #e8e8e6;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .ep-map-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid #e8e8e6;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ep-map-bar-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
  }
  .ep-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    animation: ep-pulse 1.8s ease-in-out infinite;
  }
  .ep-legend {
    display: flex;
    gap: 14px;
  }
  .ep-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #9ca3af;
  }
  .ep-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .ep-legend-dot.you { background: #3b82f6; }
  .ep-legend-dot.hosp { background: #ef4444; }
  .ep-map-inner {
    height: 480px;
    position: relative;
  }
  .ep-map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #fafaf9;
    color: #9ca3af;
    font-size: 13px;
  }
  .ep-map-empty svg {
    opacity: 0.35;
  }

  /* ── sidebar ── */
  .ep-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── location card ── */
  .ep-location-card {
    background: #fff;
    border: 1px solid #e8e8e6;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ep-location-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #3b82f6;
    flex-shrink: 0;
    box-shadow: 0 0 0 3px #dbeafe;
  }
  .ep-location-main {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
  }
  .ep-location-sub {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
  }

  /* ── hospital list ── */
  .ep-list-card {
    background: #fff;
    border: 1px solid #e8e8e6;
    border-radius: 12px;
    overflow: hidden;
    flex: 1;
  }
  .ep-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid #f0f0ee;
  }
  .ep-list-header h2 {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  .ep-list-count {
    font-size: 11px;
    color: #9ca3af;
    background: #f5f5f3;
    border-radius: 100px;
    padding: 2px 9px;
  }
  .ep-hospital-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 11px 14px;
    border-bottom: 1px solid #f5f5f3;
    transition: background 0.12s;
    cursor: default;
  }
  .ep-hospital-item:last-child {
    border-bottom: none;
  }
  .ep-hospital-item:hover {
    background: #fafaf9;
  }
  .ep-rank {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid #e8e8e6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    color: #9ca3af;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .ep-rank.top {
    border-color: #fca5a5;
    color: #b91c1c;
    background: #fef2f2;
  }
  .ep-hosp-info {
    flex: 1;
    min-width: 0;
  }
  .ep-hosp-name {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ep-hosp-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .ep-hosp-dist {
    font-size: 11px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .ep-tag {
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 100px;
    background: #f5f5f3;
    color: #6b7280;
    border: 1px solid #e8e8e6;
  }
  .ep-hosp-actions {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }
  .ep-action-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid #e8e8e6;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    font-size: 14px;
  }
  .ep-action-btn:hover {
    background: #f5f5f3;
    color: #1a1a1a;
  }
  .ep-action-btn.danger {
    border-color: #fca5a5;
    color: #b91c1c;
  }
  .ep-action-btn.danger:hover {
    background: #fef2f2;
    border-color: #f87171;
  }

  /* ── map popup overrides ── */
  .ep-popup h4 {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px;
  }
  .ep-popup p {
    font-size: 12px;
    color: #6b7280;
    margin: 0 0 8px;
  }
  .ep-popup-actions {
    display: flex;
    gap: 6px;
  }
  .ep-popup-link {
    font-size: 12px;
    color: #2563eb;
    text-decoration: none;
    padding: 4px 10px;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    background: #eff6ff;
    font-weight: 500;
  }
  .ep-popup-link:hover { background: #dbeafe; }
  .ep-popup-sos {
    font-size: 12px;
    color: #b91c1c;
    padding: 4px 10px;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    background: #fef2f2;
    font-weight: 600;
    cursor: pointer;
  }
  .ep-popup-sos:hover { background: #fee2e2; }

  /* ── responsive ── */
  @media (max-width: 768px) {
    .ep-content {
      grid-template-columns: 1fr;
      padding: 0.75rem 0.75rem 1.5rem;
      gap: 0.75rem;
    }
    .ep-sidebar {
      order: -1;
    }
    .ep-list-card {
      max-height: 280px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    .ep-map-inner {
      height: 300px;
    }
    .ep-topbar {
      padding: 0 1rem;
      height: 52px;
    }
    .ep-title {
      font-size: 14px;
    }
    .ep-banner {
      margin: 10px 0.75rem 0;
    }
    .ep-spinner-wrap {
      padding: 10px 0.75rem 0;
    }
  }

  @media (max-width: 480px) {
    .ep-sos-btn {
      padding: 0 12px;
      font-size: 12px;
    }
    .ep-eyebrow {
      display: none;
    }
    .ep-divider-v {
      display: none;
    }
  }
`;

/* ─── SVG icons (inline, no external deps) ─────────────────────────── */
function IconRoute() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5c.4 0 .9-.2 1.2-.5l3.3-3.3a1.7 1.7 0 0 0 0-2.4l-6.8-6.8a1.7 1.7 0 0 0-2.4 0l-3.3 3.3c-.3.3-.5.8-.5 1.2V19"/><path d="M21 15H18"/><circle cx="6" cy="5" r="3"/>
    </svg>
  );
}
function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconSos() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

/* ─── component ─────────────────────────────────────────────────────── */
export default function EmergencyPage() {
  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosSending, setSosSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  /* get precise position */
  useEffect(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setPosition([latitude, longitude]);
        fetchHospitals(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setError("Unable to get your precise location. Please enable GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  /* fetch nearby hospitals via Overpass */
  const fetchHospitals = async (lat, lon) => {
    try {
      setLoading(true);
      const radius = 6000;
      const query = `
        [out:json][timeout:30];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          relation["amenity"="hospital"](around:${radius},${lat},${lon});
        );
        out center qt;
      `;

      const servers = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.openstreetmap.fr/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
      ];

      let elements = [];
      let lastError = null;

      for (const server of servers) {
        try {
          const url = `${server}?data=${encodeURIComponent(query)}`;
          const res = await axios.get(url, { timeout: 30000 });
          elements = res.data.elements || [];
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Overpass fetch failed on ${server}:`, err?.message || err);
        }
      }

      if (!elements.length && lastError) {
        throw lastError;
      }

      const mapped = elements
        .map((el) => ({
          id: el.id,
          name: el.tags?.name || "Unnamed hospital",
          lat: el.lat ?? el.center?.lat,
          lon: el.lon ?? el.center?.lon,
          tags: el.tags || {},
        }))
        .filter((h) => h.lat && h.lon)
        .map((h) => ({
          ...h,
          distanceKm: haversineDistance(lat, lon, h.lat, h.lon),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setHospitals(mapped);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      setError("Failed to fetch nearby hospitals. The map query timed out or the server is busy. Please reload or try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* send SOS */
  const sendSOS = async (targetHospital = null) => {
    if (!position) {
      alert("Cannot determine your location.");
      return;
    }
    if (!window.confirm("Send SOS to your emergency contacts and nearest hospital?")) return;

    setSosSending(true);
    setMsg(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        location: { lat: position[0], lon: position[1] },
        hospitals: hospitals.slice(0, 5),
        targetHospital,
        note: "Emergency SOS sent from FamHealth app",
      };
      const res = await API.post("/emergency/sos", payload, config);
      setMsg(res.data.message || "SOS sent successfully.");
    } catch (err) {
      console.error("SOS error:", err);
      setError(err.response?.data?.message || "Failed to send SOS. Please try again.");
    } finally {
      setSosSending(false);
    }
  };

  /* directions URL */
  const directionsUrl = (h) =>
    `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`;

  /* optional tags to surface */
  const hospitalTag = (h) => {
    if (h.tags?.emergency === "yes") return "A&E";
    if (h.tags?.speciality) return h.tags.speciality;
    if (h.tags?.healthcare === "hospital") return "General";
    return null;
  };

  return (
    <>
      {/* inject styles */}
      <style>{styles}</style>

      <Navbar />

      <div className="ep-root">

        {/* ── topbar ── */}
        <header className="ep-topbar">
          <div className="ep-topbar-left">
            <span className="ep-eyebrow">Emergency</span>
            <div className="ep-divider-v" />
            <h1 className="ep-title">Nearby hospitals</h1>
          </div>

          <button
            className="ep-sos-btn"
            onClick={() => sendSOS(hospitals[0] ?? null)}
            disabled={sosSending || !position}
            aria-label="Send SOS to nearest hospital and emergency contacts"
          >
            <span className="ep-sos-pulse" aria-hidden="true" />
            {sosSending ? "Sending SOS…" : "Send SOS"}
          </button>
        </header>

        {/* ── feedback banners ── */}
        {loading && (
          <div className="ep-spinner-wrap">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="ep-banner error" role="alert">
            <span className="ep-banner-icon"><IconAlert /></span>
            {error}
          </div>
        )}
        {msg && (
          <div className="ep-banner success" role="status">
            <span className="ep-banner-icon"><IconCheck /></span>
            {msg}
          </div>
        )}

        {/* ── main content ── */}
        <main className="ep-content">

          {/* ── map ── */}
          <div className="ep-map-panel">
            <div className="ep-map-bar">
              <div className="ep-map-bar-label">
                <span className="ep-live-dot" aria-hidden="true" />
                Live map
              </div>
              <div className="ep-legend" aria-label="Map legend">
                <div className="ep-legend-item">
                  <span className="ep-legend-dot you" />
                  Your location
                </div>
                <div className="ep-legend-item">
                  <span className="ep-legend-dot hosp" />
                  Hospital
                </div>
              </div>
            </div>

            <div className="ep-map-inner">
              {position ? (
                <MapContainer
                  center={position}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(map) => (mapRef.current = map)}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Recenter position={position} />

                  {/* user marker */}
                  <Marker position={position} icon={userIcon}>
                    <Popup>
                      <div className="ep-popup">
                        <h4>Your location</h4>
                        <p>
                          {position[0].toFixed(5)}, {position[1].toFixed(5)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* hospital markers */}
                  {hospitals.map((h) => (
                    <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
                      <Popup>
                        <div className="ep-popup">
                          <h4>{h.name}</h4>
                          <p>{h.distanceKm} km away</p>
                          <div className="ep-popup-actions">
                            <a
                              className="ep-popup-link"
                              href={directionsUrl(h)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Directions
                            </a>
                            <button
                              className="ep-popup-sos"
                              onClick={() => sendSOS(h)}
                              disabled={sosSending}
                            >
                              Send SOS
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="ep-map-empty" aria-label="Map loading">
                  <IconMapPin />
                  <span>Waiting for location access</span>
                </div>
              )}
            </div>
          </div>

          {/* ── sidebar ── */}
          <aside className="ep-sidebar">

            {/* location status card */}
            <div className="ep-location-card">
              <span className="ep-location-dot" aria-hidden="true" />
              <div>
                <div className="ep-location-main">
                  {position
                    ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`
                    : "Locating…"}
                </div>
                <div className="ep-location-sub">
                  {position ? "GPS lock acquired" : "Waiting for GPS signal"}
                </div>
              </div>
            </div>

            {/* hospital list */}
            <div className="ep-list-card">
              <div className="ep-list-header">
                <h2>Nearest hospitals</h2>
                {hospitals.length > 0 && (
                  <span className="ep-list-count">{hospitals.length} found</span>
                )}
              </div>

              {hospitals.length === 0 && !loading ? (
                <div
                  style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#9ca3af",
                  }}
                >
                  No hospitals found within 8 km.
                </div>
              ) : (
                hospitals.map((h, idx) => {
                  const tag = hospitalTag(h);
                  return (
                    <div className="ep-hospital-item" key={h.id}>
                      <div
                        className={`ep-rank${idx === 0 ? " top" : ""}`}
                        aria-label={`Rank ${idx + 1}`}
                      >
                        {idx + 1}
                      </div>

                      <div className="ep-hosp-info">
                        <div className="ep-hosp-name" title={h.name}>
                          {h.name}
                        </div>
                        <div className="ep-hosp-meta">
                          <span className="ep-hosp-dist">
                            <IconRoute />
                            {h.distanceKm} km
                          </span>
                          {tag && <span className="ep-tag">{tag}</span>}
                        </div>
                      </div>

                      <div className="ep-hosp-actions">
                        <a
                          href={directionsUrl(h)}
                          target="_blank"
                          rel="noreferrer"
                          className="ep-action-btn"
                          title={`Directions to ${h.name}`}
                          aria-label={`Get directions to ${h.name}`}
                          style={{ textDecoration: "none" }}
                        >
                          <IconExternalLink />
                        </a>
                        <button
                          className="ep-action-btn danger"
                          onClick={() => sendSOS(h)}
                          disabled={sosSending}
                          title={`Send SOS to ${h.name}`}
                          aria-label={`Send SOS to ${h.name}`}
                        >
                          <IconSos />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </aside>
        </main>
      </div>
    </>
  );
}