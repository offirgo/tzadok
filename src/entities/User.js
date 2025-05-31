export const User = {
    // Simple login - just stores user info in localStorage
    login() {
        const userName = prompt('מה השם שלך?');
        if (userName) {
            const user = {
                full_name: userName,
                login_time: Date.now()
            };
            localStorage.setItem('current_user', JSON.stringify(user));
            window.location.reload(); // Refresh page to update login state
        }
    },

    // Check if user is logged in
    async me() {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            return JSON.parse(userData);
        } else {
            throw new Error('Not logged in');
        }
    },

    // Logout
    async logout() {
        localStorage.removeItem('current_user');
        window.location.reload(); // Refresh page to update login state
    }
};