const API_BASE_URL = "http://localhost:3000/api";

// Local demo data
let userSubmittedReports = [
    {
        id: "#ALK9021",
        category: "নিরাপত্তা / রাস্তার গর্ত / ভাঙা ব্রিজ / বিদ্যুতের ঝুঁকি",
        location: "ঝাওতলা রেলগেট সংলগ্ন রোড",
        details: "রাস্তার মাঝখানে বিদ্যুতের তার ঝুলে আছে, যেকোনো সময় বড় দুর্ঘটনা ঘটতে পারে।",
        status: "Pending",
        phone: "01923746597",
        mediaSrc: ""
    }
];
let lastLocationCoords = null;

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
    let message = 'লোকেশন পাওয়া যায়নি।';
    if (error.code === 1) {
        message = 'অ্যাপের জন্য লোকেশন অনুমতি দেয়া হয়নি।';
    } else if (error.code === 2) {
        message = 'লোকেশন সার্ভার পাওয়া যায়নি।';
    } else if (error.code === 3) {
        message = 'লোকেশন অনুমতি সময়সীমা পেরিয়েছে।';
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
    loadReports();
});

function switchPage(pageId) {
    document.getElementById('page-menu').classList.remove('active-page');
    document.getElementById('page-report').classList.remove('active-page');
    document.getElementById('page-tracker').classList.remove('active-page');
    document.getElementById('page-admin').classList.remove('active-page');
    document.getElementById('page-emergency').classList.remove('active-page');
    document.getElementById('page-settings').classList.remove('active-page');
    
    document.getElementById('btn-nav-menu').classList.remove('active');
    document.getElementById('btn-nav-report').classList.remove('active');
    document.getElementById('btn-nav-tracker').classList.remove('active');
    document.getElementById('btn-nav-settings').classList.remove('active');

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

    if (pageId === 'emergency') {
        updateLocation();
    }
}

function renderTrackingList() {
    const trackerContainer = document.getElementById('tracker-list-container');
    const emptyMsg = document.getElementById('empty-tracker-msg');
    
    if (!trackerContainer) return;
    trackerContainer.innerHTML = "";
    
    if (userSubmittedReports.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    userSubmittedReports.forEach(report => {
        const card = document.createElement('div');
        card.className = "tracking-card";
        card.innerHTML = `
            <h4>${report.id}</h4>
            <p><strong>ক্যাটেগরি:</strong> ${report.category}</p>
            <p><strong>স্থান:</strong> ${report.location}</p>
            <p><strong>বিবরণ:</strong> ${report.details}</p>
            <p><strong>স্ট্যাটাস:</strong> <span style="color: #ff4d6d; font-weight: bold;">${report.status}</span></p>
            <p><strong>যোগাযোগ:</strong> ${report.phone || "লুকানো"}</p>
            ${report.mediaSrc ? `<img src="${report.mediaSrc}" onclick="openImageModal('${report.mediaSrc}')" style="max-width: 100%; cursor: pointer; margin-top: 10px;">` : ''}
        `;
        trackerContainer.appendChild(card);
    });
}

function renderAdminList() {
    const emptyAdminMsg = document.getElementById('empty-admin-msg');
    const adminContainer = document.getElementById('admin-list-container');
    
    if (!adminContainer) return;
    adminContainer.innerHTML = "";
    
    if (userSubmittedReports.length === 0) {
        emptyAdminMsg.style.display = "block";
        return;
    }
    
    emptyAdminMsg.style.display = "none";
    userSubmittedReports.forEach((report) => {
        const card = document.createElement('div');
        card.className = "tracking-card admin-expandable-card";
        card.innerHTML = `
            <div style="display: flex; gap: 10px;">
                ${report.mediaSrc ? `
                <div class="admin-image-wrapper" onclick="event.stopPropagation(); openImageModal('${report.mediaSrc}')">
                    <img src="${report.mediaSrc}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer;">
                </div>
                ` : ''}
                <div style="flex: 1;">
                    <h4>${report.id}</h4>
                    <p><strong>${report.category}</strong></p>
                    <p style="font-size: 0.85rem; color: #6c757d; margin: 4px 0;">${report.location}</p>
                </div>
            </div>
            <div class="admin-card-body" id="body-${report.id.replace('#', '')}" style="display: none;">
                <p><strong>বিবরণ:</strong> ${report.details}</p>
                <p><strong>যোগাযোগ:</strong> ${report.phone || "লুকানো"}</p>
                <div class="admin-controls" style="margin-top: 14px;" onclick="event.stopPropagation();">
                    <select class="admin-status-select" onchange="updateReportStatus('${report.id}', this.value)">
                        <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>পেন্ডিং</option>
                        <option value="In Progress" ${report.status === 'In Progress' ? 'selected' : ''}>কাজ চলছে</option>
                        <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>সমাধান করা হয়েছে</option>
                    </select>
                    <button class="btn" style="background:#ffcad4; color:#2b2d42; margin-top: 8px; width: 100%;" onclick="deleteReport('${report.id}')">ডিলিট করুন</button>
                </div>
            </div>
        `;
        card.onclick = () => toggleReportDetails('${report.id}');
        adminContainer.appendChild(card);
    });
}

function toggleReportDetails(reportId) {
    const bodyId = 'body-' + reportId.replace('#', '');
    const body = document.getElementById(bodyId);
    if (body) {
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }
}

function openImageModal(src) {
    const modal = document.getElementById('global-image-modal');
    const img = document.getElementById('modal-target-image');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
    }
}

