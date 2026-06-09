$content = Get-Content app.js -Raw

# Find the loginUser function and replace it
$pattern = @"
async function loginUser\(\) \{
    if \(!isSupabaseReady\(\)\) \{
        showAuthMessage\('Supabase configuration প্রয়োজন। config\.js ফাইল তৈরি করুন।', true\);
        return;
    \}

    const email = document\.getElementById\('auth-email'\)\.value\.trim\(\);
    const password = document\.getElementById\('auth-password'\)\.value;

    if \(!email \|\| !password\) \{
        showAuthMessage\('ইমেল এবং পাসওয়ার্ড সরবরাহ করুন।', true\);
        return;
    \}

    const \{ error \} = await supabase\.auth\.signInWithPassword\(\{ email, password \}\);
    if \(error\) \{
        showAuthMessage\(\`লগইন ব্যর্থ: \$\{error\.message\}\`, true\);
        return;
    \}

    await loadCurrentUser\(\);
    showAuthMessage\('সফলভাবে লগইন হয়েছে।', false\);
    switchPage\('menu'\);
\}
"@

$replacement = @"
async function loginUser() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthMessage('ইমেল এবং পাসওয়ার্ড সরবরাহ করুন।', true);
        return;
    }

    // Hardcoded demo account (for demo/principal presentation only)
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

    if (!isSupabaseReady()) {
        showAuthMessage('Supabase configuration প্রয়োজন। config.js ফাইল তৈরি করুন।', true);
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
"@

$newContent = $content -replace [regex]::Escape($pattern), $replacement
$newContent | Set-Content app.js -Encoding UTF8
Write-Host "Updated loginUser function with hardcoded demo account"
