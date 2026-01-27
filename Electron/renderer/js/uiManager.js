import { write as log } from './logger.js';

async function loadSettingsUI() {
    // log('[UI] Attempting to load settings...'); // REMOVED log
    console.log('[UI] Attempting to load settings...'); // Debug log to console
    try {
        // API Key section
        const apiSelect = document.getElementById('apiSelect'); // Use ID
        const apiNewKeyInput = document.getElementById('apiNewKeyInput'); // Use ID
        
        let apiKeys = [];
        try {
            apiKeys = await window.electronAPI.settingReadApiKeys();
            console.log('[UI Debug] Fetched API Keys:', apiKeys);
        } catch (ipcError) {
            log(`[UI Error] Failed to read API keys: ${ipcError.message}`);
            console.error('[UI Error] Failed to read API keys:', ipcError);
        }

        if (apiSelect) {
            apiSelect.innerHTML = ''; // Clear existing options
            if (apiKeys.length > 0) {
                apiKeys.forEach(key => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key; // Display full key or a truncated version
                    apiSelect.appendChild(option);
                });
                // Assuming the first key is the selected one as per Python logic
                apiSelect.value = apiKeys[0]; 
            } else {
                const option = document.createElement('option');
                option.value = 'none';
                option.textContent = '없음';
                apiSelect.appendChild(option);
                apiSelect.value = '없음';
            }
        }

        // Version section
        let modelVersion = '';
        try {
            modelVersion = await window.electronAPI.settingLoadVersion();
            console.log('[UI Debug] Fetched Model Version:', modelVersion);
        } catch (ipcError) {
            log(`[UI Error] Failed to load version: ${ipcError.message}`);
            console.error('[UI Error] Failed to load version:', ipcError);
        }
        const geminiVersionInput = document.getElementById('geminiVersionInput'); // Use ID
        if (geminiVersionInput) {
            geminiVersionInput.value = modelVersion;
        }

        // Rule section
        let promptRule = '';
        try {
            promptRule = await window.electronAPI.settingLoadRule();
            console.log('[UI Debug] Fetched Prompt Rule:', promptRule);
        } catch (ipcError) {
            log(`[UI Error] Failed to load rule: ${ipcError.message}`);
            console.error('[UI Error] Failed to load rule:', ipcError);
        }
        const promptRuleTextarea = document.getElementById('promptRuleTextarea'); // Use ID
        if (promptRuleTextarea) {
            promptRuleTextarea.value = promptRule;
        }
        // log('[UI] Settings loaded successfully.'); // REMOVED log
        console.log('[UI] Settings loaded successfully.'); // Debug log to console
    } catch (generalError) {
        log(`[UI Error] Error in loadSettingsUI: ${generalError.message}`);
        console.error('[UI Error] Error in loadSettingsUI:', generalError);
    }
}


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

