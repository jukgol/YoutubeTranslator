// Electron/renderer/js/download/index.js

// 새로 생성한 섹션 컴포넌트들 import
import { DownloadSection } from './section/downloadSection.js';
import { VideoFileSection } from './section/videoFileSection.js';
import { SubtitleFileSection } from './section/subtitleFileSection.js';

export async function initializeDownloadTab() {
    const sections = document.querySelectorAll('#download-content .section-frame'); // Target sections within download-content

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '영상 다운로드':
                new DownloadSection(section);
                break;
            case '영상 폴더 목록':
                new VideoFileSection(section);
                break;
            case '자막 폴더 목록':
                new SubtitleFileSection(section);
                break;
            default:
                console.warn(`Unknown section in download tab: ${sectionName}`);
                break;
        }
    }
}
