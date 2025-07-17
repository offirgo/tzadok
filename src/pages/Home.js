import {useEffect, useState} from 'react';
import Header from '../components/Header';
import BusMap from '../components/BusMap';
import BusReportForm from '../components/BusReportForm';
import {User} from '../entities/User';
import {Report} from '../entities/Report';
import {getCurrentLocation, isLocationAccurate} from '../utils/geolocation';
import AboutUs from "../components/AboutUs";


function Home() {
    const [isReportFormOpen, setIsReportFormOpen] = useState(false);
    const [reports, setReports] = useState([]); // Start with empty array
    const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);


// Load reports when component mounts
    useEffect(() => {
        const loadInitialReports = async () => {
            try {
                const initialReports = await Report.getActiveReports();
                setReports(initialReports || []); // Ensure it's always an array
            } catch (error) {
                console.error('Error loading initial reports:', error);
                setReports([]); // Fallback to empty array
            }
        };

        loadInitialReports();
    }, []);
// Auto-cleanup expired reports every minute
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const activeReports = Report.getActiveReports();
            setReports(activeReports); // This will trigger map update
        }, 60000); // Check every minute

        return () => clearInterval(cleanupInterval); // Cleanup on unmount
    }, []);
    // Auto-refresh reports from Firebase every 60 seconds
    useEffect(() => {
        const refreshReports = async () => {
            try {
                const freshReports = await Report.getActiveReports();
                setReports(freshReports || []); // Ensure it's always an array
            } catch (error) {
                console.error('Error refreshing reports:', error);
                // Don't update reports if there's an error
            }
        };

        const interval = setInterval(refreshReports, 15000);
        return () => clearInterval(interval);
    }, []);
    // Auto-open report form after login
    useEffect(() => {
        const shouldOpenReport = localStorage.getItem('open_report_after_login');
        if (shouldOpenReport) {
            localStorage.removeItem('open_report_after_login'); // Clear flag
            // Small delay to ensure everything is loaded
            setTimeout(() => {
                handleOpenReportForm();
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleOpenReportForm = async () => {
        try {
            // First check if user is logged in
            await User.me();

            // Get location - this is MANDATORY
            const location = await getCurrentLocation();

            // Check if location is accurate enough
            if (!isLocationAccurate(location)) {
                const proceed = window.confirm(
                    `דיוק המיקום נמוך (${Math.round(location.accuracy)} מטר). האם להמשיך בכל זאת?`
                );
                if (!proceed) return;
            }

            setIsReportFormOpen(true);

        } catch (error) {
            if (error.message.includes('Not logged in')) {
                // Trigger Google login
                User.login();
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

            // Check if location is accurate enough
            if (!isLocationAccurate(currentLocation)) {
                const proceed = window.confirm(
                    `דיוק המיקום נמוך (${Math.round(currentLocation.accuracy)} מטר). האם להמשיך בכל זאת?`
                );
                if (!proceed) return;
            }

            // Submit to Firebase
            await Report.addReport(reportData, currentLocation);

            // Refresh reports from Firebase
            const updatedReports = await Report.getActiveReports();
            setReports(updatedReports);

            console.log('Report saved to Firebase successfully!');

        } catch (error) {
            console.error('Error submitting report:', error);
            alert(`שגיאה בשליחת הדיווח: ${error.message}`);
        }
    };
    const handleOpenAboutUs = () => {
        setIsAboutUsOpen(true);
    };

    const handleCloseAboutUs = () => {
        console.log('Closing AboutUs!'); // Add this to test

        setIsAboutUsOpen(false);
    };
    const handleUserIconClick = async () => {
        try {
            // Check if user is logged in
            await User.me();
            // If we get here, user is logged in, so logout
            const confirmLogout = window.confirm('האם אתה בטוח שברצונך להתנתק?');
            if (confirmLogout) {
                User.logout();
            }
        } catch (error) {
            // User is not logged in, so login
            User.login();
        }
    };
    return (
        <div>
            {/* Content header - this will stay at top and not shrink */}
            <div className="content-header">
                <Header
                    onOpenAboutUs={handleOpenAboutUs}
                    onUserIconClick={handleUserIconClick}
                />

                {/* Yellow banner when no reports */}
                {reports.length === 0 && (
                    <div style={{
                        backgroundColor: '#FEF3C7',
                        padding: '12px 10px',
                        textAlign: 'center',
                        direction: 'rtl',
                        fontSize: '10px',
                        color: '#92400E',
                        borderBottom: '1px solid #FDE68A',
                        fontWeight: 'bold',
                        width: '100%'
                    }}>
                        אין דיווחים - או שהכל טוב ומירי רגב ויתרה לנו היום או שאף אחד לא דיווח
                    </div>
                )}
            </div>

            {/* Map container - this will take remaining space */}
            <div className="map-container">
                <BusMap reports={reports}/>
            </div>

            {/* Fixed button stays floating on top */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: 'calc(100% - 40px)',
                maxWidth: '400px',
            }}>
                <button
                    onClick={handleOpenReportForm}
                    style={{
                        width: '100%',
                        backgroundColor: '#20B2AA',
                        color: 'white',
                        paddingTop: '8px',
                        paddingBottom: '12px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '28px',
                        fontWeight: 700,
                        style: 'bold',
                        cursor: 'pointer',
                        textAlign: 'center',
                        direction: 'rtl',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        lineHeight: '1.0'

                    }}>
                    <div>
                        {(() => {
                            try {
                                const userData = localStorage.getItem('current_user');
                                return userData ? 'דווחו על פקח' : 'התחברו ודווחו על פקח';
                            } catch {
                                return 'התחברו ודווחו על פקח';
                            }
                        })()}
                    </div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        marginTop: '4px',
                        opacity: '0.9'
                    }}>
                        (שום פרט אישי לא נשמר אף פעם)
                    </div>
                </button>
            </div>

            <BusReportForm
                isOpen={isReportFormOpen}
                onClose={handleCloseReportForm}
                onSubmit={handleSubmitReport}
            />
            <AboutUs isAboutUsOpen={isAboutUsOpen} handleCloseAboutUs={handleCloseAboutUs}/>
        </div>
    );
}

export default Home;