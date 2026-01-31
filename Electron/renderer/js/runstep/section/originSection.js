// Electron/renderer/js/runstep/section/originSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class OriginSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #handleItemClick;
    #splitSection = null;

    constructor(element, handleItemClick) {
        this.#element = element;
        this.#handleItemClick = handleItemClick;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.#loadList();
    }

    setSplitSection(splitSection) {
        this.#splitSection = splitSection;
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppOriginDirectory');
        
        this.#processButton.addEventListener('click', async () => {
            const selectedEl = currentSelectedElements.get('원본');
            if (!selectedEl) {
                log('분리할 파일을 선택해주세요.');
                return;
            }

            const filename = JSON.parse(selectedEl.dataset.data);
            if (!filename) {
                log('선택된 파일의 정보를 찾을 수 없습니다.');
                return;
            }

            log(`'${filename}' 파일 분할을 시작합니다.`);
            
            try {
                const result = await window.electronAPI.process.runSplit(filename);
                if (result.success) {
                    log(result.message);
                    if (this.#splitSection) {
                        log('스플릿 섹션을 새로고침합니다.');
                        this.#splitSection.refresh();
                    }
                } else {
                    log(`[Error] ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 분할 작업 중 예외가 발생했습니다: ${error.message}`);
            }
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