async function loadDownloadUI() {
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

function initTabSwitching() { // This function only sets up event listeners
    const tabBasic = document.getElementById('tab-basic');
    const tabDownload = document.getElementById('tab-download');
    const tabDetail = document.getElementById('tab-detail');
    const tabSettings = document.getElementById('tab-settings');

    const contentBasic = document.getElementById('basic-content');
    const contentDownload = document.getElementById('download-content');
    const contentDetail = document.getElementById('detail-content');
    const contentSettings = document.getElementById('settings-content');

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
            await loadSettingsUI(); // Load settings when tab is clicked
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
            await loadSettingsUI(); // Added await
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

async function initSettingsHandlers() {
    const addApiKeyBtn = document.getElementById('addApiKeyBtn');
    const apiNewKeyInput = document.getElementById('apiNewKeyInput');
    const apiSelect = document.getElementById('apiSelect');
    const deleteApiKeyBtn = document.querySelector('#settings-content .delete-btn'); // Assuming this is the delete button

    // Handle Add API Key button click
    if (addApiKeyBtn && apiNewKeyInput) {
        addApiKeyBtn.addEventListener('click', async () => {
            const newKey = apiNewKeyInput.value.trim();
            if (newKey) {
                try {
                    // Python logic was get_added_keys then write_api_keys
                    const currentKeys = await window.electronAPI.settingReadApiKeys();
                    let updatedKeys = [...currentKeys];
                    if (updatedKeys.includes(newKey)) {
                        updatedKeys = updatedKeys.filter(key => key !== newKey);
                    }
                    updatedKeys.unshift(newKey); // Add to front
                    
                    await window.electronAPI.settingWriteApiKeys(updatedKeys);
                    apiNewKeyInput.value = ''; // Clear input field
                    await loadSettingsUI(); // Refresh UI to show new key selected
                    log(`[UI] API Key 추가됨: ${newKey.substring(0, 10)}...`);
                } catch (ipcError) {
                    log(`[UI Error] Failed to add API Key: ${ipcError.message}`);
                    console.error('[UI Error] Failed to add API Key:', ipcError);
                }
            } else {
                log('[UI] API Key 입력란이 비어있습니다.');
            }
        });
    }

    // Handle API Key Select change
    if (apiSelect) {
        apiSelect.addEventListener('change', async () => {
            const selectedKey = apiSelect.value;
            if (selectedKey && selectedKey !== '없음') {
                try {
                    // Python logic was get_reordered_keys then write_api_keys
                    const updatedKeys = await window.electronAPI.settingGetReorderedKeys(selectedKey);
                    await window.electronAPI.settingWriteApiKeys(updatedKeys);
                    await loadSettingsUI(); // Refresh UI to ensure selected is first
                    log(`[UI] API Key 선택됨: ${selectedKey.substring(0, 10)}...`);
                } catch (ipcError) {
                    log(`[UI Error] Failed to select API Key: ${ipcError.message}`);
                    console.error('[UI Error] Failed to select API Key:', ipcError);
                }
            } else {
                log('[UI] API Key가 선택되지 않았습니다.');
            }
        });
    }

    // Handle Delete API Key button click
    if (deleteApiKeyBtn && apiSelect) {
        deleteApiKeyBtn.addEventListener('click', async () => {
            const selectedKey = apiSelect.value;
            if (selectedKey && selectedKey !== '없음') {
                try {
                    const currentKeys = await window.electronAPI.settingReadApiKeys();
                    const updatedKeys = currentKeys.filter(key => key !== selectedKey);
                    await window.electronAPI.settingWriteApiKeys(updatedKeys);
                    await loadSettingsUI(); // Refresh UI
                    log(`[UI] API Key 삭제됨: ${selectedKey.substring(0, 10)}...`);
                } catch (ipcError) {
                    log(`[UI Error] Failed to delete API Key: ${ipcError.message}`);
                    console.error('[UI Error] Failed to delete API Key:', ipcError);
                }
            } else {
                log('[UI] 삭제할 API Key가 선택되지 않았습니다.');
            }
        });
    }

    // Handle Gemini Version input blur
    const geminiVersionInput = document.getElementById('geminiVersionInput');
    if (geminiVersionInput) {
        geminiVersionInput.addEventListener('blur', async () => {
            const newVersion = geminiVersionInput.value.trim();
            try {
                await window.electronAPI.settingSaveVersion(newVersion);
                log(`[UI] Gemini 버전이 저장되었습니다: ${newVersion}`);
            } catch (ipcError) {
                log(`[UI Error] Failed to save Gemini Version: ${ipcError.message}`);
                console.error('[UI Error] Failed to save Gemini Version:', ipcError);
            }
        });
    }

    // Handle Prompt Rule textarea blur
    const promptRuleTextarea = document.getElementById('promptRuleTextarea');
    if (promptRuleTextarea) {
        promptRuleTextarea.addEventListener('blur', async () => {
            const newRule = promptRuleTextarea.value.trim();
            try {
                await window.electronAPI.settingSaveRule(newRule);
                log(`[UI] 번역 규칙이 저장되었습니다.`);
            } catch (ipcError) {
                log(`[UI Error] Failed to save Translation Rule: ${ipcError.message}`);
                console.error('[UI Error] Failed to save Translation Rule:', ipcError);
            }
        });
    }
}


export async function initializeUI() { // Made initializeUI async
    initCloseButton();
    initTabSwitching(); // Call initTabSwitching to set up listeners
    await setDefaultTabState(); // Then set the default state
    initLogListener();
    initTestButtons(); // For demonstration
    initSettingsHandlers(); // Initialize settings-specific handlers
    
    // Signal to main process that renderer is ready for logs
    if (window.electronAPI && typeof window.electronAPI.rendererReadyForLogs === 'function') {
        window.electronAPI.rendererReadyForLogs();
    }
}