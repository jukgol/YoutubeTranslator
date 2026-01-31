// Electron/renderer/js/runstep/section/combineSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class CombineSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #sectionName = '합치기';

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppCombineDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Timeline creation process started for selected items.');
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
            const data = await window.electronAPI.paths.getCombineFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading combine files:', error);
            this.#listField.innerHTML = `<div class="error-message">합치기 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
