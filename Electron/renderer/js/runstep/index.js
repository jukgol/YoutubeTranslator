// Electron/renderer/js/runstep/index.js

import { OriginSection } from './section/originSection.js';
import { SplitSection } from './section/splitSection.js';
import { TranslateSection } from './section/translateSection.js';
import { CombineSection } from './section/combineSection.js';
import { ResultSection } from './section/resultSection.js';

let originSectionInstance = null;
let splitSectionInstance = null;
let translateSectionInstance = null;
let combineSectionInstance = null;
let resultSectionInstance = null;

export async function initializeRunstepTab() {
    const sections = document.querySelectorAll('#runstep-content .section-frame');
    const sectionInstances = {};

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '원본':
                originSectionInstance = new OriginSection(section);
                sectionInstances[sectionName] = originSectionInstance;
                break;
            case '스플릿':
                splitSectionInstance = new SplitSection(section);
                sectionInstances[sectionName] = splitSectionInstance;
                break;
            case '번역':
                translateSectionInstance = new TranslateSection(section);
                sectionInstances[sectionName] = translateSectionInstance;
                break;
            case '합치기':
                combineSectionInstance = new CombineSection(section);
                sectionInstances[sectionName] = combineSectionInstance;
                break;
            case '결과':
                resultSectionInstance = new ResultSection(section);
                sectionInstances[sectionName] = resultSectionInstance;
                break;
            default:
                console.warn(`Unknown section in runstep tab: ${sectionName}`);
                break;
        }
    }

    // Connect sections that need to communicate
    if (originSectionInstance && splitSectionInstance) {
        originSectionInstance.setSplitSection(splitSectionInstance);
    }
    if (splitSectionInstance && translateSectionInstance) {
        splitSectionInstance.setTranslateSection(translateSectionInstance);
    }
    if (translateSectionInstance && combineSectionInstance) {
        translateSectionInstance.setCombineSection(combineSectionInstance);
    }
    if (combineSectionInstance && resultSectionInstance) {
        combineSectionInstance.setResultSection(resultSectionInstance);
    }
}

export async function refreshRunstepTab() {
    if (originSectionInstance) {
        await originSectionInstance.refresh();
    }
    if (splitSectionInstance) {
        await splitSectionInstance.refresh();
    }
    if (translateSectionInstance) {
        await translateSectionInstance.refresh();
    }
    if (combineSectionInstance) {
        await combineSectionInstance.refresh();
    }
    if (resultSectionInstance) {
        await resultSectionInstance.refresh();
    }
}
