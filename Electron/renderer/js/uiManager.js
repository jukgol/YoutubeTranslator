import { write as log } from './logger.js';
import { initializeSettings } from './setting/index.js'; // Import the settings module
import { initializeDownloadTab, refreshDownloadTab } from './download/index.js';
import { initializeRunstepTab, refreshRunstepTab } from './runstep/index.js';
import { initializeRunallTab, refreshRunallTab } from './runall/index.js';
import { initializeSubtitleTab, refreshSubtitleTab } from './subtitle/index.js';
import { initializeEnvTab } from './env/index.js';


const settings = initializeSettings(); // Initialize the settings module once
const env = initializeEnvTab();

function initCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.system.closeApp();
        });
    }
}

const tabConfig = [
    {
        tabId: 'tab-runall',
        contentId: 'runall-content',
        setup: initializeRunallTab, // Initial setup function
        refresh: refreshRunallTab // Refresh function
    },
    {
        tabId: 'tab-download',
        contentId: 'download-content',
        setup: initializeDownloadTab, // Initial setup function
        refresh: refreshDownloadTab // Refresh function
    },
    {
        tabId: 'tab-subtitle',
        contentId: 'subtitle-content',
        setup: initializeSubtitleTab, // Initial setup function
        refresh: refreshSubtitleTab // Refresh function
    },
    {
        tabId: 'tab-runstep',
        contentId: 'runstep-content',
        setup: initializeRunstepTab, // Initial setup function
        refresh: refreshRunstepTab // Refresh function
    },
    {
        tabId: 'tab-settings',
        contentId: 'settings-content',
        setup: () => settings.loadSettingsUI(), // Settings UI is its own setup/refresh
        refresh: () => settings.loadSettingsUI() // Assuming loadSettingsUI also refreshes
    },
    {
        tabId: 'tab-env',
        contentId: 'env-content',
        setup: () => env.initEnvHandlers(),
        refresh: () => env.loadEnvUI()
    }
];

// This function will now only perform initial setup for each tab
async function initialSetupAllTabs() {
    log('Performing initial setup for all tabs...');
    for (const config of tabConfig) {
        if (config.setup) {
            try {
                await config.setup();
            } catch (error) {
                console.error(`Error performing initial setup for tab ${config.tabId}:`, error);
                log(`[Error] ${config.tabId} 탭 초기 설정 중 오류 발생`);
            }
        }
    }
    log('Initial setup for all tabs complete.');
}

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
                allContents.forEach(c => { if (c) c.style.display = 'none'; });

                // Activate the clicked tab and show its content
                tab.classList.add('active');
                content.style.display = 'flex';

                // Call the refresh function for the clicked tab
                if (config.refresh) {
                    try {

                        await config.refresh();
                    } catch (error) {
                        console.error(`Error refreshing tab ${config.tabId}:`, error);
                        log(`[Error] ${config.tabId} 탭 새로고침 중 오류 발생`);
                    }
                }
            });
        }
    });
}

function initLogListener() {
    const logView = document.getElementById('statusLog');
    if (logView && window.electronAPI && typeof window.electronAPI.logging.onLogMessage === 'function') {
        window.electronAPI.logging.onLogMessage((logEntry) => { // logEntry is now { message: string, replace: boolean }
            const { message, replace } = logEntry;
            if (replace) {
                // Remove the last line if it exists
                const lines = logView.value.split('\n');
                if (lines.length > 0 && lines[lines.length - 1] === '') { // Remove empty last line if present
                    lines.pop();
                }
                if (lines.length > 0) {
                    lines.pop(); // Remove the actual last line to be replaced
                }
                logView.value = lines.join('\n');
                if (logView.value.length > 0) {
                    logView.value += '\n'; // Add newline if there are existing lines
                }
                logView.value += message; // Add the new message
            } else {
                if (logView.value.length > 0) {
                    logView.value += '\n'; // Add newline if not empty
                }
                logView.value += message; // Append new message
            }
            logView.scrollTop = logView.scrollHeight; // Auto-scroll to bottom
        });
    }
}

function initTestButtons() {
    // Find the test button by its ID
    const testBtn = document.getElementById('test-log-btn');
    if (testBtn) {
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

    await initialSetupAllTabs(); // Perform initial setup for all tab components once

    // Signal to main process that renderer is ready for logs
    if (window.electronAPI && typeof window.electronAPI.logging.rendererReadyForLogs === 'function') {
        window.electronAPI.logging.rendererReadyForLogs();
    }

    // Programmatically click the default tab to ensure consistent loading and trigger first refresh
    document.getElementById('tab-download').click();
}