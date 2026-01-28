// Electron/renderer/js/download/index.js

import { createItemClickHandler } from './selectionHandler.js';
import { renderFlatList } from './listRenderers.js'; // Only renderFlatList for download tab

const downloadPathMapping = { // Renamed to avoid conflict with detail's pathMapping
    '영상 폴더 목록': { api: 'pathGetVideoFiles', type: 'flat' },
    '자막 폴더 목록': { api: 'pathGetSubtitleFiles', type: 'flat' },
};

const handleItemClick = createItemClickHandler(); // Create the handler without pathMapping for simplicity as it's always flat

export async function initializeDownloadTab() {
    const sections = document.querySelectorAll('#download-content .section-frame'); // Target sections within download-content

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        const listField = section.querySelector('.list-field');
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim(); // "1. 영상 다운로드" -> "영상 다운로드"

        if (downloadPathMapping[sectionName] && listField) { // Ensure listField exists and is mapped
            const { api, type } = downloadPathMapping[sectionName];
            
            // For the "영상 다운로드" section with id="downloadUrlList", we skip processing with file APIs
            if (sectionName === '영상 다운로드' && listField.id === 'downloadUrlList') {
                // This section might be handled differently, e.g., for showing entered URLs
                console.log(`[Download Tab] Skipping file list processing for "${sectionName}" as it's for URLs.`);
                continue; 
            }

            try {
                let data;
                if (type === 'flat') {
                    data = await window.electronAPI[api]();
                    renderFlatList(listField, data, sectionName, handleItemClick);
                }
                // No nested lists for download tab, so no else if for 'nested' type
            } catch (error) {
                console.error(`Error fetching data for ${sectionName}:`, error);
                listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading data: ${error.message}</div>`;
            }
        }
    }
}
