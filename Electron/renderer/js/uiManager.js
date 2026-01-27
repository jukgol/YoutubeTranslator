import { write as log } from './logger.js';

function initCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeApp();
        });
    }
}

function initTabSwitching() {
    const tabBasic = document.getElementById('tab-basic');
    const tabDownload = document.getElementById('tab-download');
    const tabDetail = document.getElementById('tab-detail');
    const tabSettings = document.getElementById('tab-settings');

    const contentBasic = document.getElementById('basic-content');
    const contentDownload = document.getElementById('download-content');
    const contentDetail = document.getElementById('detail-content');
    const contentSettings = document.getElementById('settings-content');

    // Helper to hide all content divs
    function hideAllContent() {
        if (contentBasic) contentBasic.style.display = 'none';
        if (contentDownload) contentDownload.style.display = 'none';
        if (contentDetail) contentDetail.style.display = 'none';
        if (contentSettings) contentSettings.style.display = 'none';
    }

    // Helper to deactivate all tab buttons
    function deactivateAllTabs() {
        if (tabBasic) tabBasic.classList.remove('active');
        if (tabDownload) tabDownload.classList.remove('active');
        if (tabDetail) tabDetail.classList.remove('active');
        if (tabSettings) tabSettings.classList.remove('active');
    }

    // Event listeners for tabs
    if (tabBasic && contentBasic) {
        tabBasic.addEventListener('click', () => {
            deactivateAllTabs();
            hideAllContent();
            tabBasic.classList.add('active');
            contentBasic.style.display = 'flex';
        });
    }

    if (tabDownload && contentDownload) {
        tabDownload.addEventListener('click', () => {
            deactivateAllTabs();
            hideAllContent();
            tabDownload.classList.add('active');
            contentDownload.style.display = 'flex';
        });
    }

    if (tabDetail && contentDetail) {
        tabDetail.addEventListener('click', () => {
            deactivateAllTabs();
            hideAllContent();
            tabDetail.classList.add('active');
            contentDetail.style.display = 'flex';
        });
    }

    if (tabSettings && contentSettings) {
        tabSettings.addEventListener('click', () => {
            deactivateAllTabs();
            hideAllContent();
            tabSettings.classList.add('active');
            contentSettings.style.display = 'flex';
        });
    }

    // Set initial tab state based on which tab button has the 'active' class
    function setDefaultTabState() {
        hideAllContent(); // Hide all first

        if (tabDownload && tabDownload.classList.contains('active')) {
            if (contentDownload) contentDownload.style.display = 'flex';
        } else if (tabBasic && tabBasic.classList.contains('active')) {
            if (contentBasic) contentBasic.style.display = 'flex';
        } else if (tabDetail && tabDetail.classList.contains('active')) {
            if (contentDetail) contentDetail.style.display = 'flex';
        } else if (tabSettings && tabSettings.classList.contains('active')) {
            if (contentSettings) contentSettings.style.display = 'flex';
        }
        // Fallback to basic if no active tab found
        else if (contentBasic) {
             if (tabBasic) tabBasic.classList.add('active');
             contentBasic.style.display = 'flex';
        }
    }

    setDefaultTabState(); // Call immediately to set default state
}

function initLogListener() {
    const logView = document.getElementById('statusLog');
    if (logView && window.electronAPI && typeof window.electronAPI.onLogMessage === 'function') {
        window.electronAPI.onLogMessage((message) => {
            logView.value += message + '\n';
            logView.scrollTop = logView.scrollHeight; // Auto-scroll to bottom
        });
    }
}

function initTestButtons() {
    // Find the test button by its ID
    const testBtn = document.getElementById('test-log-btn');
    if(testBtn) {
        testBtn.addEventListener('click', () => {
            log('"' + testBtn.textContent + '" button clicked.');
        });
    }
}


export function initializeUI() {
    initCloseButton();
    initTabSwitching(); // initTabSwitching now handles default state
    initLogListener();
    initTestButtons(); // For demonstration
}
