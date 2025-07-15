import React from 'react';

function AboutUs({isAboutUsOpen, handleCloseAboutUs}) {

    if (!isAboutUsOpen) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative'
            }}>
                {/* Close button */}
                <button
                    onClick={handleCloseAboutUs}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ×
                </button>

                {/* Title */}
                <h2 style={{
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                    color: '#333'
                }}>
                    נתוני האפליקציה
                </h2>

                {/* Content */}
                <div style={{
                    direction: 'rtl',
                    textAlign: 'right',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    color: '#444'
                }}>
                    <p style={{marginBottom: '16px'}}>
                        <strong>1.</strong> הדיווחים הם תמיד אנונימיים לחלוטין, האפליקציה לא שומרת שום סוג של מידע על
                        המשתמשים.
                    </p>

                    <p style={{marginBottom: '16px'}}>
                        <strong>2.</strong> נדרשים התחברות וגישה למיקום למניעת שימוש ברעה ולטובת אמינות הדיווחים.
                    </p>

                    <p style={{marginBottom: '16px'}}>
                        <strong>3.</strong> האפליקציה תורד לאלתר ברגע ששרת התחבורה תמצא את (ה)צדוק.
                    </p>

                    <p style={{marginBottom: '24px'}}>
                        <strong>4.</strong> כל דיווח מוסר אוטומטית לאחר 15 דקות.
                    </p>

                    {/* Bottom section */}
                    <div style={{
                        borderTop: '1px solid #eee',
                        paddingTop: '16px',
                        marginTop: '24px'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            textAlign: 'center'
                        }}>
                            האותיות המאוד קטנות
                        </h3>

                        <p style={{
                            fontSize: '14px',
                            color: '#666',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            למען הסר ספק, אנחנו ממליצים תמיד לתקף את הנסיעות שלכם בתחבורה הציבורית. מציאת הצד(ו)ק אינה
                            תחליף לתיקוף
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;