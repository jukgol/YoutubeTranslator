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
    #translateSection = null;

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    setTranslateSection(translateSection) {
        this.#translateSection = translateSection;
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppSplitDirectory');

        this.#processButton.addEventListener('click', async () => {
            const selectedEl = currentSelectedElements.get(this.#sectionName);
            if (!selectedEl) {
                log('번역을 시작할 폴더를 선택해주세요.');
                return;
            }

            const folderName = JSON.parse(selectedEl.dataset.data);
            if (!folderName) {
                log('선택된 폴더의 정보를 찾을 수 없습니다.');
                return;
            }

            this.#processButton.disabled = true;
            log(`'${folderName}' 폴더의 번역을 시작합니다.`);
            
            try {
                const result = await window.electronAPI.process.runTranslation(folderName);
                if (result.success) {
                    log(result.message);
                    if (result.translatedFolder) {
                        log(`생성된 번역 폴더: ${result.translatedFolder}`);
                    }
                    if (this.#translateSection) {
                        log('번역 섹션을 새로고침합니다.');
                        this.#translateSection.refresh();
                    }
                } else {
                    log(`[Error] ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 번역 작업 중 예외가 발생했습니다: ${error.message}`);
            } finally {
                this.#processButton.disabled = false;
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
