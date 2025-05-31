import { useState, useEffect } from 'react';
import { User } from '../entities/User';

function Header() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        checkUser();
    }, []);

    const handleLogin = () => {
        User.login();
    };

    const handleLogout = () => {
        User.logout();
    };

    return (
        <header>
            <h1>צדוק תחבורתי</h1>
            <p>ילדים, עזרו לשרה רגב למצוא את העובד שלה</p>

            <div style={{ marginTop: '1rem' }}>
                {isLoading ? (
                    <p>טוען...</p>
                ) : user ? (
                    <div>
                        <p>שלום, {user.full_name}!</p>
                        <button onClick={handleLogout}>התנתק</button>
                    </div>
                ) : (
                    <button onClick={handleLogin}>התחבר</button>
                )}
            </div>
        </header>
    );
}

export default Header;