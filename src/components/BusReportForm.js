import { useState } from 'react';

function BusReportForm({ isOpen, onClose, onSubmit }) {
    const [busNumber, setBusNumber] = useState('');
    const [direction, setDirection] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (busNumber.trim() && direction.trim()) {
            onSubmit({
                busNumber: busNumber.trim(),
                direction: direction.trim(),
                timestamp: Date.now()
            });
            setBusNumber('');
            setDirection('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '400px'
            }}>
                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    דיווח על צדוק תחבורתי
                </h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            מספר אוטובוס:
                        </label>
                        <input
                            type="text"
                            value={busNumber}
                            onChange={(e) => setBusNumber(e.target.value)}
                            placeholder="לדוגמה: 5, 18, 480"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            כיוון:
                        </label>
                        <input
                            type="text"
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            placeholder="לדוגמה: תל אביב ← ירושלים"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                backgroundColor: '#16a34a',
                                color: 'white',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            שלח דיווח
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                backgroundColor: '#6b7280',
                                color: 'white',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BusReportForm;