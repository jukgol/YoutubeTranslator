// Electron/renderer/js/setting/ui.js
import { write as log } from '../logger.js'; // Adjust path

export async function loadSettingsUI() {
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
        console.log('[UI] Settings loaded successfully.'); // Debug log to console
    } catch (generalError) {
        log(`[UI Error] Error in loadSettingsUI: ${generalError.message}`);
        console.error('[UI Error] Error in loadSettingsUI:', generalError);
    }
}
