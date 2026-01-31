// Electron/renderer/js/runstep/section/splitSection.js

import { renderNestedList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';

export class SplitSection {
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
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppSplitDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Translate process started for selected items.');
            // 기능 연결은 추후에 진행
        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getSplitFiles();
            renderNestedList(this.#listField, data, '스플릿', this.#handleItemClick);
        } catch (error) {
            console.error('Error loading split files:', error);
            this.#listField.innerHTML = `<div class="error-message">스플릿 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
