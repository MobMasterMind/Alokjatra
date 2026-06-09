// গ্লোবাল ডাটাবেজ সিমুলেশন অ্যারে
let userSubmittedReports = [
    {
        id: "#ALK9022",
        category: "প্রাকৃতিক দুর্যোগ / বন্যায় পানিবন্দী / জরুরি উদ্ধার",
        location: "প্লাবিত নিম্নাঞ্চল (নদী সংলগ্ন চরের ঘর)",
        details: "হঠাৎ বন্যায় পুরো ঘর পানিবন্দী হয়ে গেছে। চারদিকে তীব্র স্রোত থাকায় বের হতে পারছি না এবং কোথাও থেকে কোনো সাহায্য বা নৌকা পাচ্ছি না। পরিবারসহ চরম বিপদে আছি, দ্রুত উদ্ধারকারী টিম পাঠানো প্রয়োজন।",
        status: "Pending",
        phone: "01823456789",
        mediaSrc: ""
    },
    {
        id: "#ALK9023",
        category: "জরুরি উদ্ধার / বিমান দুর্ঘটনা / নিখোঁজ ও অনুসন্ধান",
        location: "দুর্গম পাহাড়ি বনাঞ্চল (দুর্ঘটনাস্থল ট্র্যাকিং জোন)",
        details: "বিমান দুর্ঘটনার পর অলৌকিকভাবে বেঁচে গেলেও এই ঘন জঙ্গলে পথ হারিয়ে ফেলেছি। নিজেকে নিজে উদ্ধার করার কোনো উপায় নেই। জিপিএস অন করে অ্যাপের মাধ্যমে এই সিগন্যাল পাঠালাম, উদ্ধারকারী টিম যেন দ্রুত লোকেশন ট্র্যাক করে উদ্ধার করে।",
        status: "Pending",
        phone: "01934567890",
        mediaSrc: ""
    }
];

document.addEventListener("DOMContentLoaded", function() {
    console.log("App Initializing...");
    renderTrackingList();
    renderAdminList();
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

function submitReportDemo() {
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

    const newReport = {
        id: "#ALK" + Math.floor(1000 + Math.random() * 9000),
        category: categorySelect.options[categorySelect.selectedIndex].text,
        location: locationInput.value,
        details: detailsInput.value || "কোনো বিবরণ দেওয়া হয়নি",
        status: "Pending",
        phone: finalPhone,
        mediaSrc: mediaUrl
    };

    userSubmittedReports.unshift(newReport);
    
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

function updateReportStatus(reportId, newStatus) {
    const report = userSubmittedReports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        renderTrackingList();
        renderAdminList();
        
        const cleanId = reportId.replace('#', '');
        document.getElementById(`body-${cleanId}`).style.display = "block";
        document.getElementById(`arrow-${cleanId}`).innerText = "🔼 বন্ধ করতে ট্যাপ করুন";
    }
}

function deleteReportRequest(reportId) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই রিপোর্টটি সিস্টেম থেকে মুছে ফেলতে চান?")) {
        userSubmittedReports = userSubmittedReports.filter(r => r.id !== reportId);
        renderTrackingList();
        renderAdminList();
    }
}

function simulateAIPrioritization(value) {
    const badge = document.getElementById('ai-priority-badge');
    const txt = document.getElementById('ai-priority-text');
    if(!value) { badge.style.display = "none"; return; }
    badge.style.display = "block";
    
    if (value === "critical" || value === "critical_health") {
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
    alert('⚠️ SOS অ্যালার্ট সক্রিয় হয়েছে!\nআপনার বর্তমান জিপিএস লোকেশন সরাসরি মেন্টর এবং নিকটস্থ প্রশাসনের কাছে পাঠানো হয়েছে।');
}