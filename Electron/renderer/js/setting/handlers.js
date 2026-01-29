// Electron/renderer/js/setting/handlers.js
import { write as log } from '../logger.js'; // Adjust path
import { loadSettingsUI } from './ui.js'; // Import loadSettingsUI

export async function initSettingsHandlers() {
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
                    const currentKeys = await window.electronAPI.settings.readApiKeys();
                    let updatedKeys = [...currentKeys];
                    if (updatedKeys.includes(newKey)) {
                        updatedKeys = updatedKeys.filter(key => key !== newKey);
                    }
                    updatedKeys.unshift(newKey); // Add to front
                    
                    await window.electronAPI.settings.writeApiKeys(updatedKeys);
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
                    const updatedKeys = await window.electronAPI.settings.getReorderedKeys(selectedKey);
                    await window.electronAPI.settings.writeApiKeys(updatedKeys);
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
                    const currentKeys = await window.electronAPI.settings.readApiKeys();
                    const updatedKeys = currentKeys.filter(key => key !== selectedKey);
                    await window.electronAPI.settings.writeApiKeys(updatedKeys);
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
                await window.electronAPI.settings.saveVersion(newVersion);
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
                await window.electronAPI.settings.saveRule(newRule);
                log(`[UI] 번역 규칙이 저장되었습니다.`);
            } catch (ipcError) {
                log(`[UI Error] Failed to save Translation Rule: ${ipcError.message}`);
                console.error('[UI Error] Failed to save Translation Rule:', ipcError);
            }
        });
    }
}
