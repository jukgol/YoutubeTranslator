// Electron/renderer/js/runstep/section/combineSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';

export class CombineSection {
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
        setupOpenFolderButton(this.#openFolderButton, 'getAppCombineDirectory');

        this.#processButton.addEventListener('click', () => {
            console.log('Timeline creation process started for selected items.');
            // 기능 연결은 추후에 진행
        });
    }

    async #loadList() {
        try {
            const data = await window.electronAPI.paths.getCombineFiles();
            renderFlatList(this.#listField, data, '합치기', this.#handleItemClick);
        } catch (error) {
            console.error('Error loading combine files:', error);
            this.#listField.innerHTML = `<div class="error-message">합치기 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
