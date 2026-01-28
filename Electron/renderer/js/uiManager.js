import { write as log } from './logger.js';
import { initializeSettings } from './setting/index.js'; // Import the settings module

const settings = initializeSettings(); // Initialize the settings module once

function initCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeApp();
        });
    }
}

// Helper to display files in a list-field div
function displayFiles(elementId, files) {
    const listElement = document.getElementById(elementId);
    if (listElement) {
        listElement.innerHTML = ''; // Clear current content
        if (files && files.length > 0) {
            files.forEach(file => {
                const p = document.createElement('p');
                p.textContent = file;
                listElement.appendChild(p);
            });
        } else {
            listElement.innerHTML = '<p>파일 없음</p>';
        }
    }
}

export async function loadDownloadUI() {
    log('[UI] Attempting to load download files...');
    console.log('[UI] Attempting to load download files...'); // Debug log to console
    try {
        // Fetch video files
        const videoFiles = await window.electronAPI.pathGetVideoFiles();
        console.log('[UI Debug] Fetched Video Files:', videoFiles);
        displayFiles('videoFileList', videoFiles);

        // Fetch subtitle files
        const subtitleFiles = await window.electronAPI.pathGetSubtitleFiles();
        console.log('[UI Debug] Fetched Subtitle Files:', subtitleFiles);
        displayFiles('subtitleFileList', subtitleFiles);

        log('[UI] Download files loaded successfully.');
        console.log('[UI] Download files loaded successfully.'); // Debug log to console
    } catch (generalError) {
        log(`[UI Error] Error in loadDownloadUI: ${generalError.message}`);
        console.error('[UI Error] Error in loadDownloadUI:', generalError);
    }
}

// Helper to hide all content divs
function hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings) {
    if (contentBasic) contentBasic.style.display = 'none';
    if (contentDownload) contentDownload.style.display = 'none';
    if (contentDetail) contentDetail.style.display = 'none';
    if (contentSettings) contentSettings.style.display = 'none';
}

// Helper to deactivate all tab buttons
function deactivateAllTabs(tabBasic, tabDownload, tabDetail, tabSettings) {
    if (tabBasic) tabBasic.classList.remove('active');
    if (tabDownload) tabDownload.classList.remove('active');
    if (tabDetail) tabDetail.classList.remove('active');
    if (tabSettings) tabSettings.classList.remove('active');
}



function initTabSwitching() { // This function only sets up event listeners
    const tabBasic = document.getElementById('tab-basic');
    const tabDownload = document.getElementById('tab-download');
    const tabDetail = document.getElementById('tab-detail');
    const tabSettings = document.getElementById('tab-settings');

    const contentBasic = document.getElementById('basic-content');
    const contentDownload = document.getElementById('download-content');
    const contentDetail = document.getElementById('detail-content');
    const contentSettings = document.getElementById('settings-content');
    
    // Event listeners for tabs
    if (tabBasic && contentBasic) {
        tabBasic.addEventListener('click', () => {
            deactivateAllTabs(tabBasic, tabDownload, tabDetail, tabSettings);
            hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings);
            tabBasic.classList.add('active');
            contentBasic.style.display = 'flex';
        });
    }

    if (tabDownload && contentDownload) {
        tabDownload.addEventListener('click', async () => {
            deactivateAllTabs(tabBasic, tabDownload, tabDetail, tabSettings);
            hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings);
            tabDownload.classList.add('active');
            contentDownload.style.display = 'flex';
            await loadDownloadUI(); // Load download UI when tab is clicked
        });
    }

    if (tabDetail && contentDetail) {
        tabDetail.addEventListener('click', () => {
            deactivateAllTabs(tabBasic, tabDownload, tabDetail, tabSettings);
            hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings);
            tabDetail.classList.add('active');
            contentDetail.style.display = 'flex';
        });
    }

    if (tabSettings && contentSettings) {
        tabSettings.addEventListener('click', async () => { // Made async here
            deactivateAllTabs(tabBasic, tabDownload, tabDetail, tabSettings);
            hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings);
            tabSettings.classList.add('active');
            contentSettings.style.display = 'flex';
            await settings.loadSettingsUI(); // Load settings when tab is clicked
        });
    }
}

async function setDefaultTabState() { // This should be a separate function called at init

    const tabBasic = document.getElementById('tab-basic');
    const tabDownload = document.getElementById('tab-download');
    const tabDetail = document.getElementById('tab-detail');
    const tabSettings = document.getElementById('tab-settings');

    const contentBasic = document.getElementById('basic-content');
    const contentDownload = document.getElementById('download-content');
    const contentDetail = document.getElementById('detail-content');
    const contentSettings = document.getElementById('settings-content');

    hideAllContent(contentBasic, contentDownload, contentDetail, contentSettings); // Hide all first

    if (tabDownload && tabDownload.classList.contains('active')) {
        if (contentDownload) {
            contentDownload.style.display = 'flex';
            await loadDownloadUI(); // Load download UI if it's the default active tab
        }
    } else if (tabBasic && tabBasic.classList.contains('active')) {
        if (contentBasic) contentBasic.style.display = 'flex';
    } else if (tabDetail && tabDetail.classList.contains('active')) {
        if (contentDetail) contentDetail.style.display = 'flex';
    } else if (tabSettings && tabSettings.classList.contains('active')) {
        if (contentSettings) {
            contentSettings.style.display = 'flex';
            // Only load settings UI if it's the default active tab
            await settings.loadSettingsUI(); // Added await
        }
    }
    // Fallback to basic if no active tab found
    else if (contentDownload) { // Now download is default
         if (tabDownload) tabDownload.classList.add('active');
         contentDownload.style.display = 'flex';
         await loadDownloadUI(); // Load download UI as fallback
    }
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




export async function initializeUI() { // Made initializeUI async
    initCloseButton();
    initTabSwitching(); // Call initTabSwitching to set up listeners    
    await setDefaultTabState(); // Then set the default state
    initLogListener();
    initTestButtons(); // For demonstration
    settings.initSettingsHandlers(); // Initialize settings-specific handlers
    
    // Signal to main process that renderer is ready for logs
    if (window.electronAPI && typeof window.electronAPI.rendererReadyForLogs === 'function') {
        window.electronAPI.rendererReadyForLogs();
    }
}
