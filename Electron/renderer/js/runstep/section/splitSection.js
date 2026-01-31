// Electron/renderer/js/runstep/section/splitSection.js

import { renderNestedList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class SplitSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #sectionName = '스플릿';

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppSplitDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Translate process started for selected items.');
            // 기능 연결은 추후에 진행
        });

        this.#listField.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li[data-type]');
            if (!clickedLi) return;

            let elementToHighlight = null;

            if (clickedLi.dataset.type === 'file') {
                elementToHighlight = clickedLi.closest('li[data-type="folder"]');
            } else if (clickedLi.dataset.type === 'folder') {
                elementToHighlight = clickedLi;
            }

            if (!elementToHighlight) return;

            const previousSelected = currentSelectedElements.get(this.#sectionName);
            if (previousSelected && previousSelected !== elementToHighlight) {
                removeHighlight(previousSelected, true);
            }

            applyHighlight(elementToHighlight, true);
            currentSelectedElements.set(this.#sectionName, elementToHighlight);

            const type = elementToHighlight.dataset.type;
            const data = elementToHighlight.dataset.data;
            log(`선택됨 (${this.#sectionName}): 유형=${type}, 데이터=${data}`);
        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getSplitFiles();
            renderNestedList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading split files:', error);
            this.#listField.innerHTML = `<div class="error-message">스플릿 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
