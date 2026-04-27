import { EnvUI } from './ui.js';

export function initializeEnvTab() {
    const envUI = new EnvUI();
    
    return {
        loadEnvUI: () => envUI.loadEnvUI(),
        initEnvHandlers: () => envUI.initEnvHandlers()
    };
}
