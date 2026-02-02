// Electron/renderer/js/runstep/section/translateSection.js

import { renderNestedList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class TranslateSection {
    #element;
    #listField;
    #openFolderButton;
    #processButton;
    #sectionName = '번역';
    #combineSection = null;

    constructor(element) {
        this.#element = element;

        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    setCombineSection(combineSection) {
        this.#combineSection = combineSection;
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppTranslateDirectory');

        this.#processButton.addEventListener('click', async () => {
            const selectedEl = currentSelectedElements.get(this.#sectionName);
            if (!selectedEl) {
                log('파트 합치기를 진행할 폴더를 선택해주세요.');
                return;
            }

            const folderName = JSON.parse(selectedEl.dataset.data);
            if (!folderName) {
                log('선택된 폴더의 정보를 찾을 수 없습니다.');
                return;
            }

            log(`'${folderName}' 폴더의 파트 합치기를 시작합니다.`);

            try {
                const result = await window.electronAPI.process.runCombine(folderName);
                if (result.success) {
                    log(result.message);
                    if (result.combinedFile) {
                        log(`생성된 합치기 파일: ${result.combinedFile}`);
                    }
                    if (this.#combineSection) {
                        log('합치기 섹션을 새로고침합니다.');
                        this.#combineSection.refresh();
                    }
                } else {
                    log(`[Error] ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 파트 합치기 작업 중 예외가 발생했습니다: ${error.message}`);
            }
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

        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getTranslatedFiles();
            renderNestedList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading translated files:', error);
            this.#listField.innerHTML = `<div class="error-message">번역 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
