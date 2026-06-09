const API_BASE_URL = "http://localhost:3000/api";
const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
const supabase = (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY)
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
let currentUser = null;
let lastLocationCoords = null;

// গ্লোবাল ডাটাবেজ সিমুলেশন অ্যারে
let userSubmittedReports = [
    {
        id: "#ALK9021",
        category: "নিরাপত্তা / রাস্তার গর্ত / ভাঙা ব্রিজ / বিদ্যুতের ঝুঁকি",
        location: "ঝাওতলা রেলগেট সংলগ্ন রোড",
        details: "রাস্তার মাঝখানে বিদ্যুতের তার ঝুলে আছে, যেকোনো সময় বড় দুর্ঘটনা ঘটতে পারে।",
        status: "Pending",
        phone: "01711122233",
        mediaSrc: ""
    }
];

function isSupabaseReady() {
    return supabase !== null;
}

function showAuthMessage(message, isError = false) {
    const authMessage = document.getElementById('auth-message');
    if (!authMessage) return;
    authMessage.style.color = isError ? '#d63384' : '#2b2d42';
    authMessage.innerText = message;
}

function isAdmin() {
    return currentUser?.app_metadata?.roles?.includes('admin');
}

function updateAuthUI() {
    const authMessage = document.getElementById('auth-message');
    if (!authMessage) return;

    if (currentUser) {
        authMessage.innerText = `সাইন ইন হয়েছে: ${currentUser.email}`;
        authMessage.style.color = '#2b2d42';
    } else {
        authMessage.innerText = 'দয়া করে লগইন করুন অথবা সাইন আপ করুন।';
        authMessage.style.color = '#6c757d';
    }

    const adminToggleRow = document.getElementById('admin-mode-toggle')?.closest('.setting-toggle-item');
    if (adminToggleRow) {
        adminToggleRow.style.display = isAdmin() ? 'flex' : 'none';
    }

    const adminCard = document.getElementById('admin-menu-card');
    if (adminCard) {
        adminCard.style.display = isAdmin() ? 'flex' : 'none';
    }
}

async function loadCurrentUser() {
    if (!isSupabaseReady()) return;

    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.warn('Supabase auth session failed:', error);
        return;
    }

    currentUser = data.session?.user ?? null;
    updateAuthUI();
}

if (isSupabaseReady()) {
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user ?? null;
        updateAuthUI();
    });
}

async function loginUser() {
    if (!isSupabaseReady()) {
        showAuthMessage('Supabase configuration প্রয়োজন। config.js ফাইল তৈরি করুন।', true);
        return;
    }

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthMessage('ইমেল এবং পাসওয়ার্ড সরবরাহ করুন।', true);
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showAuthMessage(`লগইন ব্যর্থ: ${error.message}`, true);
        return;
    }

    await loadCurrentUser();
    showAuthMessage('সফলভাবে লগইন হয়েছে।', false);
    switchPage('menu');
}

async function signupUser() {
    if (!isSupabaseReady()) {
        showAuthMessage('Supabase configuration প্রয়োজন। config.js ফাইল তৈরি করুন।', true);
        return;
    }

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthMessage('ইমেল এবং পাসওয়ার্ড সরবরাহ করুন।', true);
        return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        showAuthMessage(`সাইনআপ ব্যর্থ: ${error.message}`, true);
        return;
    }

    showAuthMessage('সাইনআপ সফল। ইমেল যাচাইকরণ দেখুন।', false);
}

async function logoutUser() {
    if (!isSupabaseReady()) {
        showAuthMessage('Supabase configuration নেই।', true);
        return;
    }

    await supabase.auth.signOut();
    currentUser = null;
    updateAuthUI();
    showAuthMessage('লগআউট হয়েছে।', false);
    switchPage('menu');
}

async function loadReportsFromSupabase() {
    try {
        const { data, error } = await supabase.from('reports').select('*');
        if (error) throw error;
        if (Array.isArray(data)) {
            userSubmittedReports = data;
            renderTrackingList();
            renderAdminList();
        }
    } catch (error) {
        console.warn('Unable to load Supabase reports:', error);
    }
}

async function saveReportToSupabase(report) {
    try {
        const { data, error } = await supabase.from('reports').insert(report).select();
        if (error) throw error;
        return Array.isArray(data) ? data[0] : null;
    } catch (error) {
        console.warn('Unable to save report to Supabase:', error);
        return null;
    }
}

