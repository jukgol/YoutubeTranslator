// Electron/renderer/js/runstep/section/resultSection.js

import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class ResultSection {
    #element;
    #listField;
    #openFolderButton;
    #clearFolderButton;
    #processButton;
    #sectionName = '결과';

    constructor(element) {
        this.#element = element;

        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#clearFolderButton = this.#element.querySelector('.clear-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');

        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderButton, 'getAppResultDirectory');

        // Change button text to "파일 복사"
        this.#processButton.textContent = '파일 복사';

        this.#processButton.addEventListener('click', async () => {
            log('파일 복사 버튼 클릭됨.');
            const selectedLi = currentSelectedElements.get(this.#sectionName);

            if (!selectedLi) {
                log('복사할 파일을 먼저 선택하세요.');
                return;
            }

            const filename = selectedLi.textContent; // Filename from text content
            if (!filename) {
                log('선택된 파일의 이름을 찾을 수 없습니다.');
                return;
            }

            try {
                // Get source (result) directory
                const sourceDir = await window.electronAPI.paths.getAppResultDirectory();
                const sourcePath = await window.electronAPI.path.join(sourceDir, filename);

                // Get destination (video) directory
                const destDir = await window.electronAPI.paths.getAppVideoDirectory(); // Assuming this API exists
                const destPath = await window.electronAPI.path.join(destDir, filename);

                log(`파일 복사 시작: ${sourcePath} -> ${destPath}`);
                const copyResult = await window.electronAPI.fs.copyFile(sourcePath, destPath); // Assuming this API exists

                if (copyResult.success) {
                    log(`✅ 파일 복사 성공: ${filename}`);
                } else {
                    log(`❌ 파일 복사 실패: ${copyResult.message}`);
                }
            } catch (error) {
                log(`[Error] 파일 복사 중 예외 발생: ${error.message}`);
            }
        });

        this.#clearFolderButton.addEventListener('click', async () => {
            if (!confirm('결과 폴더를 비우시겠습니까? 모든 파일이 삭제됩니다.')) return;

            try {
                const dirPath = await window.electronAPI.paths.getAppResultDirectory();
                const result = await window.electronAPI.fs.emptyDir(dirPath);
                if (result.success) {
                    log('결과 폴더를 비웠습니다.');
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
            const data = await window.electronAPI.paths.getResultFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading result files:', error);
            this.#listField.innerHTML = `<div class="error-message">결과 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }
}