function closeImageModal() {
    const modal = document.getElementById('global-image-modal');
    if (modal) modal.style.display = 'none';
}

async function loadReports() {
    // Load from local storage only
    renderTrackingList();
    renderAdminList();
}

async function saveReport(report) {
    // Save to local state only
    userSubmittedReports.unshift(report);
    renderTrackingList();
    renderAdminList();
    return report;
}

async function updateReportStatus(reportId, newStatus) {
    const report = userSubmittedReports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        renderTrackingList();
        renderAdminList();
    }
}

async function deleteReport(reportId) {
    userSubmittedReports = userSubmittedReports.filter(r => r.id !== reportId);
    renderTrackingList();
    renderAdminList();
}

function submitReportDemo() {
    const categorySelect = document.getElementById('incident-category');
    const locationInput = document.getElementById('incident-location');
    const landmarkInput = document.getElementById('incident-landmark');
    const detailsInput = document.getElementById('incident-details');
    const phoneInput = document.getElementById('incident-phone');
    const mediaInput = document.getElementById('incident-media');
    const anonToggle = document.getElementById('anon-toggle');

    const category = categorySelect.value;
    const location = locationInput.value;
    const landmark = landmarkInput.value;
    const details = detailsInput.value;
    const phone = anonToggle.checked ? '' : phoneInput.value;

    if (!category || !location || !details) {
        alert('সমস্যার ধরন, এলাকা এবং বিবরণ প্রয়োজন।');
        return;
    }

    const reportId = '#ALK' + Math.floor(Math.random() * 10000);
    const report = {
        id: reportId,
        category,
        location: landmark ? `${location} (${landmark})` : location,
        details,
        status: 'Pending',
        phone: phone || '',
        mediaSrc: ''
    };

    saveReport(report);
    alert(`রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে! আপনার রিপোর্ট ID: ${reportId}`);
    
    // Clear form
    categorySelect.value = '';
    locationInput.value = '';
    landmarkInput.value = '';
    detailsInput.value = '';
    phoneInput.value = '';
    mediaInput.value = '';
    anonToggle.checked = false;
    togglePhoneField();

    switchPage('menu');
}

function togglePhoneField() {
    const anonToggle = document.getElementById('anon-toggle');
    const phoneFieldWrapper = document.getElementById('phone-field-wrapper');
    if (phoneFieldWrapper) {
        phoneFieldWrapper.style.display = anonToggle.checked ? 'none' : 'block';
    }
}

function simulateAIPrioritization(category) {
    const priorityBadge = document.getElementById('ai-priority-badge');
    const priorityText = document.getElementById('ai-priority-text');
    
    if (!category) {
        priorityBadge.style.display = 'none';
        return;
    }
    
    const priorityMap = {
        'critical': '🔴 জরুরি',
        'critical_flood': '🔴 অত্যন্ত জরুরি - বন্যা',
        'critical_missing': '🔴 অত্যন্ত জরুরি - হারিয়ে যাওয়া',
        'medium': '🟠 মাঝারি অগ্রাধিকার',
        'medium_env': '🟠 মাঝারি অগ্রাধিকার - পরিবেশ',
        'medium_res': '🟠 মাঝারি অগ্রাধিকার - সম্পদ',
        'general': '🟡 সাধারণ',
        'general_edu': '🟡 শিক্ষা সংক্রান্ত'
    };
    
    if (priorityText) {
        priorityText.innerText = priorityMap[category] || '---';
    }
    priorityBadge.style.display = 'block';
}

function triggerSOSPanicAlert() {
    alert('SOS: জরুরি সতর্কতা পাঠানো হয়েছে প্রিফেক্ট এবং স্থানীয় প্রশাসনকে।');
}

function triggerFloodRescueAlert() {
    alert('🌊 বন্যা উদ্ধার দল সক্রিয় করা হয়েছে আপনার অবস্থানে।');
}

function triggerMissingPersonAlert() {
    alert('🧭 হারিয়ে যাওয়া ব্যক্তি উদ্ধার দল সক্রিয় করা হয়েছে।');
}

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
