// Electron/renderer/js/runstep/section/resultSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class ResultSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #sectionName = '결과';

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppResultDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Final confirmation process started.');
            // 기능 연결은 추후에 진행
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

            const type = clickedLi.dataset.type;
            const data = clickedLi.dataset.data;
            log(`선택됨 (${this.#sectionName}): 유형=${type}, 데이터=${data}`);
        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getResultFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading result files:', error);
            this.#listField.innerHTML = `<div class="error-message">결과 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
