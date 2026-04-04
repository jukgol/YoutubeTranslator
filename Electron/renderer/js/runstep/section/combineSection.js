// Electron/renderer/js/runstep/section/combineSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class CombineSection {
    #element;
    #listField;
    #openFolderButton;
    #clearFolderButton;
    #processButton;
    #sectionName = '합치기';
    #resultSection = null;

    constructor(element) {
        this.#element = element;

        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#clearFolderButton = this.#element.querySelector('.clear-folder-button');
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

        this.#clearFolderButton.addEventListener('click', async () => {
            if (!confirm('합치기 폴더를 비우시겠습니까? 모든 파일이 삭제됩니다.')) return;

            try {
                const dirPath = await window.electronAPI.paths.getAppCombineDirectory();
                const result = await window.electronAPI.fs.emptyDir(dirPath);
                if (result.success) {
                    log('합치기 폴더를 비웠습니다.');
                    this.refresh();
                } else {
                    log(`[Error] 폴더 비우기 실패: ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 폴더 비우기 중 예외 발생: ${error.message}`);
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
