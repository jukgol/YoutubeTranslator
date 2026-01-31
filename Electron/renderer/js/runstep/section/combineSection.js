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
    #resultSection = null;

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    setResultSection(resultSection) {
        this.#resultSection = resultSection;
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppCombineDirectory');

        this.#processButton.addEventListener('click', async () => {
            const selectedEl = currentSelectedElements.get(this.#sectionName);
            if (!selectedEl) {
                log('타임라인을 생성할 파일을 선택해주세요.');
                return;
            }

            const filename = JSON.parse(selectedEl.dataset.data);
            if (!filename) {
                log('선택된 파일의 정보를 찾을 수 없습니다.');
                return;
            }

            log(`'${filename}' 파일의 타임라인 생성을 시작합니다.`);
            
            try {
                const result = await window.electronAPI.process.runTimeline(filename);
                if (result.success) {
                    log(result.message);
                    if (result.finalSrtFile) {
                        log(`생성된 최종 SRT 파일: ${result.finalSrtFile}`);
                    }
                    if (this.#resultSection) {
                        log('결과 섹션을 새로고침합니다.');
                        this.#resultSection.refresh();
                    }
                } else {
                    log(`[Error] ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 타임라인 생성 작업 중 예외가 발생했습니다: ${error.message}`);
            }
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
