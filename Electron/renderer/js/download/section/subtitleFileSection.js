// Electron/renderer/js/download/section/subtitleFileSection.js

import { renderFlatList } from '../listRenderers.js'; // 경로 수정
import { createItemClickHandler } from '../selectionHandler.js'; // 경로 수정

export class SubtitleFileSection {
    constructor(sectionElement) {
        this.sectionElement = sectionElement;
        this.listField = sectionElement.querySelector('#subtitleFileList');
        
        this.handleItemClick = createItemClickHandler(); // 이 섹션에 특화된 handleItemClick

        this.initialRender();
    }

    async initialRender() {
        if (this.listField) {
            try {
                // IPC를 통해 메인 프로세스에서 자막 파일 목록을 가져옵니다.
                // downloadPathMapping['자막 폴더 목록'].api 에 해당하는 IPC 호출을 가정합니다.
                const data = await window.electronAPI.pathGetSubtitleFiles();
                renderFlatList(this.listField, data, '자막 폴더 목록', this.handleItemClick);
            } catch (error) {
                console.error(`Error fetching subtitle files:`, error);
                this.listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading subtitle files: ${error.message}</div>`;
            }
        }
    }
}
