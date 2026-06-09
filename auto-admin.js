// Auto-grant admin permissions on page load
window.isDemo = true;

document.addEventListener("DOMContentLoaded", function() {
    // Set default admin user after a short delay to ensure app.js runs first
    setTimeout(function() {
        currentUser = {
            id: 'default-admin',
            email: 'admin@demo.local',
            app_metadata: { roles: ['admin'] }
        };
        updateAuthUI();
        console.log('Admin access granted automatically');
    }, 100);
}, { once: true });

