import {useEffect, useState} from 'react';
import Header from '../components/Header';
import BusMap from '../components/BusMap';
import BusReportForm from '../components/BusReportForm';
import {User} from '../entities/User';
import {Report} from '../entities/Report';
import {getCurrentLocation, isLocationAccurate} from '../utils/geolocation';


function Home() {
    const [isReportFormOpen, setIsReportFormOpen] = useState(false);
    const [reports, setReports] = useState([]); // Start with empty array
    const [setUserLocation] = useState(null);

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

    return (
        <div>
            <Header/>
            {/* Yellow banner when no reports */}
            {reports.length === 0 && (
                <div style={{
                    backgroundColor: '#FEF3C7', // Light yellow
                    padding: '12px 10px',
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '10px',
                    color: '#92400E', // Dark yellow/brown text
                    borderBottom: '1px solid #FDE68A',
                    fontWeight: 'bold'
                }}>
                    אין דיווחים - או שהכל טוב ומירי רגב ויתרה לנו היום או שאף אחד לא דיווח
                </div>
            )}
            <main>
                <BusMap reports={reports}/>
                <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    // gap: '10px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/*<button*/}
                    {/*    onClick={handleOpenReportForm}*/}
                    {/*    style={{*/}
                    {/*        backgroundColor: '#dc2626',*/}
                    {/*        color: 'white',*/}
                    {/*        padding: '12px 24px',*/}
                    {/*        border: 'none',*/}
                    {/*        borderRadius: '6px',*/}
                    {/*        fontSize: '16px',*/}
                    {/*        cursor: 'pointer'*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {(() => {*/}
                    {/*        try {*/}
                    {/*            const userData = localStorage.getItem('current_user');*/}
                    {/*            return userData ? 'ראיתי את צדוק ואני רוצה לדווח  ולעזור לשרה רגב' : '🔑 התחבר ודווח';*/}
                    {/*        } catch {*/}
                    {/*            return '🔑 התחבר ודווח';*/}
                    {/*        }*/}
                    {/*    })()}*/}
                    {/*</button>*/}

                    {/*/!* Show logout button only when logged in *!/*/}
                    {/*{(() => {*/}
                    {/*    try {*/}
                    {/*        const userData = localStorage.getItem('current_user');*/}
                    {/*        if (userData) {*/}
                    {/*            return (*/}
                    {/*                <button*/}
                    {/*                    onClick={() => User.logout()}*/}
                    {/*                    style={{*/}
                    {/*                        backgroundColor: '#6b7280',*/}
                    {/*                        color: 'white',*/}
                    {/*                        padding: '8px',*/}
                    {/*                        border: 'none',*/}
                    {/*                        borderRadius: '50%',*/}
                    {/*                        fontSize: '14px',*/}
                    {/*                        cursor: 'pointer',*/}
                    {/*                        width: '36px',*/}
                    {/*                        height: '36px',*/}
                    {/*                        display: 'flex',*/}
                    {/*                        alignItems: 'center',*/}
                    {/*                        justifyContent: 'center'*/}
                    {/*                    }}*/}
                    {/*                    title="התנתק"*/}
                    {/*                >*/}
                    {/*                    ✕*/}
                    {/*                </button>*/}
                    {/*            );*/}
                    {/*        }*/}
                    {/*    } catch (error) {*/}
                    {/*        // Not logged in*/}
                    {/*    }*/}
                    {/*    return null;*/}
                    {/*})()}*/}

                </div>
                {/*/!* Privacy disclaimer *!/*/}
                {/*<div style={{*/}
                {/*    maxWidth: '600px',*/}
                {/*    margin: '2rem auto 0 auto',*/}
                {/*    padding: '0rem',*/}
                {/*    backgroundColor: '#f8f9fa',*/}
                {/*    borderRadius: '8px',*/}
                {/*    fontSize: '12px',*/}
                {/*    lineHeight: '1.4',*/}
                {/*    color: '#666',*/}
                {/*    direction: 'rtl',*/}
                {/*    textAlign: 'right'*/}
                {/*}}>*/}

                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px'}}>*/}
                {/*        הדיווחים הם תמיד אנונימיים לחלוטין*/}
                {/*    </p>*/}
                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px'}}>*/}
                {/*        האפליקציה לא שומרת שום סוג של מידע על המשתמשים*/}
                {/*    </p>*/}
                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px'}}>*/}
                {/*        נדרשים התחברות וגישה למיקום למניעת שימוש ברעה ולטובת אמינות הדיווחים*/}
                {/*    </p>*/}
                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px'}}>*/}
                {/*        האפליקציה תורד לאלתר ברגע ששרת התחבורה תמצא את (ה)צדוק*/}
                {/*    </p>*/}

                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px'}}>*/}
                {/*        כל דיווח יורד אוטומטית לאחר 15 דקות*/}
                {/*    </p>*/}

                {/*    <p style={{margin: '0.5rem 0', fontSize: '10px', fontWeight: 'bold', color: '#d97706'}}>*/}
                {/*        ⚠️ למען הסר ספק אנחנו ממליצים תמיד לתקף את הנסיעות שלכם בתחבורה הציבורית, מציאת צדוק אינה תחליף*/}
                {/*        לתיקוף*/}
                {/*    </p>*/}
                {/*</div>*/}
            </main>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: 'calc(100% - 40px)',
                maxWidth: '400px'
            }}>
                <button style={{
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <div>התחבר ודווח על פקח</div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        style: 'regular',
                        marginTop: '4px',
                        opacity: '0.9'
                    }}>
                        (פרטי ההתחברות לא נשמרים)
                    </div>
                </button>
            </div>

            <BusReportForm
                isOpen={isReportFormOpen}
                onClose={handleCloseReportForm}
                onSubmit={handleSubmitReport}
            />
        </div>

    );
}

export default Home;