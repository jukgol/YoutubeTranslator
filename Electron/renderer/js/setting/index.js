// Electron/renderer/js/setting/index.js
import { loadSettingsUI } from './ui.js';
import { initSettingsHandlers } from './handlers.js';

export function initializeSettings() {
    // Return functions for uiManager.js to use
    return { loadSettingsUI, initSettingsHandlers };
}
