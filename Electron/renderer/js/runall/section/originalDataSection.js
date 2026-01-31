// Electron/renderer/js/runall/section/originalDataSection.js
import { write as log } from '../../logger.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../../runstep/selectionHandler.js';
import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../../runstep/util.js';

export class OriginalDataSection {
    #element;
    #listField;
    #addToQueueBtn;
    #openFolderBtn;
    #queueSection; // Added private field
    #sectionName = 'RunAll_Original'; // Unique name for selection map

    constructor(element, queueSection) { // Modified constructor
        this.#element = element;
        this.#queueSection = queueSection; // Store queueSection instance
        this.#listField = this.#element.querySelector('.list-field');
        this.#addToQueueBtn = this.#element.querySelector('#add-to-queue-btn');
        this.#openFolderBtn = this.#element.querySelector('#open-original-data-folder-button');
        
        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderBtn, 'getAppOriginDirectory');

        this.#addToQueueBtn.addEventListener('click', () => {
            const selectedLi = currentSelectedElements.get(this.#sectionName);

            if (!selectedLi) {
                log('추가할 항목을 먼저 선택하세요.');
                return;
            }

            const itemName = selectedLi.textContent;
            this.#queueSection.add({ name: itemName, status: 'pending' }); // Call add method
        });

        this.#listField.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li[data-type="file"]');
            if (!clickedLi) return;

            const previousSelected = currentSelectedElements.get(this.#sectionName);
            if (previousSelected && previousSelected !== clickedLi) {
                removeHighlight(previousSelected, false);
            }
            applyHighlight(clickedLi, false);
            currentSelectedElements.set(this.#sectionName, clickedLi);

            log(`선택됨 (${this.#sectionName}): ${clickedLi.textContent}`);
        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getSubtitleFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading original data files for runall:', error);
            this.#listField.innerHTML = `<div class="error-message">원본 데이터 로딩 중 오류 발생</div>`;
        }
    }
}
