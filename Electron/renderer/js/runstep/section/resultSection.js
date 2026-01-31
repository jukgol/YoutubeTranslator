// Electron/renderer/js/runstep/section/resultSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';

export class ResultSection {
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
        setupOpenFolderButton(this.#openFolderButton, 'getAppResultDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Final confirmation process started.');
            // 기능 연결은 추후에 진행
        });
    }

    async #loadList() {
        try {
            const data = await window.electronAPI.paths.getResultFiles();
            renderFlatList(this.#listField, data, '결과', this.#handleItemClick);
        } catch (error) {
            console.error('Error loading result files:', error);
            this.#listField.innerHTML = `<div class="error-message">결과 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
