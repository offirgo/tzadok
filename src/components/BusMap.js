import {useEffect, useRef, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {getCurrentLocation} from '../utils/geolocation';

function BusMap({reports = []}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null); // Add this line

    // Initialize map
    useEffect(() => {
        if (mapInstanceRef.current) return; // Map already exists

        // Create map centered on Tel Aviv
        const map = L.map(mapRef.current, {
            zoomControl: false // Remove + - buttons
        }).setView([32.0853, 34.7818], 12);
        // Add OpenStreetMap tiles (free!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Fix marker icons (Leaflet issue with bundlers)
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        mapInstanceRef.current = map;

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);
    // Auto-center on user location when map loads
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const centerOnUser = async () => {
            try {
                const location = await getCurrentLocation();
                setUserLocation(location); // Add this line
                mapInstanceRef.current.setView([location.lat, location.lng], 14);
            } catch (error) {
            }
        };

        centerOnUser();
    }, []);
    // Add markers for reports
    useEffect(() => {
        if (!mapInstanceRef.current || !Array.isArray(reports)) return;

        const map = mapInstanceRef.current;

        // Clear existing markers
        if (map.reportMarkers) {
            map.reportMarkers.forEach(marker => map.removeLayer(marker));
        }
        map.reportMarkers = [];

        // Add marker for each report (only if reports is a valid array)
        if (reports && reports.length > 0) {
            reports.forEach((report, index) => {
                const timeDiff = Date.now() - report.timestamp;
                const minutesAgo = Math.floor(timeDiff / 60000);

                // Check for nearby markers and add small offset
                let lat = report.location.lat;
                let lng = report.location.lng;

                const sameLocationCount = reports.slice(0, index).filter(prevReport => {
                    const latDiff = Math.abs(prevReport.location.lat - report.location.lat);
                    const lngDiff = Math.abs(prevReport.location.lng - report.location.lng);
                    return latDiff < 0.001 && lngDiff < 0.001;
                }).length;

                if (sameLocationCount > 0) {
                    const angle = (sameLocationCount * 60) * (Math.PI / 180);
                    const offset = 0.0001;
                    lat += Math.cos(angle) * offset;
                    lng += Math.sin(angle) * offset;
                }

                // Create the fading eye icon
                const eyeIcon = createEyeIcon(report.timestamp);

                const marker = L.marker([lat, lng], {icon: eyeIcon})
                    .addTo(map)
                    .bindPopup(`
        <div style="text-align: right; direction: rtl; min-width: 180px; padding: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #20B2AA; font-size: 26px; font-weight: bold;">הצד(ו)ק בשטח</h3>
            
            <div style="text-align: right; margin-bottom: 5px;">
                <span style="font-size: 20px; font-weight: bold;">קו: </span>
                <span style="font-size: 20px;">${report.busNumber}</span>
            </div>
            
            <div style="text-align: right; margin-bottom: 5px;">
                <span style="font-size: 20px; font-weight: bold;">כיוון: </span>
                <span style="font-size: 20px;">${report.direction}</span>
            </div>
            
            <div style="text-align: right;">
                <span style="font-size: 20px; font-weight: bold;">בשעה: </span>
                <span style="font-size: 20px;">${new Date(report.timestamp).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })} (לפני ${minutesAgo} דקות)</span>
            </div>
        </div>
    `);
                map.reportMarkers.push(marker);
            });
        }
    }, [reports]);

    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;

        const map = mapInstanceRef.current;

        // Remove existing user marker
        if (map.userMarker) {
            map.removeLayer(map.userMarker);
        }

        // Create custom circular marker for user location
        const customLocationIcon = L.divIcon({
            className: 'custom-location-marker',
            html: `<div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #20B2AA;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
    ">
        <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        "></div>
    </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });

// Add user location marker
        map.userMarker = L.marker([userLocation.lat, userLocation.lng], {icon: customLocationIcon})
            .addTo(map)
            .bindPopup(`
            <div style="text-align: right; direction: rtl; min-width: 150px;">
                <h4 style="margin: 0 0 8px 0; color: #2563eb;"> המיקום שלך</h4>
                <p style="margin: 4px 0; color: #666;">דיוק: ${Math.round(userLocation.accuracy)} מטר</p>
            </div>
        `);

    }, [userLocation]);

    const reportCount = reports.length;
    const handleCenterOnUser = async () => {
        try {
            const location = await getCurrentLocation();
            setUserLocation(location); // This will trigger the marker update

            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([location.lat, location.lng], 16);
            }
        } catch (error) {
            alert(`כדי להשתמש במיקום שלי, יש לאפשר גישה למיקום:\n${error.message}`);
        }
    };
    const createEyeIcon = (reportTimestamp) => {
        const now = Date.now();
        const timeElapsed = (now - reportTimestamp) / (1000 * 60); // minutes elapsed

        // Calculate opacity: 1.0 (just reported) to 0.2 (14 minutes old)
        const opacity = Math.max(0.2, 1.0 - (timeElapsed / 14) * 0.8);

        return L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" width="35" height="35">
                <!-- White outer circle -->
                <circle cx="17.5" cy="17.5" r="16" fill="white" opacity="${opacity}"/>
                
                <!-- Red background -->
                <circle cx="17.5" cy="17.5" r="14" fill="#c0392b" opacity="${opacity}"/>
                
                <!-- Eye shape (white) -->
                <ellipse cx="17.5" cy="17.5" rx="10" ry="5" fill="white" opacity="${opacity}"/>
                
                <!-- Pupil (red) -->
                <circle cx="17.5" cy="17.5" r="3" fill="#c0392b" opacity="${opacity}"/>
                
                <!-- Small white highlight -->
                <circle cx="18.5" cy="16.5" r="0.8" fill="white" opacity="${opacity}"/>
            </svg>
        `),
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5],
            popupAnchor: [0, -17.5],
        });
    };
    return (
        <div style={{
            position: 'relative',
            height: 'calc(100vh - 180px)',
            width: '100%',
        }}>
            {/* Map container */}
            <div
                ref={mapRef}
                style={{
                    height: '100%',
                    width: '100%'
                }}
            />

            {/* Map status overlay - horizontally centered at top when no reports */}
            {reportCount !== 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '8px 4px',
                    fontSize: '14px',
                    width: '80%',
                    maxWidth: '400px',
                    fontWeight: 400,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    direction: 'rtl',
                    textAlign: 'center',
                    lineHeight: '1'
                }}>
                    הדיווחים על המפה הם מ-15 הדקות האחרונות
                </div>
            )}
            {/* My Location button */}
            <button
                onClick={handleCenterOnUser}
                style={{
                    position: 'fixed',  // was 'absolute'
                    bottom: '80px',
                    right: '-5px',
                    color: '#20B2AA',
                    border: 'none',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent'
                }}
                title="מיקום שלי"
            >

                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3"/>
                    {/* Changed from r="2" to r="3" */}
                    <path
                        d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                    <path d="M10,1V3A2,2 0 0,0 14,3V1A2,2 0 0,0 10,1Z"/>
                    {/* Wider paths */}
                    <path d="M1,10V14A2,2 0 0,0 3,14V10A2,2 0 0,0 1,10Z"/>
                    <path d="M21,10V14A2,2 0 0,0 23,14V10A2,2 0 0,0 21,10Z"/>
                    <path d="M10,21V23A2,2 0 0,0 14,23V21A2,2 0 0,0 10,21Z"/>
                </svg>
            </button>
        </div>
    );
}

export default BusMap;