export const Report = {
    // Get all active reports (not expired)
    getActiveReports() {
        try {
            const storedReports = localStorage.getItem('busReports');
            if (!storedReports) return [];

            const allReports = JSON.parse(storedReports);
            const now = Date.now();
            const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

            // Filter out expired reports (older than 30 minutes)
            const activeReports = allReports.filter(
                report => (now - report.timestamp) < fifteenMinutes
            );

            // Update localStorage with only active reports
            localStorage.setItem('busReports', JSON.stringify(activeReports));

            return activeReports;
        } catch (error) {
            console.error('Error getting reports:', error);
            return [];
        }
    },

    // Add a new report
    addReport(reportData, userLocation) {
        try {
            const existingReports = this.getActiveReports();
            const newReport = {
                ...reportData,
                id: Date.now(),
                timestamp: Date.now(),
                location: userLocation || { lat: 32.0853, lng: 34.7818 } // Use real location or fallback to Tel Aviv
            };

            const updatedReports = [...existingReports, newReport];
            localStorage.setItem('busReports', JSON.stringify(updatedReports));

            return newReport;
        } catch (error) {
            console.error('Error adding report:', error);
            throw error;
        }
    },

    // Get reports count
    getActiveCount() {
        return this.getActiveReports().length;
    }
};