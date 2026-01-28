import { write as log } from './logger.js';
import { initializeSettings } from './setting/index.js'; // Import the settings module
import { initializeDownloadTab } from './download/index.js';
import { initializeRunstepTab } from './runstep/index.js';
import { initializeRunallTab } from './runall/index.js';

const settings = initializeSettings(); // Initialize the settings module once

function initCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeApp();
        });
    }
}

const tabConfig = [
    { 
        tabId: 'tab-runall', 
        contentId: 'runall-content', 
        initializer: initializeRunallTab
    },
    { 
        tabId: 'tab-download', 
        contentId: 'download-content', 
        initializer: initializeDownloadTab 
    },
    { 
        tabId: 'tab-runstep', 
        contentId: 'runstep-content', 
        initializer: initializeRunstepTab 
    },
    { 
        tabId: 'tab-settings', 
        contentId: 'settings-content', 
        initializer: () => settings.loadSettingsUI()
    }
];

function initTabSwitching() {
    const allTabs = tabConfig.map(config => document.getElementById(config.tabId));
    const allContents = tabConfig.map(config => document.getElementById(config.contentId));

    tabConfig.forEach((config, index) => {
        const tab = allTabs[index];
        const content = allContents[index];

        if (tab && content) {
            tab.addEventListener('click', async () => {
                // Deactivate all tabs and hide all content
                allTabs.forEach(t => t?.classList.remove('active'));
                allContents.forEach(c => { if(c) c.style.display = 'none'; });

                // Activate the clicked tab and show its content
                tab.classList.add('active');
                content.style.display = 'flex';

                // If an initializer function is defined for this tab, call it
                if (config.initializer) {
                    await config.initializer();
                }
            });
        }
    });
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
    initLogListener();
    initTestButtons(); // For demonstration
    settings.initSettingsHandlers(); // Initialize settings-specific handlers
    
    // Signal to main process that renderer is ready for logs
    if (window.electronAPI && typeof window.electronAPI.rendererReadyForLogs === 'function') {
        window.electronAPI.rendererReadyForLogs();
    }

    // Programmatically click the default tab to ensure consistent loading
    document.getElementById('tab-download').click();
}