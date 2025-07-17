import React from 'react';

function LogoutConfirmation({isOpen, onClose, onConfirm}) {
    if (!isOpen) return null;

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
            padding: '20px',
            paddingTop: '100px',
            zIndex: 2000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                position: 'relative'
            }}>
                {/* Close button */}
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

                {/* Title */}
                <h2 style={{
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: '#333'
                }}>
                    האם אתם בטוחים שאתם<br/>רוצים להתנתק?
                </h2>

                {/* Subtitle */}
                <div style={{
                    textAlign: 'center',
                    direction: 'rtl',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '32px',
                    lineHeight: '1.4'
                }}>
                    אנחנו לא שומרים שום מידע לא עכשיו ולא לעולם,
                    <br/>
                    ככה שאין באמת צורך להתנתק
                </div>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {/* Stay Connected Button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            backgroundColor: '#20B2AA',
                            color: 'white',
                            padding: '14px 24px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'center',
                            direction: 'rtl'
                        }}
                    >
                        אשאר מחובר
                    </button>

                    {/* Disconnect Button */}
                    <button
                        onClick={onConfirm}
                        style={{
                            width: '100%',
                            backgroundColor: '#000',
                            color: 'white',
                            padding: '14px 24px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'center',
                            direction: 'rtl'
                        }}
                    >
                        התנתק
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutConfirmation;