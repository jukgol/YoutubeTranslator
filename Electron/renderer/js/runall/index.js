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

    const sections = runallContent.querySelectorAll('.section-frame');
    const sectionInstances = {};

    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        if (!header) return;
        
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch(sectionName) {
            case '원본 데이터':
                sectionInstances.originalData = new OriginalDataSection(section);
                break;
            case '작업 큐':
                sectionInstances.queue = new QueueSection(section);
                break;
            case '진행 상태':
                sectionInstances.progress = new ProgressSection(section);
                break;
            case '최종 결과':
                sectionInstances.finalResult = new ResultSection(section);
                break;
            default:
                console.warn(`Unknown section in runall tab: ${sectionName}`);
                break;
        }
    });

    console.log('[RunallTab] All sections initialized.');
    // In the future, connections between sections can be made here.
    // e.g., sectionInstances.originalData.setQueue(sectionInstances.queue);
}
