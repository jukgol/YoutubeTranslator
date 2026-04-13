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

    // Handle Prompt Rule Select change
    const promptRuleSelect = document.getElementById('promptRuleSelect');
    if (promptRuleSelect) {
        promptRuleSelect.addEventListener('change', async () => {
            const filename = promptRuleSelect.value;
            try {
                // Always save the selection state (custom or preset name)
                await window.electronAPI.settings.saveSelectedRulePreset(filename);

                if (filename && filename !== 'custom') {
                    const content = await window.electronAPI.settings.readRulePreset(filename);
                    await window.electronAPI.settings.saveRule(content); // Saves to configData and current rule file
                    const promptRuleTextarea = document.getElementById('promptRuleTextarea');
                    if (promptRuleTextarea) {
                        promptRuleTextarea.value = content;
                    }
                    log(`[UI] 번역 지침이 프리셋에서 로드되었습니다: ${filename}`);
                }
            } catch (ipcError) {
                log(`[UI Error] Failed to handle rule selection: ${ipcError.message}`);
                console.error('[UI Error] Failed to handle rule selection:', ipcError);
            }
        });
    }

    // Handle Create Rule File button click
    const createRuleFileBtn = document.getElementById('createRuleFileBtn');
    const newRuleFileNameInput = document.getElementById('newRuleFileName');

    if (createRuleFileBtn && newRuleFileNameInput && promptRuleTextarea) {
        createRuleFileBtn.addEventListener('click', async () => {
            let filename = newRuleFileNameInput.value.trim();
            const content = promptRuleTextarea.value.trim();

            if (!filename) {
                // log('[UI] 파일 이름을 입력해주세요.'); // Optional: can add a visible warning if needed
                return;
            }

            try {
                const success = await window.electronAPI.settings.createRulePreset(filename, content);
                if (success) {
                    if (!filename.endsWith('.txt')) filename += '.txt';
                    log(`[UI] 새 지침 파일이 생성되었습니다: ${filename}`);
                    newRuleFileNameInput.value = ''; // Clear input
                    await loadSettingsUI(); // Refresh dropdown
                    
                    // Automatically select the new file in the dropdown
                    const promptRuleSelect = document.getElementById('promptRuleSelect');
                    if (promptRuleSelect) {
                        promptRuleSelect.value = filename;
                        // Also save this selection state to initdata.json
                        await window.electronAPI.settings.saveSelectedRulePreset(filename);
                    }
                } else {
                    log('[UI Error] 파일 생성에 실패했습니다.');
                }
            } catch (ipcError) {
                log(`[UI Error] Failed to create rule preset: ${ipcError.message}`);
                console.error('[UI Error] Failed to create rule preset:', ipcError);
            }
        });
    }

    // Handle Delete Rule Preset button click
    const deleteRulePresetBtn = document.getElementById('deleteRulePresetBtn');
    if (deleteRulePresetBtn && promptRuleSelect) {
        deleteRulePresetBtn.addEventListener('click', async () => {
            const selectedPreset = promptRuleSelect.value;
            if (selectedPreset && selectedPreset !== 'custom') {
                try {
                    const success = await window.electronAPI.settings.deleteRulePreset(selectedPreset);
                    if (success) {
                        log(`[UI] 지침 프리셋 파일이 삭제되었습니다: ${selectedPreset}`);
                        await window.electronAPI.settings.saveSelectedRulePreset('custom');
                        await loadSettingsUI(); // Refresh UI and reset to custom
                    } else {
                        log('[UI Error] 지침 프리셋 삭제에 실패했습니다.');
                    }
                } catch (ipcError) {
                    log(`[UI Error] Failed to delete rule preset: ${ipcError.message}`);
                    console.error('[UI Error] Failed to delete rule preset:', ipcError);
                }
            } else {
                log('[UI] 삭제할 프리셋이 선택되지 않았습니다.');
            }
        });
    }
}