async function updateReportOnSupabase(reportId, changes) {
    try {
        await supabase.from('reports').update(changes).eq('id', reportId);
    } catch (error) {
        console.warn('Unable to update report on Supabase:', error);
    }
}

async function deleteReportOnSupabase(reportId) {
    try {
        await supabase.from('reports').delete().eq('id', reportId);
    } catch (error) {
        console.warn('Unable to delete report on Supabase:', error);
    }
}

async function loadReports() {
    if (isSupabaseReady()) {
        await loadReportsFromSupabase();
    } else {
        await loadReportsFromServer();
    }
}

async function saveReport(report) {
    if (isSupabaseReady()) {
        return await saveReportToSupabase(report);
    }
    return await saveReportToServer(report);
}

function updateLocationText(message, details = '') {
    const gpsText = document.getElementById('gps-text');
    const gpsDetails = document.getElementById('gps-details');
    if (gpsText) gpsText.innerText = message;
    if (gpsDetails) gpsDetails.innerText = details;
}

function showLocationMap(lat, lon) {
    const mapContainer = document.getElementById('location-map-container');
    if (!mapContainer) return;
    mapContainer.style.display = 'block';
    const delta = 0.01;
    const south = lat - delta;
    const north = lat + delta;
    const west = lon - delta;
    const east = lon + delta;
    mapContainer.innerHTML = `
        <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lon}" loading="lazy"></iframe>
        <a class="map-link" target="_blank" href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}">ম্যাপে দেখুন</a>
    `;
}

function setUserLocation(position) {
    const lat = position.coords.latitude.toFixed(6);
    const lon = position.coords.longitude.toFixed(6);
    const accuracy = Math.round(position.coords.accuracy);
    lastLocationCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
    updateLocationText(`📍 বর্তমান স্থাণ: ${lat}, ${lon}`,
        `প্রায় সঠিক: ±${accuracy} মিটার`);
    showLocationMap(position.coords.latitude, position.coords.longitude);
}

function showLocationError(error) {
    let message = 'লোকেশন পাওয়া যায়নি।';
    if (error.code === 1) {
        message = 'অ্যাপের জন্য লোকেশন অনুমতি দেয়া হয়নি।';
    } else if (error.code === 2) {
        message = 'লোকেশন সার্ভার পাওয়া যায়নি।';
    } else if (error.code === 3) {
        message = 'লোকেশন অনুমতি সময়সীমা পেরিয়েছে।';
    }
    updateLocationText(`⚠️ ${message}`, 'আপনার ব্রাউজারের লোকেশন সেটিংস পরীক্ষা করুন।');
}

function updateLocation() {
    const mapContainer = document.getElementById('location-map-container');
    if (mapContainer) mapContainer.style.display = 'none';
    updateLocationText('📍 লোকেশন লোড হচ্ছে...', 'অপেক্ষা করুন...');

    if (!navigator.geolocation) {
        updateLocationText('⚠️ আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না।');
        return;
    }

    navigator.geolocation.getCurrentPosition(setUserLocation, showLocationError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("App Initializing...");
    renderTrackingList();
    renderAdminList();
    updateAuthUI();
    loadCurrentUser();
    loadReports();
});

function switchPage(pageId) {
    document.getElementById('page-menu').classList.remove('active-page');
    document.getElementById('page-report').classList.remove('active-page');
    document.getElementById('page-tracker').classList.remove('active-page');
    document.getElementById('page-admin').classList.remove('active-page');
    document.getElementById('page-emergency').classList.remove('active-page');
    document.getElementById('page-settings').classList.remove('active-page');
    document.getElementById('page-auth').classList.remove('active-page');
    
    document.getElementById('btn-nav-menu').classList.remove('active');
    document.getElementById('btn-nav-report').classList.remove('active');
    document.getElementById('btn-nav-tracker').classList.remove('active');
    document.getElementById('btn-nav-settings').classList.remove('active');
    document.getElementById('btn-nav-auth')?.classList.remove('active');

    document.getElementById('page-' + pageId).classList.add('active-page');
    
    if(pageId !== 'admin') {
        const navBtn = document.getElementById('btn-nav-' + pageId);
        if(navBtn) navBtn.classList.add('active');
    }

    const headerTitle = document.getElementById('header-title');
    if (pageId === 'menu') headerTitle.innerText = "ড্যাশবোর্ড";
    else if (pageId === 'report') headerTitle.innerText = "রিপোর্ট সিস্টেম";
    else if (pageId === 'tracker') headerTitle.innerText = "রিপোর্ট ট্র্যাকিং";
    else if (pageId === 'admin') headerTitle.innerText = "অ্যাকশন কন্ট্রোল প্যানেল";
    else if (pageId === 'emergency') headerTitle.innerText = "জরুরি সেবা";
    else if (pageId === 'settings') headerTitle.innerText = "অ্যাপ সেটিংস";
    else if (pageId === 'auth') headerTitle.innerText = "অ্যাকাউন্ট লগইন";

    if (pageId === 'emergency') {
        updateLocation();
    }
}


