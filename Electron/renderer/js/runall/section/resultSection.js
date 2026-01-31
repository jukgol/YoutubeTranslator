// Electron/renderer/js/runall/section/finalResultSection.js
import { write as log } from '../../logger.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../../runstep/selectionHandler.js';
import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../../runstep/util.js';

export class ResultSection {
    #element;
    #listField;
    #moveFileBtn;
    #openFolderBtn;
    #sectionName = 'RunAll_Result'; // Unique name for selection map

    constructor(element) {
        this.#element = element;
        this.#listField = this.#element.querySelector('.list-field');
        this.#moveFileBtn = this.#element.querySelector('#move-file-btn');
        this.#openFolderBtn = this.#element.querySelector('#open-final-result-folder-button');
        
        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderBtn, 'getAppResultDirectory');

        this.#moveFileBtn.addEventListener('click', () => {
            console.log('Move File button clicked');
            // Logic to be implemented
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
            const data = await window.electronAPI.paths.getResultFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading final result files for runall:', error);
            this.#listField.innerHTML = `<div class="error-message">최종 결과 로딩 중 오류 발생</div>`;
        }
    }
}
