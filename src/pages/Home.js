import { useState } from 'react';
import Header from '../components/Header';
import BusMap from '../components/BusMap';
import BusReportForm from '../components/BusReportForm';
import { User } from '../entities/User';
import { Report } from '../entities/Report';
import { getCurrentLocation, isLocationAccurate } from '../utils/geolocation';


function Home() {
    const [isReportFormOpen, setIsReportFormOpen] = useState(false);
    const [reports, setReports] = useState(Report.getActiveReports());
    const [userLocation, setUserLocation] = useState(null);


    const handleOpenReportForm = async () => {
        try {
            // First check if user is logged in
            await User.me();

            // Get location - this is MANDATORY
            const location = await getCurrentLocation();
            console.log('Got location:', location); // Debug log

            // Check if location is accurate enough
            if (!isLocationAccurate(location)) {
                const proceed = window.confirm(
                    `דיוק המיקום נמוך (${Math.round(location.accuracy)} מטר). האם להמשיך בכל זאת?`
                );
                if (!proceed) return;
            }

            // Store location and open form
            setUserLocation(location);
            setIsReportFormOpen(true);

        } catch (error) {
            if (error.message.includes('Not logged in')) {
                alert('יש להתחבר כדי לדווח על צדוק תחבורתי');
            } else {
                // Location error with helpful instructions
                const retry = window.confirm(
                    `גישה למיקום נדרשת לדיווח.\n\n${error.message}\n\nאם אישרת כבר גישה למיקום:\n• נסה ללחוץ "אישור" לנסיון נוסף\n• או רענן את הדף (F5)\n\nהאם לנסות שוב?`
                );

                if (retry) {
                    // Try again
                    handleOpenReportForm();
                }
            }
        }
    };

    const handleCloseReportForm = () => {
        setIsReportFormOpen(false);
    };

    const handleSubmitReport = async (reportData) => {
        try {
            // Re-check location at submission time (mandatory!)
            const currentLocation = await getCurrentLocation();
            console.log('Location at submission:', currentLocation);

            // Check if location is accurate enough
            if (!isLocationAccurate(currentLocation)) {
                const proceed = window.confirm(
                    `דיוק המיקום נמוך (${Math.round(currentLocation.accuracy)} מטר). האם להמשיך בכל זאת?`
                );
                if (!proceed) return;
            }

            // Submit with current location
            const newReport = Report.addReport(reportData, currentLocation);
            setReports(Report.getActiveReports());
            console.log('New report with fresh location:', newReport);

        } catch (error) {
            alert(`גישה למיקום נדרשת לשליחת הדיווח.\n${error.message}\n\nהדיווח לא נשלח.`);
        }
    };

    return (
        <div>
            <Header />
            <main style={{ padding: '2rem' }}>
                <BusMap reports={reports} />
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={handleOpenReportForm}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        🚌 דווח על צדוק כאן
                    </button>
                </div>

                {reports.length > 0 && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <h3>דיווחים אחרונים:</h3>
                        {reports.slice(-3).map(report => (
                            <div key={report.id} style={{
                                backgroundColor: '#f3f4f6',
                                padding: '1rem',
                                margin: '0.5rem auto',
                                borderRadius: '4px',
                                maxWidth: '400px'
                            }}>
                                <p><strong>אוטובוס {report.busNumber}</strong> - {report.direction}</p>
                                <small>לפני {Math.floor((Date.now() - report.timestamp) / 60000)} דקות</small>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BusReportForm
                isOpen={isReportFormOpen}
                onClose={handleCloseReportForm}
                onSubmit={handleSubmitReport}
            />
        </div>
    );
}

export default Home;