/**
 * এডমিন মোড সেটিংস টগলার
 */
function toggleAdminMode(isChecked) {
    const adminCard = document.getElementById('admin-menu-card');
    if (adminCard) {
        adminCard.style.display = isChecked ? "flex" : "none";
    }
}

function accessAdminPanel() {
    renderAdminList();
    switchPage('admin');
}

function logoutAdmin() {
    document.getElementById('admin-mode-toggle').checked = false;
    toggleAdminMode(false);
    switchPage('menu');
}

async function submitReportDemo() {
    const categorySelect = document.getElementById('incident-category');
    const locationInput = document.getElementById('incident-location');
    const detailsInput = document.getElementById('incident-details');
    const phoneInput = document.getElementById('incident-phone');
    const mediaInput = document.getElementById('incident-media');
    const anonToggle = document.getElementById('anon-toggle');

    if (!categorySelect.value || !locationInput.value) {
        alert('দয়া করে সমস্যার ধরন এবং ঘটনাস্থল উল্লেখ করুন।');
        return;
    }

    let mediaUrl = "";
    if (mediaInput.files && mediaInput.files[0]) {
        mediaUrl = URL.createObjectURL(mediaInput.files[0]);
    }

    let finalPhone = "অনুল্লেখিত";
    if (!anonToggle.checked && phoneInput.value.trim() !== "") {
        finalPhone = phoneInput.value;
    } else if (anonToggle.checked) {
        finalPhone = "🔒 গোপন রাখা হয়েছে";
    }

    let newReport = {
        id: "#ALK" + Math.floor(1000 + Math.random() * 9000),
        category: categorySelect.options[categorySelect.selectedIndex].text,
        location: locationInput.value,
        coordinates: lastLocationCoords ? `${lastLocationCoords.lat.toFixed(6)}, ${lastLocationCoords.lon.toFixed(6)}` : null,
        details: detailsInput.value || "কোনো বিবরণ দেওয়া হয়নি",
        status: "Pending",
        phone: finalPhone,
        mediaSrc: mediaUrl
    };

    const savedReport = await saveReport(newReport);
    if (savedReport) {
        userSubmittedReports.unshift(savedReport);
    } else {
        userSubmittedReports.unshift(newReport);
    }

    renderTrackingList();
    renderAdminList();

    categorySelect.value = "";
    locationInput.value = "";
    document.getElementById('incident-landmark').value = "";
    detailsInput.value = "";
    phoneInput.value = "";
    mediaInput.value = "";
    anonToggle.checked = false;
    document.getElementById('phone-field-wrapper').style.opacity = "1";
    phoneInput.disabled = false;
    document.getElementById('ai-priority-badge').style.display = "none";

    alert('🚀 আপনার রিপোর্টটি সফলভাবে সিস্টেমে অন্তর্ভুক্ত হয়েছে।');
    switchPage('tracker');
}

