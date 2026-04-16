// Electron/renderer/js/runstep/section/splitSection.js

import { renderNestedList } from '../listRenderers.js';
import { setupOpenFolderButton } from '../util.js';
import { currentSelectedElements, applyHighlight, removeHighlight } from '../selectionHandler.js';
import { write as log } from '../../logger.js';

export class SplitSection {
    #element;
    #listField;
    #openFolderButton;
    #clearFolderButton;
    #processButton;
    #promptSelect;
    #sectionName = '스플릿';
    #translateSection = null;

    constructor(element) {
        this.#element = element;

        this.#listField = this.#element.querySelector('.list-field');
        this.#openFolderButton = this.#element.querySelector('.open-folder-button');
        this.#clearFolderButton = this.#element.querySelector('.clear-folder-button');
        this.#processButton = this.#element.querySelector('.process-button');
        this.#promptSelect = this.#element.querySelector('#runstep-split-prompt-select');

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

        this.#clearFolderButton.addEventListener('click', async () => {
            if (!confirm('스플릿 폴더를 비우시겠습니까? 모든 폴더와 파일이 삭제됩니다.')) return;

            try {
                const dirPath = await window.electronAPI.paths.getAppSplitDirectory();
                const result = await window.electronAPI.fs.emptyDir(dirPath);
                if (result.success) {
                    log('스플릿 폴더를 비웠습니다.');
                    this.refresh();
                } else {
                    log(`[Error] 폴더 비우기 실패: ${result.message}`);
                }
            } catch (error) {
                log(`[Error] 폴더 비우기 중 예외 발생: ${error.message}`);
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

        if (this.#promptSelect) {
            this.#promptSelect.addEventListener('change', async () => {
                const filename = this.#promptSelect.value;
                try {
                    await window.electronAPI.settings.saveSelectedRulePreset(filename);
                    if (filename && filename !== 'custom') {
                        const content = await window.electronAPI.settings.readRulePreset(filename);
                        await window.electronAPI.settings.saveRule(content);
                        log(`[UI] 번역 지침이 프리셋에서 로드되었습니다: ${filename}`);
                    }
                } catch (error) {
                    log(`[Error] 지침 변경 중 오류 발생: ${error.message}`);
                }
            });
        }
    }

    async refresh() {
        try {
            await this.#populatePromptSelect();
            const data = await window.electronAPI.paths.getSplitFiles();
            renderNestedList(this.#listField, data, this.#sectionName);
        } catch (error) {
            console.error('Error loading split files:', error);
            this.#listField.innerHTML = `<div class="error-message">스플릿 파일 로딩 중 오류가 발생했습니다.</div>`;
        }
    }

    async #populatePromptSelect() {
        if (!this.#promptSelect) return;

        try {
            const ruleFiles = await window.electronAPI.settings.getRuleFiles();
            const selectedPreset = await window.electronAPI.settings.loadSelectedRulePreset();

            this.#promptSelect.innerHTML = '';
            
            const customOption = document.createElement('option');
            customOption.value = 'custom';
            customOption.textContent = '직접 입력';
            this.#promptSelect.appendChild(customOption);

            ruleFiles.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                this.#promptSelect.appendChild(option);
            });

            if (selectedPreset) {
                const options = Array.from(this.#promptSelect.options);
                const exists = options.some(opt => opt.value === selectedPreset);
                this.#promptSelect.value = exists ? selectedPreset : 'custom';
            } else {
                this.#promptSelect.value = 'custom';
            }
        } catch (error) {
            log(`[Error] 지침 목록 로드 실패: ${error.message}`);
        }
    }
}
