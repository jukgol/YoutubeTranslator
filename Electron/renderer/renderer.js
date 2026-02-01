import { loadComponent } from './js/componentLoader.js';
import { initializeUI } from './js/uiManager.js';
// Removed unused imports for detail and download initializers

document.addEventListener('DOMContentLoaded', async () => {
    const tabsPlaceholder = document.getElementById('tabs-placeholder');
    const contentPlaceholder = document.getElementById('tab-content-placeholder');
    const logPlaceholder = document.getElementById('log-view-placeholder');

    if (tabsPlaceholder && contentPlaceholder && logPlaceholder) {
        // [기존 코드 유지] 1. Load the three main sections
        await loadComponent('components/tabs_bar/tabs_bar.html', tabsPlaceholder);
        await loadComponent('components/tab_content/tab_content.html', contentPlaceholder);
        await loadComponent('components/log/log.html', logPlaceholder);

        // [기존 코드 유지] 2. After the main sections are loaded, load the content for all tabs
        const runallContent = document.getElementById('runall-content');
        if (runallContent) {
            await loadComponent('components/tab_content/runall_tab_content.html', runallContent);
        }
        const downloadContent = document.getElementById('download-content');
        if (downloadContent) {
            await loadComponent('components/tab_content/download_tab_content.html', downloadContent);
        }
        const subtitleContent = document.getElementById('subtitle-content');
        if (subtitleContent) {
            await loadComponent('components/tab_content/subtitle_tab_content.html', subtitleContent);
        }
        const runstepContent = document.getElementById('runstep-content');
        if (runstepContent) {
            await loadComponent('components/tab_content/runstep_tab_content.html', runstepContent);
        }
        const settingsContent = document.getElementById('settings-content');
        if (settingsContent) {
            await loadComponent('components/tab_content/settings_tab_content.html', settingsContent);
        }
        await initializeUI();

        // --- 여기서부터 로딩 화면 전환 로직 ---
        const loadingOverlay = document.getElementById('loading-overlay');
        const appContainer = document.querySelector('.app-container');

        if (loadingOverlay && appContainer) {
            loadingOverlay.style.display = 'none';      // 로딩 레이어 숨김
            appContainer.classList.remove('hidden');    // 메인 컨텐츠 표시
        }
    }
});