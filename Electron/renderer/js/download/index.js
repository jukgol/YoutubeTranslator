// Electron/renderer/js/download/index.js

// 새로 생성한 섹션 컴포넌트들 import
import { DownloadSection } from './section/downloadSection.js';
import { AddListSection } from './section/addListSection.js';
import { VideoFileSection } from './section/videoFileSection.js';
import { SubtitleFileSection } from './section/subtitleFileSection.js';
import { CompleteSection } from './section/completeSection.js';

let videoFileSectionInstance = null;
let subtitleFileSectionInstance = null;
let downloadSectionInstance = null;
let addListSectionInstance = null;
let completeSectionInstance = null;

export async function initializeDownloadTab() {
    const sections = document.querySelectorAll('#download-content .section-frame');
    
    // First pass: instantiate all section classes
    for (const section of sections) {
        const header = section.querySelector('.section-header');
        if (!header) continue;

        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim();

        switch (sectionName) {
            case '영상 리스트 추가':
                addListSectionInstance = new AddListSection(section);
                break;
            case '영상 다운로드':
                downloadSectionInstance = new DownloadSection(section);
                break;
            case '영상 다운완료':
                completeSectionInstance = new CompleteSection(section);
                break;
            case '영상 폴더':
                videoFileSectionInstance = new VideoFileSection(section);
                break;
            case '자막 폴더':
                subtitleFileSectionInstance = new SubtitleFileSection(section);
                break;
            default:
                console.warn(`Unknown section in download tab: ${sectionName}`);
                break;
        }
    }

    // Second pass: connect dependencies
    if (downloadSectionInstance && completeSectionInstance) {
        downloadSectionInstance.completeSection = completeSectionInstance;
    }
}

export async function refreshDownloadTab() {
    if (videoFileSectionInstance) {
        await videoFileSectionInstance.refresh();
    }
    if (subtitleFileSectionInstance) {
        await subtitleFileSectionInstance.refresh();
    }
    // Optionally refresh other sections like downloadSectionInstance, completeSectionInstance if they have refresh methods
    // For now, focusing on file list sections as per user request.
}

