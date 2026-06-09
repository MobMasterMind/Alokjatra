// Demo login patch - override the loginUser function
const originalLoginUser = loginUser;

async function loginUser() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthMessage('ইমেল এবং পাসওয়ার্ড সরবরাহ করুন।', true);
        return;
    }

    // Hardcoded demo account for principal demo
    if (email === 'ashfaqrihan402@gmail.com' && password === 'Cooliboi420') {
        currentUser = {
            id: 'demo-admin-user',
            email: email,
            app_metadata: { roles: ['admin'] }
        };
        updateAuthUI();
        showAuthMessage('সফলভাবে লগইন হয়েছে।', false);
        switchPage('menu');
        return;
    }

    // Fallback to original Supabase login
    if (!isSupabaseReady()) {
        showAuthMessage('Supabase configuration প্রয়োজন।', true);
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showAuthMessage(`লগইন ব্যর্থ: ${error.message}`, true);
        return;
    }

    await loadCurrentUser();
    showAuthMessage('সফলভাবে লগইন হয়েছে।', false);
    switchPage('menu');
}
