// Electron/renderer/js/runstep/index.js

import { createItemClickHandler } from './selectionHandler.js';
import { renderFlatList, renderNestedList } from './listRenderers.js';
import { setupOpenOriginFolderButton } from './section/originButtonHandlers.js';
import { setupOpenSplitFolderButton } from './section/splitButtonHandlers.js';
import { setupOpenTranslateFolderButton } from './section/translateButtonHandlers.js';
import { setupOpenCombineFolderButton } from './section/combineButtonHandlers.js';
import { setupOpenResultFolderButton } from './section/resultButtonHandlers.js';

const pathMapping = {
    '원본': { api: 'getSubtitleFiles', extensions: ['.srt', '.vtt'], type: 'flat' }, // 변경
    '스플릿': { api: 'getSplitFiles', type: 'nested' }, // 변경
    '번역': { api: 'getTranslatedFiles', type: 'nested' }, // 변경
    '합치기': { api: 'getCombineFiles', type: 'flat' }, // 변경
    '결과': { api: 'getResultFiles', type: 'flat' },    // 변경
};

const handleItemClick = createItemClickHandler(pathMapping); // Create the handler with pathMapping

export async function initializeRunstepTab() {
    const sections = document.querySelectorAll('.section-frame');

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        const listField = section.querySelector('.list-field');
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim(); // "1. 원본" -> "원본"

        // Setup "Open Folder" buttons
        switch (sectionName) {
            case '원본':
                setupOpenOriginFolderButton(section);
                break;
            case '스플릿':
                setupOpenSplitFolderButton(section);
                break;
            case '번역':
                setupOpenTranslateFolderButton(section);
                break;
            case '합치기':
                setupOpenCombineFolderButton(section);
                break;
            case '결과':
                setupOpenResultFolderButton(section);
                break;
        }

        if (pathMapping[sectionName]) {
            const { api, type } = pathMapping[sectionName];
            try {
                let data;
                if (type === 'flat') {
                    data = await window.electronAPI.paths[api](); // 변경
                    renderFlatList(listField, data, sectionName, handleItemClick); // Pass handleItemClick
                } else if (type === 'nested') {
                    data = await window.electronAPI.paths[api](); // 변경
                    renderNestedList(listField, data, sectionName, handleItemClick); // Pass handleItemClick
                }
            } catch (error) {
                console.error(`Error fetching data for ${sectionName}:`, error);
                listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading data: ${error.message}</div>`;
            }
        }
    }
}
