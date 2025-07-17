import {useState} from 'react';

function BusReportForm({isOpen, onClose, onSubmit}) {
    const [busNumber, setBusNumber] = useState('');
    const [direction, setDirection] = useState('');
    const [busNumberError, setBusNumberError] = useState('');
    const [directionError, setDirectionError] = useState('');

    if (!isOpen) {
        return null;
    }

    const validateBusNumber = (value) => {
        if (!/^\d+$/.test(value.trim())) {
            return "מספר האוטובוס חייב להיות מספר שלם חיובי בלבד.";
        }
        return '';
    };

    const validateDirection = (value) => {
        const trimmed = value.trim();

        if (trimmed.length > 20) {
            return "השדה 'לכיוון' לא יכול להכיל יותר מ-20 תווים.";
        }

        if (!/^[\u0590-\u05FFa-zA-Z0-9\s]+$/.test(trimmed)) {
            return "השדה 'לכיוון' יכול להכיל רק אותיות, מספרים ורווחים – ללא סימנים מיוחדים.";
        }

        if (/<|>/.test(trimmed)) {
            return "אסור להשתמש בתווים מיוחדים כמו < או >.";
        }

        return '';
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        const busError = validateBusNumber(busNumber);
        const directionError = validateDirection(direction);

        setBusNumberError(busError);
        setDirectionError(directionError);

        if (busError || directionError) {
            return;
        }

        onSubmit({
            busNumber: busNumber.trim(),
            direction: direction.trim(),
            timestamp: Date.now()
        });

        setBusNumber('');
        setDirection('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            paddingTop: '100px',
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
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

                <h2 style={{
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#333'
                }}>
                    דיווח על צד(ו)ק
                </h2>

                <div style={{
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '32px',
                    lineHeight: '1.4'
                }}>
                    הטקסט הוא טקסט חופשי, נסו לפרט כמה<br/>
                    שיותר לטובת המשתמשים האחרים
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Bus Number Section */}
                    <div style={{
                        marginBottom: '24px',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            מספר אוטובוס
                        </label>
                        <input
                            type="text"
                            value={busNumber}
                            onChange={(e) => setBusNumber(e.target.value)}
                            placeholder="לדוגמא: 5"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                direction: 'rtl',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                        <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                            ניתן להזין רק מספרים שלמים חיוביים, שלוש ספרות לכל היותר
                        </div>
                        {busNumberError && (
                            <div style={{color: 'red', fontSize: '14px', marginTop: '4px'}}>
                                {busNumberError}
                            </div>
                        )}
                    </div>

                    {/* Direction Section */}
                    <div style={{
                        marginBottom: '32px',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            לכיוון
                        </label>
                        <input
                            type="text"
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            placeholder="לדוגמא: לכיוון התחנה המרכזית"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                direction: 'rtl',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                        <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                            ניתן להזין עד 20 אותיות בעברית/אנגלית, מספרים ורווחים בלבד. אין להזין סימנים מיוחדים.
                        </div>
                        {directionError && (
                            <div style={{color: 'red', fontSize: '14px', marginTop: '4px'}}>
                                {directionError}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            backgroundColor: '#20B2AA',
                            color: 'white',
                            padding: '14px 24px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '24px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'center',
                            direction: 'rtl'
                        }}
                    >
                        שלח דיווח
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BusReportForm;
