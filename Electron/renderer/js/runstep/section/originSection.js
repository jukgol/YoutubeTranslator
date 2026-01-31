// Electron/renderer/js/runstep/section/originSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';

export class OriginSection {
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
        setupOpenFolderButton(this.#openFolderButton, 'getAppOriginDirectory');
        
        this.#processButton.addEventListener('click', () => {
            console.log('Split process started for selected items.');
            // 기능 연결은 추후에 진행
        });
    }

    async #loadList() {
        try {
            const data = await window.electronAPI.paths.getSubtitleFiles();
            renderFlatList(this.#listField, data, '원본', this.#handleItemClick);
        } catch (error) {
            console.error('Error loading origin files:', error);
            this.#listField.innerHTML = `<div class="error-message">원본 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
