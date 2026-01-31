// Electron/renderer/js/runall/index.js

import { OriginalDataSection } from './section/originalDataSection.js';
import { QueueSection } from './section/queueSection.js';
import { ProgressSection } from './section/progressSection.js';
import { ResultSection } from './section/resultSection.js';

export async function initializeRunallTab() {
    console.log('[RunallTab] Initializing...');

    const runallContent = document.getElementById('runall-content');
    if (!runallContent) {
        console.error('Runall content not found');
        return;
    }

    const sectionElements = runallContent.querySelectorAll('.section-frame');
    const sectionsMap = {};

    sectionElements.forEach(sectionEl => {
        const header = sectionEl.querySelector('.section-header');
        if (!header) return;
        
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch(sectionName) {
            case '원본 데이터':
                sectionsMap.originalDataEl = sectionEl;
                break;
            case '작업 큐':
                sectionsMap.queueEl = sectionEl;
                break;
            case '진행 상태':
                sectionsMap.progressEl = sectionEl;
                break;
            case '최종 결과':
                sectionsMap.finalResultEl = sectionEl;
                break;
            default:
                console.warn(`Unknown section in runall tab: ${sectionName}`);
                break;
        }
    });

    // Explicitly instantiate sections with dependencies
    const queueSection = new QueueSection(sectionsMap.queueEl);
    const originalDataSection = new OriginalDataSection(sectionsMap.originalDataEl, queueSection);
    const progressSection = new ProgressSection(sectionsMap.progressEl, originalDataSection);
    const resultSection = new ResultSection(sectionsMap.finalResultEl);


    console.log('[RunallTab] All sections initialized.');
}
