// Electron/renderer/js/runstep/section/translateSection.js

import { renderNestedList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';

export class TranslateSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #handleItemClick;

    constructor(element, handleItemClick) {
        this.#element = element;
        this.#handleItemClick = handleItemClick;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.#loadList();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppTranslateDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Combine process started for selected items.');
            // 기능 연결은 추후에 진행
        });
    }

    async #loadList() {
        try {
            const data = await window.electronAPI.paths.getTranslatedFiles();
            renderNestedList(this.#listField, data, '번역', this.#handleItemClick);
        } catch (error) {
            console.error('Error loading translated files:', error);
            this.#listField.innerHTML = `<div class="error-message">번역 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
