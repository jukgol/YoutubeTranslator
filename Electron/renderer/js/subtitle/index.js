import { VideoListSection } from './section/videoListSection.js';
import { OriginSection } from './section/originSection.js';
import { WaitingListSection } from './section/waitingListSection.js';
import { ProgressSection } from './section/progressSection.js';
import { write as log } from '../logger.js';

let videoListSectionInstance = null;
let originSectionInstance = null;
let waitingListSectionInstance = null;
let progressSectionInstance = null;

export async function initializeSubtitleTab() {
    const sections = document.querySelectorAll('#subtitle-content .section-frame');

    // Convert NodeList to Array for easier searching
    const sectionArray = Array.from(sections);

    // Helper to find section by header name
    const findSection = (namePart) => {
        return sectionArray.find(el => {
            const header = el.querySelector('.section-header');
            return header && header.textContent.includes(namePart);
        });
    };

    const videoListEl = findSection('1. 영상목록'); // Or just '영상목록'
    const waitingListEl = findSection('2. 대기 리스트');
    const progressEl = findSection('3. 진행사항');
    const originEl = findSection('4. 원본 자막');

    // Instantiate in dependency order

    // 1. Waiting List (Independent)
    if (waitingListEl) {
        waitingListSectionInstance = new WaitingListSection(waitingListEl);
    } else {
        log.error('[SubtitleTab] Waiting List element NOT FOUND. WaitingListSection could not be initialized.');
    }

    // 2. Video List (Depends on Waiting List)
    if (videoListEl) {
        videoListSectionInstance = new VideoListSection(videoListEl, waitingListSectionInstance);
    } else {
        log.error('[SubtitleTab] Video List element NOT FOUND');
    }

    // 3. Progress (Independent)
    if (progressEl) {
        progressSectionInstance = new ProgressSection(progressEl);
    } else {
        log.error('[SubtitleTab] Progress element NOT FOUND');
    }

    // 4. Origin (Independent)
    if (originEl) {
        originSectionInstance = new OriginSection(originEl);
    }
}

export async function refreshSubtitleTab() {
    if (videoListSectionInstance) {
        await videoListSectionInstance.refresh();
    }
    if (originSectionInstance) {
        await originSectionInstance.refresh();
    }
    if (waitingListSectionInstance) {
        await waitingListSectionInstance.refresh();
    }
    if (progressSectionInstance) {
        await progressSectionInstance.refresh();
    }
}
