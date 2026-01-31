// Electron/renderer/js/runstep/index.js

import { createItemClickHandler } from './selectionHandler.js';
import { OriginSection } from './section/originSection.js';
import { SplitSection } from './section/splitSection.js';
import { TranslateSection } from './section/translateSection.js';
import { CombineSection } from './section/combineSection.js';
import { ResultSection } from './section/resultSection.js';

const pathMapping = {
    '원본': { api: 'getSubtitleFiles', extensions: ['.srt', '.vtt'], type: 'flat' },
    '스플릿': { api: 'getSplitFiles', type: 'nested' },
    '번역': { api: 'getTranslatedFiles', type: 'nested' },
    '합치기': { api: 'getCombineFiles', type: 'flat' },
    '결과': { api: 'getResultFiles', type: 'flat' },
};

export async function initializeRunstepTab() {
    const sections = document.querySelectorAll('#runstep-content .section-frame');
    const handleItemClick = createItemClickHandler(pathMapping);
    const sectionInstances = {};

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '원본':
                sectionInstances[sectionName] = new OriginSection(section, handleItemClick);
                break;
            case '스플릿':
                sectionInstances[sectionName] = new SplitSection(section, handleItemClick);
                break;
            case '번역':
                sectionInstances[sectionName] = new TranslateSection(section, handleItemClick);
                break;
            case '합치기':
                sectionInstances[sectionName] = new CombineSection(section, handleItemClick);
                break;
            case '결과':
                sectionInstances[sectionName] = new ResultSection(section, handleItemClick);
                break;
            default:
                console.warn(`Unknown section in runstep tab: ${sectionName}`);
                break;
        }
    }

    // Connect sections that need to communicate
    if (sectionInstances['원본'] && sectionInstances['스플릿']) {
        sectionInstances['원본'].setSplitSection(sectionInstances['스플릿']);
    }
}
