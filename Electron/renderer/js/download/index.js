// Electron/renderer/js/download/index.js

// 새로 생성한 섹션 컴포넌트들 import
import { DownloadSection } from './section/downloadSection.js';
import { VideoFileSection } from './section/videoFileSection.js';
import { SubtitleFileSection } from './section/subtitleFileSection.js';
import { CompleteSection } from './section/completeSection.js';

export async function initializeDownloadTab() {
    const sections = document.querySelectorAll('#download-content .section-frame');
    const sectionInstances = {};

    // First pass: instantiate all section classes
    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '영상 다운로드':
                sectionInstances.download = new DownloadSection(section);
                break;
            case '영상 다운완료':
                sectionInstances.complete = new CompleteSection(section);
                break;
            case '영상 폴더':
                sectionInstances.videoFiles = new VideoFileSection(section);
                break;
            case '자막 폴더':
                sectionInstances.subtitleFiles = new SubtitleFileSection(section);
                break;
            default:
                console.warn(`Unknown section in download tab: ${sectionName}`);
                break;
        }
    }

    // Second pass: connect dependencies
    if (sectionInstances.download && sectionInstances.complete) {
        sectionInstances.download.completeSection = sectionInstances.complete;
    }
}
