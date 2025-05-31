import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function BusMap({ reports = [] }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Initialize map
    useEffect(() => {
        if (mapInstanceRef.current) return; // Map already exists

        // Create map centered on Tel Aviv
        const map = L.map(mapRef.current).setView([32.0853, 34.7818], 12);

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

            const marker = L.marker([lat, lng], { icon: redIcon })
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

    return (
        <div style={{ position: 'relative' }}>
            {/* Map container */}
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                }}
            />

            {/* Report counter overlay */}
            {reportCount > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    🚨 {reportCount} דיווחים פעילים
                </div>
            )}
        </div>
    );
}

export default BusMap;