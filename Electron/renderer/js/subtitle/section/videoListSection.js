import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../../runstep/util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../../runstep/selectionHandler.js';
import { write as log } from '../../logger.js';

export class VideoListSection {
    #element;
    #listField;
    #openFolderBtn;
    #addToQueueBtn;
    #waitingListSection;
    #sectionName = 'Subtitle_VideoList'; // Unique name

    constructor(sectionElement, waitingListSection) {
        this.#element = sectionElement;
        this.#waitingListSection = waitingListSection;

        this.#listField = sectionElement.querySelector('#subtitleVideoList');
        this.#openFolderBtn = sectionElement.querySelector('#subtitle-open-video-folder-button');
        this.#addToQueueBtn = sectionElement.querySelector('#subtitle-add-to-queue-btn');

        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderBtn, 'getAppVideoDirectory');

        // List item click (selection)
        this.#listField.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li[data-type="file"]');
            if (!clickedLi) return;

            const previousSelected = currentSelectedElements.get(this.#sectionName);
            if (previousSelected && previousSelected !== clickedLi) {
                removeHighlight(previousSelected, false);
            }
            applyHighlight(clickedLi, false);
            currentSelectedElements.set(this.#sectionName, clickedLi);
        });

        // Add to Queue button click
        if (this.#addToQueueBtn) {
            this.#addToQueueBtn.addEventListener('click', () => {
                log('[VideoList] "Add to Queue" clicked');
                const selectedLi = currentSelectedElements.get(this.#sectionName);
                if (!selectedLi) {
                    log('[VideoList] Adding failed: No item selected');
                    return;
                }

                const fileName = selectedLi.textContent;
                log(`[VideoList] Selected file: ${fileName}`);

                if (this.#waitingListSection) {
                    this.#waitingListSection.add({ name: fileName });
                } else {
                    console.error('[VideoList] Critical Error: WaitingListSection instance is missing.');
                    log('[VideoList] Critical Error: WaitingListSection connection failed');
                }
            });
        } else {
            console.error('[VideoList] Add to Queue button not found in DOM');
        }
    }

    async refresh() {
        try {
            const files = await window.electronAPI.paths.getVideoFiles();
            // Sort files alphabetically and numerically
            files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            renderFlatList(this.#listField, files, this.#sectionName);
        } catch (error) {
            console.error('Error fetching video files:', error);
            if (this.#listField) {
                this.#listField.innerHTML = '<div class="error-message">파일을 불러오는 중 오류가 발생했습니다.</div>';
            }
        }
    }
}
