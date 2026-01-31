// Electron/renderer/js/runstep/index.js

import { OriginSection } from './section/originSection.js';
import { SplitSection } from './section/splitSection.js';
import { TranslateSection } from './section/translateSection.js';
import { CombineSection } from './section/combineSection.js';
import { ResultSection } from './section/resultSection.js';

export async function initializeRunstepTab() {
    const sections = document.querySelectorAll('#runstep-content .section-frame');
    const sectionInstances = {};

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '원본':
                sectionInstances[sectionName] = new OriginSection(section);
                break;
            case '스플릿':
                sectionInstances[sectionName] = new SplitSection(section);
                break;
            case '번역':
                sectionInstances[sectionName] = new TranslateSection(section);
                break;
            case '합치기':
                sectionInstances[sectionName] = new CombineSection(section);
                break;
            case '결과':
                sectionInstances[sectionName] = new ResultSection(section);
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
    if (sectionInstances['번역'] && sectionInstances['합치기']) {
        sectionInstances['번역'].setCombineSection(sectionInstances['합치기']);
    }
    if (sectionInstances['합치기'] && sectionInstances['결과']) {
        sectionInstances['합치기'].setResultSection(sectionInstances['결과']);
    }
}
