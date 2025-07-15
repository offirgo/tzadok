import {useEffect, useRef, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {getCurrentLocation} from '../utils/geolocation';

function BusMap({reports = []}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null); // Add this line

    // get and show user location
    // useEffect(() => {
    //     if (!mapInstanceRef.current) return;
    //
    //     const getUserLocation = async () => {
    //         try {
    //             const location = await getCurrentLocation();
    //             setUserLocation(location);
    //         } catch (error) {
    //             console.log('Could not get user location:', error.message);
    //         }
    //     };
    //
    //     getUserLocation();
    // }, []);

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
                // Location not available, keep default Tel Aviv center
                console.log('Location not available on load:', error.message);
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
            <h4 style="margin: 0 0 8px 0; color: #dc2626;">🚌 צדוק הצדיק בשטח!</h4>
            <p style="margin: 4px 0;"><strong>אוטובוס:</strong> ${report.busNumber}</p>
            <p style="margin: 4px 0;"><strong>כיוון:</strong> ${report.direction}</p>
            <p style="margin: 4px 0; color: #666;"><strong>לפני:</strong> ${minutesAgo} דקות</p>
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
    return (
        <div style={{position: 'relative'}}>
            {/* Map container */}
            <div
                ref={mapRef}
                style={{
                    height: '100%',                   // was '300px'
                    minHeight: 'calc(100vh - 200px)', // fallback
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
                    bottom: '100px',
                    right: '20px',
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    width: '44px',
                    height: '44px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="מיקום שלי"
            >

                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="2"/>
                    <path
                        d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                    <path d="M11,1V3A1,1 0 0,0 13,3V1A1,1 0 0,0 11,1Z"/>
                    <path d="M1,11V13A1,1 0 0,0 3,13V11A1,1 0 0,0 1,11Z"/>
                    <path d="M21,11V13A1,1 0 0,0 23,13V11A1,1 0 0,0 21,11Z"/>
                    <path d="M11,21V23A1,1 0 0,0 13,23V21A1,1 0 0,0 11,21Z"/>
                </svg>
            </button>
        </div>
    );
}

export default BusMap;