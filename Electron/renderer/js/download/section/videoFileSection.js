// Electron/renderer/js/download/section/videoFileSection.js

import { renderFlatList } from '../listRenderers.js'; // 경로 수정
import { createItemClickHandler } from '../selectionHandler.js'; // 경로 수정
import { setupOpenVideoFolderButton } from './videoFileButtonHandlers.js'; // Import the new button handlers

export class VideoFileSection {
    constructor(sectionElement) {
        this.sectionElement = sectionElement;
        this.listField = sectionElement.querySelector('#videoFileList');
        
        this.handleItemClick = createItemClickHandler(); // 이 섹션에 특화된 handleItemClick

        this.initialRender();
        setupOpenVideoFolderButton(this.sectionElement); // Setup button for this section
    }

    async initialRender() {
        if (this.listField) {
            try {
                // IPC를 통해 메인 프로세스에서 영상 파일 목록을 가져옵니다.
                // downloadPathMapping['영상 폴더 목록'].api 에 해당하는 IPC 호출을 가정합니다.
                const data = await window.electronAPI.paths.getVideoFiles(); // 변경
                renderFlatList(this.listField, data, '영상 폴더', this.handleItemClick);
            } catch (error) {
                console.error(`Error fetching video files:`, error);
                this.listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading video files: ${error.message}</div>`;
            }
        }
    }
}
