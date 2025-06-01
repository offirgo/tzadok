import {useEffect, useRef} from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {getCurrentLocation} from '../utils/geolocation';

function BusMap({reports = []}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

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
                mapInstanceRef.current.setView([location.lat, location.lng], 14);
            } catch (error) {
                // Location not available, keep default Tel Aviv center
                console.log('Location not available on load:', error.message);
            }
        };

        centerOnUser();
    }, [mapInstanceRef.current]);
    // Add markers for reports
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        // Clear existing markers (we'll store them on the map object)
        if (map.reportMarkers) {
            map.reportMarkers.forEach(marker => map.removeLayer(marker));
        }
        map.reportMarkers = [];

        // Add marker for each report with offset for overlapping locations
        reports.forEach((report, index) => {
            const timeDiff = Date.now() - report.timestamp;
            const minutesAgo = Math.floor(timeDiff / 60000);

            // Check for nearby markers and add small offset
            let lat = report.location.lat;
            let lng = report.location.lng;

            // Add tiny offset for overlapping markers (0.0001 degrees ≈ ~10 meters)
            const sameLocationReports = reports.slice(0, index).filter(prevReport => {
                const latDiff = Math.abs(prevReport.location.lat - report.location.lat);
                const lngDiff = Math.abs(prevReport.location.lng - report.location.lng);
                return latDiff < 0.0005 && lngDiff < 0.0005; // Within ~50 meters
            });

            if (sameLocationReports.length > 0) {
                const offsetIndex = sameLocationReports.length;
                lat += (offsetIndex * 0.0001 * (offsetIndex % 2 === 0 ? 1 : -1));
                lng += (offsetIndex * 0.0001 * (offsetIndex % 2 === 0 ? 1 : -1));
            }

            // Create RED pin marker (simple approach)
            const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([lat, lng], {icon: redIcon})
                .addTo(map)
                .bindPopup(`
          <div style="text-align: right; direction: rtl; min-width: 150px;">
                     <h4 style="margin: 0 0 8px 0; color: #dc2626;">🚌 צדוק בשטח!</h4>
            <p style="margin: 4px 0;"><strong>אוטובוס:</strong> ${report.busNumber}</p>
            <p style="margin: 4px 0;"><strong>כיוון:</strong> ${report.direction}</p>
            <p style="margin: 4px 0; color: #666;"><strong>לפני:</strong> ${minutesAgo} דקות</p>
          </div>
        `);

            map.reportMarkers.push(marker);
        });
    }, [reports]); // Run when reports change

    const reportCount = reports.length;
    const handleCenterOnUser = async () => {
        try {
            const location = await getCurrentLocation();

            if (mapInstanceRef.current) {
                // Just center the map, don't add markers
                mapInstanceRef.current.setView([location.lat, location.lng], 16);
            }
        } catch (error) {
            alert(`כדי להשתמש במיקום שלי, יש לאפשר גישה למיקום:\n${error.message}`);
        }
    };
    return (
        <div style={{position: 'relative'}}>
            {/* Map container */}
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                }}
            />

            {/* Map status overlay - horizontally centered at top when no reports */}
            {reportCount === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    width: '80%',
                    maxWidth: '400px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    direction: 'rtl',
                    textAlign: 'center',
                    lineHeight: '1'
                }}>
                    אין דיווחים עדיין<br/>
                    ספר לשרה ולכולם היכן ראית את צדוק
                </div>
            )}
            {/* My Location button */}
            <button
                onClick={handleCenterOnUser}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '10px',
                    backgroundColor: 'white',
                    color: '#4285f4',
                    border: '2px solid #4285f4',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="מיקום שלי"
            >
                🎯
            </button>
        </div>
    );
}

export default BusMap;