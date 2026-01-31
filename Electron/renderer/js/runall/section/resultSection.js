// Electron/renderer/js/runall/section/finalResultSection.js
import { write as log } from '../../logger.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../../runstep/selectionHandler.js';
import { renderFlatList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../../runstep/util.js';

export class ResultSection {
    #element;
    #listField;
    #moveFileBtn;
    #openFolderBtn;
    #sectionName = 'RunAll_Result'; // Unique name for selection map

    constructor(element) {
        this.#element = element;
        this.#listField = this.#element.querySelector('.list-field');
        this.#moveFileBtn = this.#element.querySelector('#move-file-btn');
        this.#openFolderBtn = this.#element.querySelector('#open-final-result-folder-button');
        
        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        setupOpenFolderButton(this.#openFolderBtn, 'getAppResultDirectory');

        this.#moveFileBtn.addEventListener('click', async () => {
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

        this.#listField.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li[data-type="file"]');
            if (!clickedLi) return;

            const previousSelected = currentSelectedElements.get(this.#sectionName);
            if (previousSelected && previousSelected !== clickedLi) {
                removeHighlight(previousSelected, false);
            }
            applyHighlight(clickedLi, false);
            currentSelectedElements.set(this.#sectionName, clickedLi);

            log(`선택됨 (${this.#sectionName}): ${clickedLi.textContent}`);
        });
    }

    async refresh() {
        try {
            const data = await window.electronAPI.paths.getResultFiles();
            renderFlatList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading final result files for runall:', error);
            this.#listField.innerHTML = `<div class="error-message">최종 결과 로딩 중 오류 발생</div>`;
        }
    }
}
