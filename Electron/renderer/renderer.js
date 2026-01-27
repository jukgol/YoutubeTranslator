import { loadComponent } from './js/componentLoader.js';
import { initializeUI } from './js/uiManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tabsPlaceholder = document.getElementById('tabs-placeholder');
    const contentPlaceholder = document.getElementById('tab-content-placeholder');
    const logPlaceholder = document.getElementById('log-view-placeholder');

    if (tabsPlaceholder && contentPlaceholder && logPlaceholder) {
        // 1. Load the three main sections
        await loadComponent('components/tabs_bar/tabs_bar.html', tabsPlaceholder);
        await loadComponent('components/tab_content/tab_content.html', contentPlaceholder);
        await loadComponent('components/log/log.html', logPlaceholder);

        // 2. After the main sections are loaded, load the content for all tabs
        const basicContent = document.getElementById('basic-content');
        if (basicContent) {
            await loadComponent('components/tab_content/basic_tab_content.html', basicContent);
        }
        const downloadContent = document.getElementById('download-content');
        if (downloadContent) {
            await loadComponent('components/tab_content/download_tab_content.html', downloadContent);
        }
        const detailContent = document.getElementById('detail-content');
        if (detailContent) {
            await loadComponent('components/tab_content/detail_tab_content.html', detailContent);
        }
        const settingsContent = document.getElementById('settings-content');
        if (settingsContent) {
            await loadComponent('components/tab_content/settings_tab_content.html', settingsContent);
        }
        
        // 3. After all content is loaded, initialize the UI event listeners
        initializeUI();
    }
});
