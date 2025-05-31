// Get user's current location
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'המשתמש דחה את הבקשה לגישה למיקום';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'מידע מיקום אינו זמין';
                        break;
                    case error.TIMEOUT:
                        message = 'הבקשה למיקום פגה';
                        break;
                    default:
                        message = 'שגיאה לא ידועה במיקום';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0 // Force fresh location check, no caching!
            }
        );
    });
}

// Check if location is accurate enough (within 100 meters)
export function isLocationAccurate(location) {
    return location.accuracy && location.accuracy <= 100;
}