function renderTrackingList() {
    const emptyMsg = document.getElementById('empty-tracker-msg');
    const container = document.getElementById('tracker-list-container');
    container.innerHTML = "";

    if (userSubmittedReports.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    emptyMsg.style.display = "none";

    userSubmittedReports.forEach(report => {
        const card = document.createElement('div');
        card.className = "tracking-card";
        
        let badgeColor = "#fffde7"; 
        let textColor = "#f57f17";
        if(report.status === "Working") { badgeColor = "#e8f5e9"; textColor = "#2e7d32"; }
        if(report.status === "Solved") { badgeColor = "#e8dbfc"; textColor = "#6200ea"; }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: var(--accent-pink); font-size: 0.85rem;">${report.id}</strong>
                <span class="tracking-status-badge" style="background-color: ${badgeColor}; color: ${textColor};">${report.status}</span>
            </div>
            <h5>${report.category}</h5>
            <p>📍 লোকেশন: ${report.location}</p>
            <div style="font-size: 0.78rem; color: #4a4e69; background: #fdfaf6; padding: 8px; border-radius: 6px; border: 1px solid #ffe5d9;">
                ${report.details}
            </div>
            ${report.coordinates ? `<p style="font-size: 0.78rem; margin-top: 8px; color: #4a4e69;">📡 কোঅর্ডিনেট: ${report.coordinates}</p>` : ''}
        `;
        container.appendChild(card);
    });
}

/**
 * ফুল ইমেজ এক্সপ্যান্ড মেকানিজম সহ অ্যাডমিন রিভিউ প্যানেল
 */
function renderAdminList() {
    const emptyAdminMsg = document.getElementById('empty-admin-msg');
    const adminContainer = document.getElementById('admin-list-container');
    adminContainer.innerHTML = "";

    if (userSubmittedReports.length === 0) {
        emptyAdminMsg.style.display = "block";
        return;
    }
    emptyAdminMsg.style.display = "none";

    userSubmittedReports.forEach((report) => {
        const card = document.createElement('div');
        card.className = "tracking-card admin-expandable-card";
        card.style.borderColor = "#ff4d6d";
        
        // ইমেজ কন্টেইনার ওভারফ্লো ফিক্স এবং ক্লিক ইভেন্ট প্রপাগেশন বন্ধ করা হয়েছে
        let mediaHtml = "";
        if (report.mediaSrc) {
            mediaHtml = `
                <div class="admin-image-wrapper" onclick="event.stopPropagation(); openImageModal('${report.mediaSrc}')">
                    <img src="${report.mediaSrc}" alt="Attachment Preview">
                    <div class="image-click-hint">🔍 আলাদাভাবে দেখতে ট্যাপ করুন</div>
                </div>
            `;
        } else {
            mediaHtml = `<p style="font-size: 0.75rem; color: #999; font-style: italic; margin-top: 8px;">🖼️ কোনো প্রমাণ সংযুক্ত করা হয়নি</p>`;
        }

        card.innerHTML = `
            <div class="admin-card-header" onclick="toggleReportDetails('${report.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #b71c1c; font-size: 0.85rem;">${report.id}</strong>
                    <span class="tracking-status-badge" style="background: #ffe3e3; color: #b71c1c;">${report.status}</span>
                </div>
                <h5 style="margin-top: 4px; font-size: 0.9rem;">${report.category}</h5>
                <p style="margin-bottom: 0;">📍 স্থান: ${report.location}</p>
                <div class="expand-arrow-indicator" id="arrow-${report.id.replace('#', '')}">🔽 বিস্তারিত দেখতে ট্যাপ করুন</div>
            </div>
            
            <div class="admin-card-body" id="body-${report.id.replace('#', '')}" style="display: none;">
                <hr style="border: 0; border-top: 1px dashed #ffcad4; margin: 10px 0;">
                
                <p style="font-size: 0.8rem; color: var(--text); font-weight: bold;">
                    📞 কন্টাক্ট নম্বর: <span style="color: #023e8a;">${report.phone}</span>
                </p>

                <div style="font-size: 0.78rem; color: #4a4e69; background: #fff5f5; padding: 8px; border-radius: 6px; margin-top: 8px; margin-bottom: 8px;">
                    <strong>বিবরণ:</strong> ${report.details}
                </div>
                
                ${mediaHtml}
                
                <div class="admin-controls" style="margin-top: 14px;" onclick="event.stopPropagation();">
                    <select class="admin-status-select" onchange="updateReportStatus('${report.id}', this.value)">
                        <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Working" ${report.status === 'Working' ? 'selected' : ''}>Working</option>
                        <option value="Solved" ${report.status === 'Solved' ? 'selected' : ''}>Solved</option>
                    </select>
                    <button class="btn-delete-report" onclick="deleteReportRequest('${report.id}')">🗑️ রিমুভ</button>
                </div>
            </div>
        `;
        adminContainer.appendChild(card);
    });
}

function toggleReportDetails(reportId) {
    const cleanId = reportId.replace('#', '');
    const bodyEl = document.getElementById(`body-${cleanId}`);
    const arrowEl = document.getElementById(`arrow-${cleanId}`);
    
    if (bodyEl.style.display === "none") {
        bodyEl.style.display = "block";
        arrowEl.innerText = "🔼 বন্ধ করতে ট্যাপ করুন";
        arrowEl.style.color = "#ff4d6d";
    } else {
        bodyEl.style.display = "none";
        arrowEl.innerText = "🔽 বিস্তারিত দেখতে ট্যাপ করুন";
        arrowEl.style.color = "var(--muted)";
    }
}

/**
 * কাস্টম ইমেজ মডাল পপআপ ইঞ্জিন
 */
function openImageModal(imgSrc) {
    const modal = document.getElementById('global-image-modal');
    const modalImg = document.getElementById('modal-target-image');
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.style.display = "flex";
    }
}

function closeImageModal() {
    const modal = document.getElementById('global-image-modal');
    if (modal) modal.style.display = "none";
}

async function updateReportStatus(reportId, newStatus) {
    const report = userSubmittedReports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        renderTrackingList();
        renderAdminList();

        try {
            await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(reportId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.warn('Unable to update report status on server:', error);
        }

        const cleanId = reportId.replace('#', '');
        document.getElementById(`body-${cleanId}`).style.display = "block";
        document.getElementById(`arrow-${cleanId}`).innerText = "🔼 বন্ধ করতে ট্যাপ করুন";
    }
}

async function deleteReportRequest(reportId) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই রিপোর্টটি সিস্টেম থেকে মুছে ফেলতে চান?")) {
        userSubmittedReports = userSubmittedReports.filter(r => r.id !== reportId);
        renderTrackingList();
        renderAdminList();

        try {
            await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(reportId)}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.warn('Unable to delete report on server:', error);
        }
    }
}

function simulateAIPrioritization(value) {
    const badge = document.getElementById('ai-priority-badge');
    const txt = document.getElementById('ai-priority-text');
    if(!value) { badge.style.display = "none"; return; }
    badge.style.display = "block";
    
    if (value === "critical" || value === "critical_health" || value === "critical_flood" || value === "critical_missing") {
        txt.innerText = "🔴 জরুরি / তাৎক্ষণিক ব্যবস্থা";
        badge.style.backgroundColor = "#ffe3e3"; badge.style.borderColor = "#ffb3b3"; badge.style.color = "#b71c1c";
    } else if (value === "medium" || value === "medium_env" || value === "medium_res") {
        txt.innerText = "🟡 মাঝারি / টিম অ্যাকশন";
        badge.style.backgroundColor = "#fffde7"; badge.style.borderColor = "#fff59d"; badge.style.color = "#f57f17";
    } else {
        txt.innerText = "🟢 সাধারণ / পর্যবেক্ষণ তালিকাভুক্ত";
        badge.style.backgroundColor = "#e8f5e9"; badge.style.borderColor = "#a5d6a7"; badge.style.color = "#1b5e20";
    }
}

function togglePhoneField() {
    const isAnonymous = document.getElementById('anon-toggle').checked;
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const phoneInput = document.getElementById('incident-phone');
    if (isAnonymous) {
        phoneInput.value = ""; phoneWrapper.style.opacity = "0.4"; phoneInput.disabled = true;
    } else {
        phoneWrapper.style.opacity = "1"; phoneInput.disabled = false;
    }
}

function triggerSOSPanicAlert() {
    alert('⚠️ SOS অ্যালার্ট সক্রিয় হয়েছে!\nআপনার বর্তমান জিপিএস লোকেশন সরাসরি মেন্টর এবং নিকটস্থ প্রশাসনের কাছে পাঠানো হয়েছে।');
}

function triggerFloodRescueAlert() {
    alert('🌊 বন্যায় পানিবন্দী উদ্ধার নোটিশ পাঠানো হয়েছে।\nদয়া করে আপনার লোকেশন রিফ্রেশ করুন এবং নিরাপদ স্থানে থাকার চেষ্টা করুন।');
}

function triggerMissingPersonAlert() {
    alert('🧭 হারিয়ে যাওয়া ব্যক্তি উদ্ধার নোটিশ পাঠানো হয়েছে।\nআপনার লোকেশন শেয়ার করা হলে উদ্ধারকারী দল দ্রুত আপনাকে খুঁজে পাবে।');
}
