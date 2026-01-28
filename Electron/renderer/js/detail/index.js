// Electron/renderer/js/detail/index.js

import { createItemClickHandler } from './selectionHandler.js';
import { renderFlatList, renderNestedList } from './listRenderers.js';

const pathMapping = {
    '원본': { api: 'pathGetSubtitleFiles', extensions: ['.srt', '.vtt'], type: 'flat' },
    '스플릿': { api: 'pathGetSplitFiles', type: 'nested' },
    '번역': { api: 'pathGetTranslatedFiles', type: 'nested' },
    '합치기': { api: 'pathGetCombineFiles', type: 'flat' }, // Changed to flat
    '결과': { api: 'pathGetResultFiles', type: 'flat' },    // Changed to flat
};

const handleItemClick = createItemClickHandler(pathMapping); // Create the handler with pathMapping

export async function initializeDetailTab() {
    const sections = document.querySelectorAll('.section-frame');

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        const listField = section.querySelector('.list-field');
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim(); // "1. 원본" -> "원본"

        if (pathMapping[sectionName]) {
            const { api, type } = pathMapping[sectionName];
            try {
                let data;
                if (type === 'flat') {
                    data = await window.electronAPI[api]();
                    renderFlatList(listField, data, sectionName, handleItemClick); // Pass handleItemClick
                } else if (type === 'nested') {
                    data = await window.electronAPI[api]();
                    renderNestedList(listField, data, sectionName, handleItemClick); // Pass handleItemClick
                }
            } catch (error) {
                console.error(`Error fetching data for ${sectionName}:`, error);
                listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading data: ${error.message}</div>`;
            }
        }
    }
}
