// Electron/renderer/js/runstep/section/originSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class OriginSection {
    #element;
    #listField;
    #openFolderButton;
    #clearFolderButton;
    #processButton;
    #splitSection = null;
    #sectionName = '원본';

    constructor(element) {
        this.#element = element;

        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#clearFolderButton = this.#element.querySelector('.clear-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    setSplitSection(splitSection) {
        this.#splitSection = splitSection;
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppOriginDirectory');

        this.#processButton.addEventListener('click', async () => {
            const selectedEl = currentSelectedElements.get(this.#sectionName);
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
                    if (result.createdFolder) {
                        log(`생성된 폴더: ${result.createdFolder}`);
                    }
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

        this.#clearFolderButton.addEventListener('click', async () => {
            if (!confirm('원본 폴더를 비우시겠습니까? 모든 파일이 삭제됩니다.')) return;

            try {
                const dirPath = await window.electronAPI.paths.getAppOriginDirectory();
                const result = await window.electronAPI.fs.emptyDir(dirPath);
                if (result.success) {
                    log('원본 폴더를 비웠습니다.');
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
            const data = await window.electronAPI.paths.getSubtitleFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading origin files:', error);
            this.#listField.innerHTML = `<div class="error-message">원본 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
