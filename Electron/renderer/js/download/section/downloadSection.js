// Electron/renderer/js/download/section/downloadSection.js

import { addUrl } from '../ipc_url.js'; // 경로 수정
import { addFlatListItem } from '../listRenderers.js'; // 경로 수정
import { createItemClickHandler } from '../selectionHandler.js'; // 경로 수정

export class DownloadSection {
    constructor(sectionElement, completeSection) {
        this.sectionElement = sectionElement;
        this.completeSection = completeSection; // Store the instance
        this.addUrlButton = sectionElement.querySelector('#add-url-button');
        this.urlInput = sectionElement.querySelector('#url-input');
        this.downloadUrlList = sectionElement.querySelector('#downloadUrlList');
        this.handleItemClick = createItemClickHandler();
        this.setupEventListeners();
        this.initialRender();
        this.setupIPCListeners(); // IPC 리스너 설정 추가
    }

    // 아이템 업데이트를 UI에 반영하는 헬퍼 메서드
    updateItemDisplay(itemData) {
        const { id, title, status } = itemData;
        const listItem = this.downloadUrlList.querySelector(`li[data-id="${id}"]`);

        if (listItem) {
            if (status === '완료') {
                // Move to completed section
                listItem.remove();
                if (this.completeSection) {
                    this.completeSection.addItem(itemData);
                }
            } else {
                // Just update the text
                listItem.textContent = `ID: ${id}, 제목: ${title}, 상태: ${status}`;
            }
            console.log(`[UI 업데이트] ID: ${id}, 제목: ${title}, 상태: ${status}`);
        }
    }

    setupEventListeners() {
        if (this.addUrlButton && this.urlInput && this.downloadUrlList) {
            this.addUrlButton.addEventListener('click', async () => {
                console.log('URL 추가 버튼 클릭됨 (DownloadSection)');
                const url = this.urlInput.value.trim();
                if (url) {
                    this.addUrlButton.disabled = true;
                    const newItem = await addUrl(url); 
                    if (newItem) {
                        console.log('URL 추가 완료:', newItem);
                        // downloadItems 배열 없이 바로 DOM에 추가
                        addFlatListItem(this.downloadUrlList, newItem, '영상 다운로드', this.handleItemClick);
                    }
                    this.urlInput.value = '';
                    this.addUrlButton.disabled = false;
                } else {
                    console.log('URL이 비어 있습니다.');
                }
            });
        }
    }

    initialRender() {
        // 초기 로드 시 기존에 추가된 downloadItems (가정)을 렌더링하는 로직이 있었으나,
        // 이제 downloadItems 배열이 없어졌으므로, 이 부분은 메인 프로세스에
        // 저장된 목록을 요청하는 방식으로 변경되어야 합니다.
        // 현재는 초기 로드 시에는 아무것도 렌더링하지 않습니다。
        // 추후 메인 프로세스에서 전체 대기열 목록을 가져오는 API가 필요할 수 있습니다.
    }

    setupIPCListeners() { // IPC 리스너 설정 메서드 추가
        if (window.electronAPI && window.electronAPI.urlManager && window.electronAPI.urlManager.onUpdateItem) {
            window.electronAPI.urlManager.onUpdateItem((itemData) => {
                this.updateItemDisplay(itemData);
            });
        }
    }
}
