function Header() {
    const textStyle = {
        margin: '0',
        color: 'white',
        fontSize: '26px',
        fontWeight: 'bold',
        textAlign: 'center',
        direction: 'rtl',
        lineHeight: '0.9',
        letterSpacing: '-0.5px',
        whiteSpace: 'nowrap'    // Add this to the base if you want both on one line
    };
    return (
        <header style={{marginBottom: '0.5rem', position: 'relative'}}>
            {/* Person icon in top right */}
            <div style={{
                position: 'fixed',        // Changed from 'absolute' to 'fixed'
                top: '5px',             // Changed from '-10px' to '10px'
                right: '10px',           // Changed from '-30px' to '10px'
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: 'white',
                zIndex: 10
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>

            {/* Black container with white text */}
            <div style={{
                width: 'fit-content',
                height: '78px',
                backgroundColor: '#000000',
                borderRadius: '4px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '10px',
                paddingRight: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0px',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontFamily: 'Times New Roman, serif'
            }}>
                <h1 style={textStyle}>הו לא!!</h1>
                <h2 style={textStyle}>הצד(ו)ק הלך לאיבוד</h2>
            </div>

            {/* Text below the container */}
            <div style={{
                marginTop: '20px',
                textAlign: 'center',
                maxWidth: '400px',
                margin: '20px auto 0',
                fontFamily: 'Assistant',
                lineHeight: '1',
                fontWeight: '400'

            }}>
                <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    direction: 'rtl',
                    color: '#333',
                }}>
                    כאן תקבלו את הדיווחים הכי עדכניים על מיקום
                </p>
                <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    direction: 'rtl',
                    color: '#333'
                }}>
                    פקחי האוטובוסים בתחבורה הציבורית
                </p>
                <p style={{
                    margin: '0',
                    fontSize: '14px',
                    direction: 'rtl',
                    color: '#20B2AA', // Turquoise color
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>
                    למידע נוסף
                </p>
            </div>
        </header>
    );
}

export default Header;