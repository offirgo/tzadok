export const User = {
    // Google OAuth login with button approach
    login(shouldOpenReportAfter = false) {
        if (!window.google) {
            alert('Google login is loading... Please try again in a moment.');
            return;
        }

        // Create a temporary button and click it
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '-1000px';
        document.body.appendChild(tempDiv);

        window.google.accounts.id.initialize({
            client_id: "347329610273-jgg3jhdll0auivgi567i42di29k781ml.apps.googleusercontent.com",
            callback: (response) => {
                User.handleGoogleResponse(response);
                document.body.removeChild(tempDiv);
            }
        });

        window.google.accounts.id.renderButton(tempDiv, {
            theme: "outline",
            size: "large"
        });

        // Auto-click the button
        setTimeout(() => {
            tempDiv.querySelector('div[role="button"]')?.click();
        }, 100);
    },

    // Handle Google OAuth response
    handleGoogleResponse(response, shouldOpenReportAfter = false) {
        try {
            // Decode the JWT token to get user info
            const userInfo = JSON.parse(atob(response.credential.split('.')[1]));

            const user = {
                full_name: decodeURIComponent(escape(userInfo.name)), // Fix Hebrew encoding
                email: userInfo.email,
                google_id: userInfo.sub,
                login_time: Date.now()
            };

            localStorage.setItem('current_user', JSON.stringify(user));
            if (shouldOpenReportAfter) {
                localStorage.setItem('open_report_after_login', 'true');
            }
            window.location.reload();
        } catch (error) {
            console.error('Login error:', error);
            alert('שגיאה בהתחברות. אנא נסה שוב.');
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
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
        window.location.reload();
    }
};