// Electron/renderer/js/runall/index.js

import { OriginalDataSection } from './section/originalDataSection.js';
import { QueueSection } from './section/queueSection.js';
import { ProgressSection } from './section/progressSection.js';
import { ResultSection } from './section/resultSection.js';

let originalDataSectionInstance = null;
let resultSectionInstance = null;
let progressSectionInstance = null; // Also store progressSection instance
let queueSectionInstance = null; // And queueSection instance

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
    progressSectionInstance = new ProgressSection(sectionsMap.progressEl); // progressSection no longer needs originalDataSection
    queueSectionInstance = new QueueSection(sectionsMap.queueEl); // Store instance
    queueSectionInstance.setProgressSection(progressSectionInstance); // Inject progressSection into queueSection
    originalDataSectionInstance = new OriginalDataSection(sectionsMap.originalDataEl, queueSectionInstance); // Pass stored instance
    resultSectionInstance = new ResultSection(sectionsMap.finalResultEl); // Store instance

    console.log('[RunallTab] All sections initialized.');
}

export async function refreshRunallTab() {
    if (originalDataSectionInstance) {
        await originalDataSectionInstance.refresh();
    }
    if (resultSectionInstance) {
        await resultSectionInstance.refresh();
    }
    // Note: progressSection and queueSection do not have a 'refresh' method for file lists
    // as per the user's initial request.
}

